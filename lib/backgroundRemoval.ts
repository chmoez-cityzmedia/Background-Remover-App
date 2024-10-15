import sharp from 'sharp';

export async function removeBackground(inputBuffer: Buffer): Promise<Buffer> {
  try {
    const image = sharp(inputBuffer);
    const { width, height, channels } = await image.metadata();

    if (!width || !height) {
      throw new Error('Invalid image dimensions');
    }

    const rawData = await image.raw().toBuffer();

    // Create a mask using edge detection and color difference
    const mask = await createMask(rawData, width, height, channels || 3);

    // Apply the mask to the original image
    return sharp(rawData, { raw: { width, height, channels: channels || 3 } })
      .joinChannel(mask)
      .png()
      .toBuffer();
  } catch (error) {
    console.error('Error in removeBackground:', error);
    throw error;
  }
}

async function createMask(data: Buffer, width: number, height: number, channels: number): Promise<Buffer> {
  const mask = Buffer.alloc(width * height);
  const threshold = 30; // Adjust this value to change sensitivity

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Simple edge detection
      const isEdge = isPixelEdge(data, x, y, width, height, channels, threshold);

      // Color difference from average background color
      const bgDiff = colorDifference([r, g, b], [255, 255, 255]); // Assuming white background

      // Combine edge detection and color difference
      const isForeground = isEdge || bgDiff > threshold;

      mask[y * width + x] = isForeground ? 255 : 0;
    }
  }

  return mask;
}

function isPixelEdge(data: Buffer, x: number, y: number, width: number, height: number, channels: number, threshold: number): boolean {
  const getPixel = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return [0, 0, 0];
    }
    const i = (y * width + x) * channels;
    return [data[i], data[i + 1], data[i + 2]];
  };

  const center = getPixel(x, y);
  const neighbors = [
    getPixel(x - 1, y),
    getPixel(x + 1, y),
    getPixel(x, y - 1),
    getPixel(x, y + 1),
  ];

  return neighbors.some(neighbor => colorDifference(center, neighbor) > threshold);
}

function colorDifference(color1: number[], color2: number[]): number {
  return Math.sqrt(
    Math.pow(color1[0] - color2[0], 2) +
    Math.pow(color1[1] - color2[1], 2) +
    Math.pow(color1[2] - color2[2], 2)
  );
}