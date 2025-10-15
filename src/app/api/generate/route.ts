import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

const MAX_DATA_LENGTH = 1000; 

function sanitizeInput(input: string): string {
    
    let sanitized = input.substring(0, MAX_DATA_LENGTH);
    
    sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    return sanitized;
}

async function generateQr(data: string): Promise<Buffer> {
    
    const qrBuffer = await QRCode.toBuffer(data, {
        errorCorrectionLevel: 'L',
        type: 'png',
        scale: 10,
        margin: 4,
        color: { dark: '#000000', light: '#ffffff' },
    });

    return qrBuffer;
}

export async function POST(request: NextRequest) {
    try {
        const { data } = await request.json();

        if (!data || typeof data !== 'string') {
            return NextResponse.json({ error: 'Datos de entrada inválidos.' }, { status: 400 });
        }
        
        const sanitizedData = sanitizeInput(data);

        if (sanitizedData.length === 0) {
            return NextResponse.json({ error: 'El contenido del QR no puede estar vacío después de la limpieza.' }, { status: 400 });
        }


        const qrImageBuffer = await generateQr(sanitizedData);
        
        const imageBlob = new Blob([qrImageBuffer as BlobPart], { type: 'image/png' });

        return new Response(imageBlob, { 
            headers: {
                'Content-Type': 'image/png',
                'Content-Length': qrImageBuffer.length.toString(), 
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
            status: 200,
        });

    } catch (error) {
        console.error('Error al generar el QR:', error);
        return NextResponse.json({ error: 'Error interno del servidor al generar el QR.' }, { status: 500 });
    }
}
