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
const MAX_PDF_SIZE_MB = 50;
const MAX_IMAGE_DIMENSION = 2000;
const CONVERSION_TIMEOUT_MS = 30000;
const MAX_PAGES = 10; // Batasan jumlah halaman
const DEFAULT_PAGE = 1;

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
  <rect width="200" height="200" fill="#f8d7da"/>
  <circle cx="100" cy="75" r="40" fill="none" stroke="#dc3545" stroke-width="8"/>
  <path d="M60,140 L140,140" stroke="#dc3545" stroke-width="8" stroke-linecap="round"/>
  <text x="100" y="180" font-family="Arial" font-size="14" fill="#dc3545" text-anchor="middle">
    PDF Conversion Failed
  </text>
</svg>`;

// Tambahkan SVG untuk end of page
const endOfPageSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f8f9fa"/>
  <text x="100" y="80" font-family="Arial" font-size="16" fill="#6c757d" text-anchor="middle">
    End of PDF
  </text>
  <text x="100" y="110" font-family="Arial" font-size="14" fill="#6c757d" text-anchor="middle">
    No more pages available
  </text>
  <path d="M70,140 L130,140" stroke="#6c757d" stroke-width="2" stroke-dasharray="4"/>
</svg>`;

// Fungsi helper untuk set common headers
function setCommonHeaders(headers: Headers) {
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Content-Security-Policy', "default-src 'self'; img-src 'self' data: blob:;");
    headers.set('X-Content-Type-Options', 'nosniff');
}

// Fungsi helper untuk return error image
function returnErrorImage(message: string = 'Conversion failed') {
    const response = new NextResponse(errorImageSvg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-store',
            'X-Error-Message': message
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
            'X-Error-Message': 'End of PDF pages'
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

export async function GET(request: Request) {
    let pdfBuffer: Buffer | null = null;
    const { searchParams } = new URL(request.url);
    
    try {
        // Validasi parameter wajib
        const pdfUrl = searchParams.get('url');
        if (!pdfUrl) {
            return NextResponse.json({ 
                error: 'URL parameter wajib diisi' 
            }, { status: 400 });
        }

        // Decode URL jika perlu
        const decodedUrl = decodeURIComponent(pdfUrl);
        
        await checkDependencies();

        const getTotalPages = searchParams.get('total') === 'true';
        
        // Single fetch PDF dengan URL yang sudah di-decode
        const pdfResponse = await fetchPDF(decodedUrl);

        const arrayBuffer = await pdfResponse.arrayBuffer();
        pdfBuffer = Buffer.from(arrayBuffer);
        
        // Get total pages
        if (getTotalPages) {
            try {
                const pageCount = await getPDFPageCount(pdfBuffer);
                return Response.json({
                    totalPages: pageCount,
                    message: 'Success get total pages'
                });
            } catch (error) {
                console.error('PDF parse error:', error);
                return Response.json({ 
                    error: 'Gagal membaca total halaman PDF',
                    totalPages: 0
                }, { status: 500 });
            }
        }

        // Parse page parameter dengan lebih baik
        const pageStr = searchParams.get('page');
        let pageNum = 1; // Default ke halaman 1

        if (pageStr) {
            pageNum = parseInt(pageStr);
            if (isNaN(pageNum) || pageNum < 1) {
                return returnErrorImage('Invalid page number');
            }

            // Validasi halaman tidak melebihi total
            const totalPages = await getPDFPageCount(pdfBuffer);
            if (pageNum > totalPages) {
                return returnEndOfPageImage();
            }
        }

        const options = {
            density: 300,
            format: "png",
            width: Math.min(1200, MAX_IMAGE_DIMENSION),
            height: Math.min(1700, MAX_IMAGE_DIMENSION),
            preserveAspectRatio: true,
            saveFilename: "",
            savePath: "",
            returnBuffer: true
        };

        // Konversi single page
        const convert = fromBuffer(pdfBuffer, options);
        const result = await Promise.race([
            convert(pageNum, { responseType: "buffer" }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new PDFConversionError('Konversi timeout', 504)), 
                CONVERSION_TIMEOUT_MS)
            )
        ]) as ConversionResult;

        if (!result?.buffer) {
            return returnErrorImage('Konversi gagal: tidak ada output');
        }

        // Return image buffer
        const response = new NextResponse(result.buffer, {
            headers: {
                'Content-Type': 'image/png',
                'Content-Length': result.buffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000'
            }
        });
        setCommonHeaders(response.headers);
        return response;

    } catch (error) {
        console.error('PDF conversion error:', error);
        
        // Return appropriate error response
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const statusCode = error instanceof PDFConversionError ? error.statusCode : 500;

        return !searchParams.get('pages') ?
            returnErrorImage(errorMessage) :
            NextResponse.json({ error: errorMessage }, { status: statusCode });
    } finally {
        pdfBuffer = null;
    }
}