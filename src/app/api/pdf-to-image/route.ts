// app/api/pdf-to-image/route.ts
import { execSync } from 'child_process';
import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { fromBuffer } from 'pdf2pic';

// Tambahkan custom error
class PDFConversionError extends Error {
    constructor(message: string, public statusCode: number = 500) {
        super(message);
        this.name = 'PDFConversionError';
    }
}

// Improve fungsi check dependencies
async function checkDependencies() {
    const dependencies = [
        { cmd: 'gm version', name: 'GraphicsMagick' },
        { cmd: 'gs --version', name: 'Ghostscript' }
    ];

    for (const dep of dependencies) {
        try {
            execSync(dep.cmd);
        } catch (error) {
            throw new PDFConversionError(`${dep.name} tidak terinstall`, 500);
        }
    }
}

// Tambah konstanta
const MAX_PDF_SIZE_MB =100;
const MAX_IMAGE_DIMENSION = 2000;
const CONVERSION_TIMEOUT_MS = 30000;
const MAX_PAGES = 10; // Batasan jumlah halaman
const DEFAULT_PAGE = 1;
const MAX_PAGES_PER_REQUEST = 5; // Maksimal halaman per request
const PAGE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB per halaman

// Modifikasi validateParams
function validateParams(pdfUrl: string | null, pages: number[]) {
    if (!pdfUrl) {
        throw new PDFConversionError('URL parameter wajib diisi', 400);
    }
    if (pages.some(p => p < 1)) {
        throw new PDFConversionError('Nomor halaman tidak valid', 400);
    }
    if (pages.length > MAX_PAGES) {
        throw new PDFConversionError(`Maksimal ${MAX_PAGES} halaman per request`, 400);
    }
}

interface ConversionResult {
  buffer: Buffer;
  text: string;
  density: number;
  width: number;
  height: number;
}

// Tambah interface untuk response multiple pages
interface MultiPageResponse {
  pages: {
    pageNumber: number;
    imageUrl: string;
    width: number;
    height: number;
  }[];
  totalPages: number;
  hasMore: boolean;
  nextPage?: number;
}

// Fungsi untuk validasi dan fetch PDF
async function fetchPDF(url: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
        // Validasi URL
        const validUrl = new URL(url);
        if (!validUrl.protocol.startsWith('http')) {
            throw new PDFConversionError('URL tidak valid', 400);
        }

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/pdf',
                'User-Agent': 'Mozilla/5.0 (compatible; PDFConverter/1.0)'
            }
        });

        if (!response.ok) {
            throw new PDFConversionError(
                `Gagal mengakses PDF: ${response.status} ${response.statusText}`, 
                response.status
            );
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('pdf')) {
            throw new PDFConversionError('URL bukan file PDF', 400);
        }

        return response;

    } catch (error: unknown) {
        if (error instanceof PDFConversionError) throw error;
        if (error instanceof Error && error.name === 'AbortError') {
            throw new PDFConversionError('Timeout saat mengunduh PDF', 504);
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new PDFConversionError('Gagal mengunduh PDF: ' + message, 500);
    } finally {
        clearTimeout(timeout);
    }
}

// Tambahkan error SVG template
const errorImageSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs>
        <style>
            .error-bg { fill: #f8d7da; }
            .error-circle { fill: none; stroke: #dc3545; stroke-width: 8; }
            .error-line { stroke: #dc3545; stroke-width: 8; stroke-linecap: round; }
            .error-text { font-family: Arial; font-size: 14px; fill: #dc3545; text-anchor: middle; }
        </style>
    </defs>
    <rect class="error-bg" width="200" height="200"/>
    <circle class="error-circle" cx="100" cy="75" r="40"/>
    <path class="error-line" d="M60,140 L140,140"/>
    <text class="error-text" x="100" y="180">PDF Conversion Failed</text>
</svg>`;

// Tambahkan SVG untuk end of page
const endOfPageSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs>
        <style>
            .end-bg { fill: #f8f9fa; }
            .end-text { font-family: Arial; fill: #6c757d; text-anchor: middle; }
            .end-text-large { font-size: 16px; }
            .end-text-small { font-size: 14px; }
            .end-line { stroke: #6c757d; stroke-width: 2; stroke-dasharray: 4; }
        </style>
    </defs>
    <rect class="end-bg" width="200" height="200"/>
    <text class="end-text end-text-large" x="100" y="80">End of PDF</text>
    <text class="end-text end-text-small" x="100" y="110">No more pages available</text>
    <path class="end-line" d="M70,140 L130,140"/>
</svg>`;

// Tambahkan fungsi untuk get inline CSS header
function getInlineCSSHeader() {
    return `
        .error-bg { fill: #f8d7da; }
        .error-circle { fill: none; stroke: #dc3545; stroke-width: 8; }
        .error-line { stroke: #dc3545; stroke-width: 8; stroke-linecap: round; }
        .error-text { font-family: Arial; font-size: 14px; fill: #dc3545; text-anchor: middle; }
        .end-bg { fill: #f8f9fa; }
        .end-text { font-family: Arial; fill: #6c757d; text-anchor: middle; }
        .end-text-large { font-size: 16px; }
        .end-text-small { font-size: 14px; }
        .end-line { stroke: #6c757d; stroke-width: 2; stroke-dasharray: 4; }
    `.replace(/\s+/g, ' ').trim();
}

// Fungsi helper untuk set common headers
function setCommonHeaders(headers: Headers) {
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Content-Security-Policy', `
        default-src 'self';
        img-src 'self' data: blob:;
        style-src 'self' 'unsafe-inline';
        font-src 'self';
    `.replace(/\s+/g, ' ').trim());
    headers.set('X-Content-Type-Options', 'nosniff');
}

// Fungsi helper untuk return error image
function returnErrorImage(message: string = 'Conversion failed') {
    const response = new NextResponse(errorImageSvg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-store',
            'X-Error-Message': message,
            'X-CSS-Styles': getInlineCSSHeader()
        }
    });
    setCommonHeaders(response.headers);
    return response;
}

// Fungsi helper untuk return end of page image
function returnEndOfPageImage() {
    const response = new NextResponse(endOfPageSvg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=31536000',
            'X-Error-Message': 'End of PDF pages',
            'X-CSS-Styles': getInlineCSSHeader()
        }
    });
    setCommonHeaders(response.headers);
    return response;
}

// Fungsi untuk get total pages menggunakan pdf-lib
async function getPDFPageCount(buffer: Buffer): Promise<number> {
    try {
        const pdfDoc = await PDFDocument.load(buffer);
        return pdfDoc.getPageCount();
    } catch (error) {
        console.error('Error getting PDF page count:', error);
        throw new Error('Failed to get PDF page count');
    }
}

// Tambahkan fungsi untuk membersihkan memory
async function cleanupResources(pdfBuffer: Buffer | null) {
    try {
        if (pdfBuffer) {
            pdfBuffer = null;
        }
        if (typeof global.gc === 'function') {
            global.gc(); // Panggil garbage collector jika tersedia
        }
    } catch (error) {
        console.warn('Gagal membersihkan resources:', error);
    }
}

function validatePdfUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        // Whitelist domain yang diizinkan
        const allowedDomains = ['example.com', 'trusted-domain.com'];
        const domain = parsedUrl.hostname;
        
        return (
            allowedDomains.some(allowed => domain.endsWith(allowed)) &&
            parsedUrl.protocol.startsWith('https') &&
            url.toLowerCase().endsWith('.pdf')
        );
    } catch {
        return false;
    }
}

async function fetchWithRetry(url: string, maxRetries = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) return response;
        } catch (error) {
            lastError = error;
            // Tunggu sebentar sebelum retry
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
        }
    }
    
    throw lastError;
}

interface ConversionMetrics {
    startTime: number;
    endTime: number;
    pdfSize: number;
    pageCount: number;
    success: boolean;
}

function logMetrics(metrics: ConversionMetrics) {
    const duration = metrics.endTime - metrics.startTime;
    console.log({
        type: 'pdf_conversion_metrics',
        duration_ms: duration,
        pdf_size_mb: metrics.pdfSize / (1024 * 1024),
        page_count: metrics.pageCount,
        success: metrics.success,
        timestamp: new Date().toISOString()
    });
}

// Tambahkan batasan ukuran chunk saat streaming PDF
const MAX_CHUNK_SIZE = 1024 * 1024; // 1MB

async function streamPdfContent(response: Response): Promise<Buffer> {
    const chunks: Buffer[] = [];
    let totalSize = 0;
    
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Cannot read response body');
    
    while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        
        totalSize += value.length;
        if (totalSize > MAX_PDF_SIZE_MB * 1024 * 1024) {
            throw new PDFConversionError('PDF terlalu besar');
        }
        
        chunks.push(Buffer.from(value));
    }
    
    return Buffer.concat(chunks);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const pdfUrl = searchParams.get('url');
    let pages: number[] = [];
    
    // Jika parameter pages ada, gunakan itu. Jika tidak, set ke null untuk menandakan semua halaman
    const pagesParam = searchParams.get('pages');
    if (pagesParam) {
        pages = pagesParam.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
    }
    
    try {
        await checkDependencies();
        validateParams(pdfUrl, pages);
        
        const pdfResponse = await fetchPDF(pdfUrl!);
        const pdfBuffer = await streamPdfContent(pdfResponse);
        
        // Dapatkan total halaman PDF
        const totalPages = await getPDFPageCount(pdfBuffer);
        
        // Jika pages kosong (tidak ada parameter pages), generate array untuk semua halaman
        if (pages.length === 0) {
            pages = Array.from({length: totalPages}, (_, i) => i + 1);
        }
        
        // Batasi jumlah halaman sesuai MAX_PAGES
        if (pages.length > MAX_PAGES) {
            pages = pages.slice(0, MAX_PAGES);
        }
        
        // Konversi PDF ke gambar
        const options = {
            responseType: "buffer" as const,
            density: 300,
            saveFilename: "untitled",
            format: "png",
            width: MAX_IMAGE_DIMENSION,
            height: MAX_IMAGE_DIMENSION
        };
        
        const convert = fromBuffer(pdfBuffer);
        const results = await Promise.all(
            pages.map(async (pageNumber) => {
                try {
                    if (pageNumber > totalPages) {
                        return null;
                    }
                    return await convert(pageNumber, options);
                } catch (error) {
                    console.error(`Error converting page ${pageNumber}:`, error);
                    return null;
                }
            })
        );
        
        // Filter hasil yang null dan format response
        const validResults = results.filter((r): r is ConversionResult => r !== null);
        const response: MultiPageResponse = {
            pages: validResults.map((result, index) => ({
                pageNumber: pages[index],
                imageUrl: `data:image/png;base64,${result.buffer.toString('base64')}`,
                width: result.width,
                height: result.height
            })),
            totalPages,
            hasMore: Math.max(...pages) < totalPages,
            nextPage: Math.max(...pages) < totalPages ? Math.max(...pages) + 1 : undefined
        };
        
        await cleanupResources(pdfBuffer);
        
        return NextResponse.json(response, {
            headers: {
                'Cache-Control': 'public, max-age=3600',
                'Content-Type': 'application/json',
            }
        });
        
    } catch (error) {
        console.error('PDF conversion error:', error);
        if (error instanceof PDFConversionError) {
            return NextResponse.json(
                { error: error.message },
                { status: error.statusCode }
            );
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}