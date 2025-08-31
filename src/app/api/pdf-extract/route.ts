import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    try {
      // Use pdf-parse for text extraction
      const pdf = await import('pdf-parse');
      const data = await pdf.default(buffer);
      
      // Clean and format the extracted text
      let extractedText = data.text
        .replace(/\r?\n/g, '\n')  // Normalize line endings
        .replace(/\n\s*\n\s*\n/g, '\n\n')  // Remove excessive blank lines
        .replace(/^\s+|\s+$/g, '')  // Trim whitespace
        .replace(/\f/g, '\n\n');  // Replace form feeds with double newlines
      
      // If text is too short, try to get more info
      if (extractedText.length < 50) {
        extractedText = `[PDF: ${file.name}]\n\n${extractedText}\n\n[Note: This PDF may contain primarily images or have limited extractable text content.]`;
      }
      
      return NextResponse.json({
        success: true,
        text: extractedText,
        metadata: {
          pages: data.numpages,
          info: data.info,
          filename: file.name,
          size: file.size
        }
      });
      
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      
      // Fallback response for PDFs that can't be parsed
      const fallbackText = `[PDF Content: ${file.name}]

This PDF file could not be automatically processed for text extraction. This may occur with:
- Image-based PDFs (scanned documents)  
- Password-protected PDFs
- Corrupted or unusual PDF formats

Please manually review the content and classify accordingly.

File size: ${Math.round(file.size / 1024)} KB`;
      
      return NextResponse.json({
        success: false,
        text: fallbackText,
        error: 'PDF text extraction failed',
        metadata: {
          filename: file.name,
          size: file.size
        }
      });
    }
    
  } catch (error) {
    console.error('PDF extraction API error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF file' },
      { status: 500 }
    );
  }
}