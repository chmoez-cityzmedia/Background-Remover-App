import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { removeBackground } from '@/lib/backgroundRemoval';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const image = formData.get('image_file') as File;

  if (!image) {
    return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
  }

  try {
    const buffer = await image.arrayBuffer();
    const inputBuffer = Buffer.from(buffer);

    // Use the advanced background removal algorithm
    const outputBuffer = await removeBackground(inputBuffer);

    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.error('Error processing image:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: `Failed to process image: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred while processing the image' }, { status: 500 });
  }
}