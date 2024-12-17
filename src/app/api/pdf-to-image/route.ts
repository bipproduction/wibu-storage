// app/api/pdf-to-image/route.ts
import { NextResponse } from 'next/server';
import { fromPath, fromBuffer } from 'pdf2pic';
import { execSync } from 'child_process';

// Fungsi untuk mengecek dependensi
function checkDependencies() {
    try {
        execSync('gm version');
        execSync('gs --version');
        return true;
    } catch (error) {
        console.error('Dependencies check failed:', error);
        return false;
    }
}

export async function GET(request: Request) {
    try {
        // Cek dependensi terlebih dahulu
        if (!checkDependencies()) {
            return NextResponse.json({
                error: 'Required dependencies (GraphicsMagick or Ghostscript) are not installed'
            }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const pdfUrl = searchParams.get('url');
        const page = parseInt(searchParams.get('page') || '1');
        
        if (!pdfUrl) {
            return NextResponse.json(
                { error: 'URL parameter is required' },
                { status: 400 }
            );
        }

        // Fetch PDF content
        const response = await fetch(pdfUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Setup options
        const options = {
            density: 300,           // DPI untuk kualitas gambar
            saveFilename: "temp",   // Nama file temporary
            savePath: "/tmp",       // Simpan di temporary directory
            format: "png",          // Output format
            width: 1200,           // Max width
            height: 1700,          // Max height
            preserveAspectRatio: true // Menjaga aspek rasio
        };

        // Konversi PDF menggunakan buffer
        const convert = fromBuffer(buffer, options);

        // Convert specific page
        const result = await convert(page, {
            responseType: "buffer" // Dapatkan hasil dalam bentuk buffer
        });

        // Jika tidak ada hasil
        if (!result || !result.buffer) {
            throw new Error('Conversion failed');
        }

        // Return hasil konversi
        return new NextResponse(result.buffer, {
            headers: {
                'Content-Type': 'image/png',
                'Content-Length': result.buffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000',
            },
        });

    } catch (error) {
        console.error('PDF conversion error:', error);
        return NextResponse.json(
            { error: 'Failed to convert PDF: ' + (error as Error).message },
            { status: 500 }
        );
    }
}