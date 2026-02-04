

# Plan: Improve Scanned PDF OCR Conversion Quality

## Overview

This plan implements high-impact improvements to the OCR pipeline for scanned bank statements, focusing on resolution, preprocessing, Tesseract configuration, and deskewing. These changes target the most common quality issues: blurry text, tilted scans, and poor character recognition.

---

## Current Pipeline Analysis

| Stage | Current Implementation | Issue |
|-------|------------------------|-------|
| **Render DPI** | Scale 1.5 (~108 DPI) | Far below Tesseract's optimal 300 DPI |
| **Preprocessing** | Grayscale → Contrast 1.4 → Noise removal → Otsu threshold | Missing sharpening step |
| **Tesseract Config** | Default PSM (auto) | Not optimized for tabular bank data |
| **Deskewing** | Not implemented | Tilted scans reduce accuracy |

---

## Changes Required

### 1. Increase Render Resolution to 300 DPI

**File: `src/lib/pdfProcessor.ts`**

Update the `renderPageToCanvas` scale from 1.5 to 4.0:

```typescript
// Line 137: Change scale from 1.5 to 4.0
const canvas = await renderPageToCanvas(page, 4.0); // 4.0 scale ≈ 288 DPI
```

**Why:** Tesseract.js performs best at 300 DPI. Current 1.5 scale (~108 DPI) causes blurry character recognition. Scale 4.0 on a 72 DPI PDF base = ~288 DPI.

---

### 2. Add Sharpening to Preprocessing Pipeline

**File: `src/lib/imagePreprocessing.ts`**

Update the `preprocessForOCR` function to include sharpening before thresholding:

```typescript
export function preprocessForOCR(canvas: HTMLCanvasElement): HTMLCanvasElement {
  // ... existing code ...
  
  // Apply preprocessing pipeline
  imageData = convertToGrayscale(imageData);
  imageData = adjustContrast(imageData, 1.4);
  
  // ADD: Sharpen to enhance edge definition
  imageData = sharpen(imageData, 0.3);
  
  // Remove light noise
  imageData = removeNoise(imageData, 1);
  
  // Apply adaptive threshold
  const threshold = calculateOtsuThreshold(imageData);
  imageData = applyThreshold(imageData, threshold);
  
  // ... rest of function
}
```

**Why:** The `sharpen()` function already exists but isn't used. Adding it improves edge definition for character recognition.

---

### 3. Configure Tesseract PSM for Tabular Data

**File: `src/lib/ocrService.ts`**

Update worker initialization to use PSM 6 (assume uniform text block):

```typescript
export async function getWorker(languages: string[] = ['eng']): Promise<Worker> {
  // ... existing worker setup ...
  
  workerInstance = await tesseract.createWorker(languages.join('+'), 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        // Progress tracking
      }
    },
  });
  
  // ADD: Configure for tabular bank statement layout
  await workerInstance.setParameters({
    tessedit_pageseg_mode: '6', // PSM 6: Assume uniform block of text
    preserve_interword_spaces: '1', // Keep column spacing
  });
  
  currentLanguages = [...languages];
  return workerInstance;
}
```

**Why:** Bank statements have consistent tabular layouts. PSM 6 tells Tesseract to expect uniform text blocks rather than auto-detecting mixed content.

---

### 4. Implement Deskewing for Tilted Scans

**File: `src/lib/imagePreprocessing.ts`**

Add a new deskew function using projection profile analysis:

```typescript
/**
 * Detect skew angle using horizontal projection profile
 * Returns angle in degrees (-45 to +45)
 */
export function detectSkewAngle(imageData: ImageData): number {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  
  let bestAngle = 0;
  let maxVariance = 0;
  
  // Test angles from -10 to +10 degrees in 0.5 degree steps
  for (let angle = -10; angle <= 10; angle += 0.5) {
    const radians = (angle * Math.PI) / 180;
    const projection = new Array(height).fill(0);
    
    // Calculate horizontal projection at this angle
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Rotate point
        const rotatedY = Math.round(
          y * Math.cos(radians) - x * Math.sin(radians) + height / 2
        );
        
        if (rotatedY >= 0 && rotatedY < height) {
          const idx = (y * width + x) * 4;
          // Count dark pixels (text)
          if (data[idx] < 128) {
            projection[rotatedY]++;
          }
        }
      }
    }
    
    // Calculate variance of projection
    const mean = projection.reduce((a, b) => a + b, 0) / height;
    const variance = projection.reduce((sum, val) => sum + (val - mean) ** 2, 0) / height;
    
    if (variance > maxVariance) {
      maxVariance = variance;
      bestAngle = angle;
    }
  }
  
  return bestAngle;
}

/**
 * Deskew an image by rotating to correct detected skew
 */
export function deskew(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const angle = detectSkewAngle(imageData);
  
  // Only deskew if angle is significant (> 0.5 degrees)
  if (Math.abs(angle) < 0.5) {
    console.log('[Deskew] Skew angle negligible, skipping rotation');
    return canvas;
  }
  
  console.log(`[Deskew] Detected skew angle: ${angle.toFixed(2)}°, applying correction`);
  
  // Create new canvas for rotated image
  const rotatedCanvas = document.createElement('canvas');
  const rotatedCtx = rotatedCanvas.getContext('2d');
  if (!rotatedCtx) return canvas;
  
  rotatedCanvas.width = canvas.width;
  rotatedCanvas.height = canvas.height;
  
  // Rotate around center
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radians = (-angle * Math.PI) / 180;
  
  rotatedCtx.fillStyle = 'white';
  rotatedCtx.fillRect(0, 0, canvas.width, canvas.height);
  rotatedCtx.translate(centerX, centerY);
  rotatedCtx.rotate(radians);
  rotatedCtx.drawImage(canvas, -centerX, -centerY);
  
  return rotatedCanvas;
}
```

**Update `preprocessForOCR` to include deskewing:**

```typescript
export function preprocessForOCR(canvas: HTMLCanvasElement): HTMLCanvasElement {
  // STEP 0: Deskew first (before other processing)
  let processedCanvas = deskew(canvas);
  
  const ctx = processedCanvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  let imageData = ctx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
  
  // ... rest of preprocessing pipeline ...
}
```

---

### 5. Add Scan Quality Validation

**File: `src/lib/imagePreprocessing.ts`**

Add quality checks before OCR processing:

```typescript
export interface ScanQualityReport {
  estimatedDPI: number;
  skewAngle: number;
  contrastScore: number;
  isAcceptable: boolean;
  issues: string[];
}

/**
 * Analyze scan quality before OCR
 */
export function analyzeScanQuality(canvas: HTMLCanvasElement): ScanQualityReport {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      estimatedDPI: 0,
      skewAngle: 0,
      contrastScore: 0,
      isAcceptable: false,
      issues: ['Cannot analyze canvas'],
    };
  }
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const issues: string[] = [];
  
  // Estimate DPI from canvas size (assuming A4 paper)
  // A4 = 8.27" x 11.69", so if width represents ~8" at 300 DPI, width should be ~2400px
  const estimatedDPI = Math.round((canvas.width / 8.27));
  if (estimatedDPI < 150) {
    issues.push(`Low resolution: ~${estimatedDPI} DPI (recommended: 300+)`);
  }
  
  // Detect skew
  const skewAngle = detectSkewAngle(imageData);
  if (Math.abs(skewAngle) > 7) {
    issues.push(`Significant skew: ${skewAngle.toFixed(1)}° (will be auto-corrected)`);
  }
  
  // Calculate contrast score
  const contrastScore = calculateContrastScore(imageData);
  if (contrastScore < 30) {
    issues.push(`Low contrast: ${contrastScore.toFixed(0)}% (may affect accuracy)`);
  }
  
  return {
    estimatedDPI,
    skewAngle,
    contrastScore,
    isAcceptable: estimatedDPI >= 150 && contrastScore >= 20,
    issues,
  };
}

function calculateContrastScore(imageData: ImageData): number {
  const data = imageData.data;
  let min = 255, max = 0;
  
  // Sample pixels for performance
  const step = Math.max(1, Math.floor(data.length / 40000));
  for (let i = 0; i < data.length; i += step * 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    min = Math.min(min, gray);
    max = Math.max(max, gray);
  }
  
  return ((max - min) / 255) * 100;
}
```

---

## Summary of Changes

| File | Changes |
|------|---------|
| `src/lib/pdfProcessor.ts` | Increase render scale from 1.5 to 4.0 |
| `src/lib/imagePreprocessing.ts` | Add sharpening, implement deskewing, add quality analysis |
| `src/lib/ocrService.ts` | Configure Tesseract PSM 6 for tabular data |

---

## Expected Quality Improvements

| Issue | Before | After |
|-------|--------|-------|
| Blurry characters | ~108 DPI | ~288 DPI |
| Soft edges | No sharpening | Sharpened edges |
| Tilted scans | Not corrected | Auto-deskewed |
| Layout detection | Auto PSM | PSM 6 (tabular) |
| Quality feedback | None | Pre-scan quality report |

---

## Processing Flow After Changes

```text
┌─────────────────────────────────────────────────────────────────┐
│                     IMPROVED OCR PIPELINE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐                                           │
│  │  1. Render PDF   │  Scale 4.0 (≈288 DPI)                     │
│  │     to Canvas    │  vs previous 1.5 (≈108 DPI)               │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                           │
│  │  2. Quality      │  Check: DPI, Skew, Contrast               │
│  │     Analysis     │  Warn user if issues detected             │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                           │
│  │  3. Deskew       │  Detect skew angle (-10° to +10°)         │
│  │                  │  Rotate to correct if > 0.5°              │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                           │
│  │  4. Preprocess   │  Invert (if dark bg) → Grayscale →        │
│  │                  │  Contrast 1.4 → Sharpen 0.3 →             │
│  │                  │  Denoise → Otsu Threshold                 │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                           │
│  │  5. Tesseract    │  PSM 6 (uniform text block)               │
│  │     OCR          │  Preserve interword spaces                │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                           │
│  │  6. OCR          │  Date corrections, numeric fixes,         │
│  │     Corrections  │  currency symbols, financial terms        │
│  └──────────────────┘                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Trade-offs

| Improvement | Benefit | Cost |
|-------------|---------|------|
| Higher DPI (4.0 scale) | Much better character recognition | ~3x memory per page, ~2x processing time |
| Deskewing | Corrects tilted scans | ~100ms additional per page |
| Sharpening | Clearer character edges | Minimal overhead |
| PSM 6 | Better table column alignment | May reduce accuracy on non-tabular docs |

---

## Verification After Implementation

1. Upload a low-quality scanned bank statement
2. Check console for quality analysis output
3. Verify OCR text accuracy vs previous results
4. Test with a tilted scan to verify deskewing works
5. Compare transaction extraction accuracy before/after

