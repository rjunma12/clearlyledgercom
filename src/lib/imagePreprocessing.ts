/**
 * Image Preprocessing Module for OCR Enhancement
 * Applies various filters to improve OCR accuracy on scanned documents
 */

/**
 * Convert image to grayscale
 */
export function convertToGrayscale(imageData: ImageData): ImageData {
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Use luminosity method for better results
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;     // R
    data[i + 1] = gray; // G
    data[i + 2] = gray; // B
    // Alpha remains unchanged
  }
  
  return imageData;
}

/**
 * Apply binary threshold (Otsu-like adaptive threshold)
 */
export function applyThreshold(imageData: ImageData, threshold: number = 0.5): ImageData {
  const data = imageData.data;
  const thresholdValue = threshold * 255;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i]; // Assuming already grayscale
    const binary = gray > thresholdValue ? 255 : 0;
    data[i] = binary;
    data[i + 1] = binary;
    data[i + 2] = binary;
  }
  
  return imageData;
}

/**
 * Calculate Otsu's threshold automatically
 */
export function calculateOtsuThreshold(imageData: ImageData): number {
  const histogram = new Array(256).fill(0);
  const data = imageData.data;
  const totalPixels = data.length / 4;
  
  // Build histogram
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(data[i]);
    histogram[gray]++;
  }
  
  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }
  
  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let threshold = 0;
  
  for (let i = 0; i < 256; i++) {
    wB += histogram[i];
    if (wB === 0) continue;
    
    wF = totalPixels - wB;
    if (wF === 0) break;
    
    sumB += i * histogram[i];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    
    const variance = wB * wF * Math.pow(mB - mF, 2);
    
    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = i;
    }
  }
  
  return threshold / 255;
}

/**
 * Adjust image contrast
 */
export function adjustContrast(imageData: ImageData, factor: number = 1.5): ImageData {
  const data = imageData.data;
  const intercept = 128 * (1 - factor);
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(factor * data[i] + intercept);
    data[i + 1] = clamp(factor * data[i + 1] + intercept);
    data[i + 2] = clamp(factor * data[i + 2] + intercept);
  }
  
  return imageData;
}

/**
 * Adjust image brightness
 */
export function adjustBrightness(imageData: ImageData, offset: number = 0): ImageData {
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + offset);
    data[i + 1] = clamp(data[i + 1] + offset);
    data[i + 2] = clamp(data[i + 2] + offset);
  }
  
  return imageData;
}

/**
 * Apply sharpening filter using unsharp mask
 */
export function sharpen(imageData: ImageData, amount: number = 0.5): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const original = new Uint8ClampedArray(data);
  
  // Simple 3x3 sharpening kernel
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let ki = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += original[idx] * kernel[ki++];
          }
        }
        
        const idx = (y * width + x) * 4 + c;
        data[idx] = clamp(original[idx] * (1 - amount) + sum * amount);
      }
    }
  }
  
  return imageData;
}

/**
 * Remove noise using median filter
 */
export function removeNoise(imageData: ImageData, radius: number = 1): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const original = new Uint8ClampedArray(data);
  
  const windowSize = (2 * radius + 1) ** 2;
  const values: number[] = new Array(windowSize);
  
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      for (let c = 0; c < 3; c++) {
        let vi = 0;
        
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            values[vi++] = original[idx];
          }
        }
        
        values.sort((a, b) => a - b);
        const median = values[Math.floor(windowSize / 2)];
        
        const idx = (y * width + x) * 4 + c;
        data[idx] = median;
      }
    }
  }
  
  return imageData;
}

/**
 * Invert colors (useful for dark backgrounds)
 */
export function invertColors(imageData: ImageData): ImageData {
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  
  return imageData;
}

/**
 * Detect if image has dark background
 */
export function hasDarkBackground(imageData: ImageData): boolean {
  const data = imageData.data;
  let totalBrightness = 0;
  const sampleSize = Math.min(data.length / 4, 10000);
  const step = Math.floor(data.length / 4 / sampleSize);
  
  for (let i = 0; i < data.length; i += step * 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    totalBrightness += gray;
  }
  
  const avgBrightness = totalBrightness / sampleSize;
  return avgBrightness < 128;
}

/**
 * Complete preprocessing pipeline for OCR
 */
export function preprocessForOCR(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Check for dark background and invert if needed
  if (hasDarkBackground(imageData)) {
    imageData = invertColors(imageData);
  }
  
  // Apply preprocessing pipeline
  imageData = convertToGrayscale(imageData);
  imageData = adjustContrast(imageData, 1.4);
  
  // Remove light noise
  imageData = removeNoise(imageData, 1);
  
  // Apply adaptive threshold
  const threshold = calculateOtsuThreshold(imageData);
  imageData = applyThreshold(imageData, threshold);
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Clamp value to 0-255 range
 */
function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}
