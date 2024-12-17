'use client'
import React from 'react';
import { Stack } from '@mantine/core';

const PDFViewer = ({ pdfUrl }: { pdfUrl: string }) => {
    return (
        <div style={{ 
            width: '100%', 
            height: '100vh', 
            display: 'flex', 
            flex: '1 1 auto'
        }}>
            <object 
                data={pdfUrl}
                type="application/pdf"
                style={{ 
                    width: '100%', 
                    height: '100%',
                    flex: '1 1 auto'
                }}
            >
                <p>Your browser does not support PDFs. 
                   <a href={pdfUrl}>Download the PDF</a>
                </p>
            </object>
        </div>
    );
};

export default function Page() {
    return (
        <Stack style={{ 
            height: '100vh', 
            flex: '1 1 auto',
            minHeight: 0 
        }}>
            <PDFViewer pdfUrl="https://wibu-storage.wibudev.com/api/files/cm4jcpmnz002d121otgwkzv2a" />
        </Stack>
    );
}