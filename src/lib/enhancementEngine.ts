import { EnhancementOption } from '@/components/EnhancementOptions';
import { pipeline } from '@huggingface/transformers';

// Quality assessment metrics
interface QualityMetrics {
  psnr: number;  // Peak Signal-to-Noise Ratio
  ssim: number;  // Structural Similarity Index
  improvement: number; // Overall improvement score (0-100)
}

export interface EnhancementResult {
  before: string;
  after: string;
  metrics?: QualityMetrics;
  appliedEnhancements: string[];
}

export interface EnhancementStrengthParams {
  detailLevel: number;      // 0-100
  colorIntensity: number;   // 0-100
  noiseReduction: number;   // 0-100
  sharpness: number;        // 0-100
  brightness: number;       // -100 to 100
  contrast: number;         // -100 to 100
}

interface ModelState {
  superResolution: any;
  denoise: any;
  initialized: boolean;
  initializing: boolean;
}

const DEFAULT_ENHANCEMENT_PARAMS: EnhancementStrengthParams = {
  detailLevel: 70,
  colorIntensity: 60,
  noiseReduction: 50,
  sharpness: 65,
  brightness: 0,
  contrast: 10
};

// Quality thresholds for image enhancement
const QUALITY_THRESHOLDS = {
  minPSNR: 25,
  minSSIM: 0.8,
  minImprovement: 15
};

// Maximum iterations for enhancement process
const MAX_ITERATIONS = 3;

class EnhancementEngine {
  private modelState: ModelState = {
    superResolution: null,
    denoise: null,
    initialized: false,
    initializing: false
  };

  private defaultParams: EnhancementStrengthParams = DEFAULT_ENHANCEMENT_PARAMS;

  public async initialize(): Promise<boolean> {
    if (this.modelState.initialized) return true;
    if (this.modelState.initializing) return false;

    this.modelState.initializing = true;
    
    try {
      console.log("Initializing Real-ESRGAN super-resolution model...");
      
      // Initialize super-resolution model (Real-ESRGAN)
      this.modelState.superResolution = await pipeline(
        'image-to-image',
        'Xenova/real-esrgan-x4-v3'
      );
      
      console.log("Initializing SwinIR denoising model...");
      
      // Initialize denoising model (SwinIR)
      this.modelState.denoise = await pipeline(
        'image-to-image',
        'Xenova/swin-ir-color-denoise'
      );
      
      this.modelState.initialized = true;
      this.modelState.initializing = false;
      
      console.log("Enhancement models initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize enhancement models:", error);
      this.modelState.initializing = false;
      return false;
    }
  }

  private async computeQualityMetrics(originalImageData: string, enhancedImageData: string): Promise<QualityMetrics> {
    // Implementation of PSNR and SSIM calculation
    // This is a simplified version - in production, use dedicated libraries
    
    // Load both images
    const originalImg = await this.loadImage(originalImageData);
    const enhancedImg = await this.loadImage(enhancedImageData);
    
    // Calculate metrics
    const { psnr, ssim } = await this.calculateImageMetrics(originalImg, enhancedImg);
    
    // Calculate overall improvement score (weighted combination of metrics)
    const improvement = Math.min(100, Math.max(0, 
      (psnr - 20) * 2 + (ssim - 0.5) * 100
    ));
    
    return { psnr, ssim, improvement };
  }
  
  private async loadImage(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }
  
  private async calculateImageMetrics(img1: HTMLImageElement, img2: HTMLImageElement): Promise<{ psnr: number, ssim: number }> {
    // Create canvas to compare images
    const canvas1 = document.createElement('canvas');
    const canvas2 = document.createElement('canvas');
    const width = Math.min(img1.width, img2.width);
    const height = Math.min(img1.height, img2.height);
    
    canvas1.width = canvas2.width = width;
    canvas1.height = canvas2.height = height;
    
    const ctx1 = canvas1.getContext('2d')!;
    const ctx2 = canvas2.getContext('2d')!;
    
    ctx1.drawImage(img1, 0, 0, width, height);
    ctx2.drawImage(img2, 0, 0, width, height);
    
    const imageData1 = ctx1.getImageData(0, 0, width, height);
    const imageData2 = ctx2.getImageData(0, 0, width, height);
    
    // Calculate PSNR (Peak Signal-to-Noise Ratio)
    const psnr = this.calculatePSNR(imageData1.data, imageData2.data);
    
    // Calculate SSIM (Structural Similarity Index)
    const ssim = this.calculateSSIM(imageData1.data, imageData2.data, width, height);
    
    return { psnr, ssim };
  }
  
  private calculatePSNR(img1Data: Uint8ClampedArray, img2Data: Uint8ClampedArray): number {
    let mse = 0;
    const len = img1Data.length;
    
    for (let i = 0; i < len; i += 4) {
      // Calculate squared difference for RGB channels
      for (let c = 0; c < 3; c++) {
        const diff = img1Data[i + c] - img2Data[i + c];
        mse += diff * diff;
      }
    }
    
    // Normalize MSE
    mse /= (len / 4 * 3);
    
    // Avoid log(0)
    if (mse === 0) return 100;
    
    // PSNR formula: 10 * log10(MAX^2 / MSE) where MAX is 255 for 8-bit images
    const psnr = 10 * Math.log10(255 * 255 / mse);
    return psnr;
  }
  
  private calculateSSIM(img1Data: Uint8ClampedArray, img2Data: Uint8ClampedArray, width: number, height: number): number {
    // Simplified SSIM implementation - in production use a robust implementation
    // This is a basic version focusing on luminance comparison
    
    // Extract luminance (approximate using average of RGB)
    const luma1 = new Float32Array(width * height);
    const luma2 = new Float32Array(width * height);
    
    for (let i = 0, j = 0; i < img1Data.length; i += 4, j++) {
      luma1[j] = (img1Data[i] + img1Data[i + 1] + img1Data[i + 2]) / 3;
      luma2[j] = (img2Data[i] + img2Data[i + 1] + img2Data[i + 2]) / 3;
    }
    
    // Calculate mean
    const mean1 = luma1.reduce((sum, val) => sum + val, 0) / luma1.length;
    const mean2 = luma2.reduce((sum, val) => sum + val, 0) / luma2.length;
    
    // Calculate variance and covariance
    let variance1 = 0, variance2 = 0, covariance = 0;
    
    for (let i = 0; i < luma1.length; i++) {
      const diff1 = luma1[i] - mean1;
      const diff2 = luma2[i] - mean2;
      
      variance1 += diff1 * diff1;
      variance2 += diff2 * diff2;
      covariance += diff1 * diff2;
    }
    
    variance1 /= luma1.length;
    variance2 /= luma2.length;
    covariance /= luma1.length;
    
    // Constants for stability
    const C1 = (0.01 * 255) ** 2;
    const C2 = (0.03 * 255) ** 2;
    
    // SSIM formula
    const ssim = 
      ((2 * mean1 * mean2 + C1) * (2 * covariance + C2)) / 
      ((mean1 ** 2 + mean2 ** 2 + C1) * (variance1 + variance2 + C2));
    
    return ssim;
  }

  private async segmentImage(imageData: string): Promise<{ regions: { x: number, y: number, width: number, height: number, needsEnhancement: boolean }[] }> {
    // In a production system, this would use ML-based segmentation
    // For this demo, we'll use a simple grid-based approach
    
    const img = await this.loadImage(imageData);
    const width = img.width;
    const height = img.height;
    
    // Create a canvas to analyze the image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    // Divide image into grid cells
    const gridSize = 4; // 4x4 grid
    const regions = [];
    
    const cellWidth = Math.floor(width / gridSize);
    const cellHeight = Math.floor(height / gridSize);
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const regionX = x * cellWidth;
        const regionY = y * cellHeight;
        const regionWidth = (x === gridSize - 1) ? width - regionX : cellWidth;
        const regionHeight = (y === gridSize - 1) ? height - regionY : cellHeight;
        
        // Get pixel data for this region
        const pixelData = ctx.getImageData(regionX, regionY, regionWidth, regionHeight);
        
        // Analyze region to see if it needs enhancement
        const needsEnhancement = this.analyzeRegionQuality(pixelData);
        
        regions.push({
          x: regionX,
          y: regionY,
          width: regionWidth,
          height: regionHeight,
          needsEnhancement
        });
      }
    }
    
    return { regions };
  }
  
  private analyzeRegionQuality(pixelData: ImageData): boolean {
    // Calculate metrics to determine if a region needs enhancement
    // This is a simplified version - real implementation would use more sophisticated analysis
    
    const data = pixelData.data;
    let entropy = 0;
    let contrast = 0;
    let noisiness = 0;
    
    // Histogram for entropy calculation
    const histogram = new Array(256).fill(0);
    
    // Calculate histogram and basic stats
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Convert to grayscale
      const gray = Math.floor((r + g + b) / 3);
      histogram[gray]++;
      
      // Measure local contrast if we're not at the edge
      if (i % (pixelData.width * 4) < pixelData.width * 4 - 4 && i < data.length - pixelData.width * 4) {
        const rightGray = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
        const bottomGray = (data[i + pixelData.width * 4] + data[i + pixelData.width * 4 + 1] + data[i + pixelData.width * 4 + 2]) / 3;
        
        contrast += Math.abs(gray - rightGray) + Math.abs(gray - bottomGray);
      }
    }
    
    // Normalize histogram and calculate entropy
    const total = (pixelData.width * pixelData.height);
    for (let i = 0; i < 256; i++) {
      if (histogram[i] > 0) {
        const p = histogram[i] / total;
        entropy -= p * Math.log2(p);
      }
    }
    
    // Normalize contrast
    contrast /= (total * 2);
    
    // Determine if region needs enhancement based on metrics
    // Low entropy (flat regions) or low contrast might need enhancement
    const needsEnhancement = entropy < 5 || contrast < 15 || noisiness > 0.1;
    
    return needsEnhancement;
  }

  public async enhance(
    image: File, 
    option: EnhancementOption,
    params: EnhancementStrengthParams = this.defaultParams
  ): Promise<EnhancementResult> {
    if (!this.modelState.initialized) {
      await this.initialize();
    }

    // Create original image URL for "before" image
    const beforeImageUrl = URL.createObjectURL(image);
    
    // Load image data
    const originalImageElement = await this.loadImage(beforeImageUrl);
    
    // Convert to canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = originalImageElement.width;
    canvas.height = originalImageElement.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(originalImageElement, 0, 0);
    
    // Get image data
    let processedImageData = canvas.toDataURL('image/jpeg', 0.95);
    let bestResult = processedImageData;
    let bestMetrics: QualityMetrics | undefined;
    let appliedEnhancements: string[] = [];
    
    // Perform enhancement with iterative improvement
    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      console.log(`Starting enhancement iteration ${iteration + 1}/${MAX_ITERATIONS}`);
      
      // Apply enhancement based on selected option or auto-detection
      processedImageData = await this.applyEnhancement(processedImageData, option, params);
      
      // Compute quality metrics
      const metrics = await this.computeQualityMetrics(beforeImageUrl, processedImageData);
      console.log(`Enhancement metrics:`, metrics);
      
      // If this is the first iteration or if the metrics are better than the previous best
      if (!bestMetrics || metrics.improvement > bestMetrics.improvement) {
        bestResult = processedImageData;
        bestMetrics = metrics;
        
        // If the improvement is already good enough, we can stop
        if (metrics.improvement > QUALITY_THRESHOLDS.minImprovement * 1.5) {
          console.log('Achieved excellent enhancement, stopping early');
          break;
        }
      } else {
        // If metrics are worse than previous, we've reached diminishing returns
        console.log('Enhancement quality decreased, stopping iterations');
        break;
      }
      
      // Check if we've met minimum quality thresholds
      if (bestMetrics.psnr > QUALITY_THRESHOLDS.minPSNR && 
          bestMetrics.ssim > QUALITY_THRESHOLDS.minSSIM &&
          bestMetrics.improvement > QUALITY_THRESHOLDS.minImprovement) {
        console.log('Met quality thresholds, stopping iterations');
        break;
      }
    }
    
    // If the best result doesn't meet minimum improvement, revert to original
    if (bestMetrics && bestMetrics.improvement < QUALITY_THRESHOLDS.minImprovement) {
      console.log('Enhancement did not meet minimum improvement threshold, reverting to original');
      bestResult = beforeImageUrl;
      appliedEnhancements = ['Original (no significant improvement possible)'];
    }
    
    // Create result object
    const result: EnhancementResult = {
      before: beforeImageUrl,
      after: bestResult,
      metrics: bestMetrics,
      appliedEnhancements
    };
    
    return result;
  }

  private async applyEnhancement(
    imageData: string, 
    option: EnhancementOption,
    params: EnhancementStrengthParams
  ): Promise<string> {
    if (!this.modelState.initialized) {
      throw new Error('Enhancement engine not initialized');
    }

    let enhancedImageData = imageData;
    const appliedEnhancements: string[] = [];
    
    try {
      // Handle enhancement based on option
      switch (option) {
        case 'auto': {
          console.log('Applying auto enhancement');
          
          // Segment image to find regions that need enhancement
          const { regions } = await this.segmentImage(imageData);
          
          // If most regions need enhancement, apply global enhancement
          const needsEnhancementCount = regions.filter(r => r.needsEnhancement).length;
          
          if (needsEnhancementCount > regions.length * 0.5) {
            console.log('Applying global enhancement based on image analysis');
            
            // Super-resolution with Real-ESRGAN if image seems low quality
            enhancedImageData = await this.applySuperResolution(enhancedImageData);
            appliedEnhancements.push('Super Resolution (Real-ESRGAN)');
            
            // Apply noise reduction if needed
            enhancedImageData = await this.applyNoiseReduction(enhancedImageData, params.noiseReduction);
            appliedEnhancements.push('Noise Reduction (SwinIR)');
            
            // Apply color enhancement
            enhancedImageData = await this.applyColorEnhancement(enhancedImageData, params.colorIntensity);
            appliedEnhancements.push('Color Enhancement');
            
            // Apply sharpening
            enhancedImageData = await this.applySharpening(enhancedImageData, params.sharpness);
            appliedEnhancements.push('Detail Sharpening');
          } else {
            console.log('Applying selective regional enhancement');
            
            // Selective enhancement of regions
            enhancedImageData = await this.applySelectiveEnhancement(imageData, regions, params);
            appliedEnhancements.push('Selective Regional Enhancement');
          }
          break;
        }
        
        case 'hdr': {
          console.log('Applying HDR enhancement');
          
          // Apply HDR-like effect
          enhancedImageData = await this.applyHDREffect(imageData, params);
          appliedEnhancements.push('HDR Enhancement');
          break;
        }
        
        case 'night': {
          console.log('Applying night mode enhancement');
          
          // Apply night mode enhancement
          enhancedImageData = await this.applyNightModeEnhancement(imageData, params);
          appliedEnhancements.push('Night Mode Enhancement');
          break;
        }
        
        case 'portrait': {
          console.log('Applying portrait enhancement');
          
          // Apply portrait enhancement
          enhancedImageData = await this.applyPortraitEnhancement(imageData, params);
          appliedEnhancements.push('Portrait Enhancement');
          break;
        }
        
        case 'color': {
          console.log('Applying color enhancement');
          
          // Apply color enhancement
          enhancedImageData = await this.applyColorPop(imageData, params);
          appliedEnhancements.push('Color Pop Enhancement');
          break;
        }
        
        case 'detail': {
          console.log('Applying detail enhancement');
          
          // Apply detail enhancement using super-resolution
          enhancedImageData = await this.applySuperResolution(imageData);
          appliedEnhancements.push('Super Resolution (Real-ESRGAN)');
          
          // Apply sharpening for extra detail
          enhancedImageData = await this.applySharpening(enhancedImageData, params.sharpness * 1.5);
          appliedEnhancements.push('Advanced Detail Sharpening');
          break;
        }
        
        case 'style': {
          console.log('Applying style transfer');
          
          // Apply style transfer
          enhancedImageData = await this.applyStyleTransfer(imageData, params);
          appliedEnhancements.push('Cinematic Style Transfer');
          break;
        }
      }
      
      console.log(`Applied enhancements: ${appliedEnhancements.join(', ')}`);
    } catch (error) {
      console.error('Error during enhancement:', error);
      // If enhancement fails, return the original image
      return imageData;
    }
    
    return enhancedImageData;
  }

  private async applySelectiveEnhancement(
    imageData: string, 
    regions: { x: number, y: number, width: number, height: number, needsEnhancement: boolean }[],
    params: EnhancementStrengthParams
  ): Promise<string> {
    // Load the image
    const img = await this.loadImage(imageData);
    
    // Create a canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    // Process each region that needs enhancement
    for (const region of regions) {
      if (region.needsEnhancement) {
        // Extract region
        const regionData = ctx.getImageData(region.x, region.y, region.width, region.height);
        
        // Create a temporary canvas for this region
        const regionCanvas = document.createElement('canvas');
        regionCanvas.width = region.width;
        regionCanvas.height = region.height;
        
        const regionCtx = regionCanvas.getContext('2d')!;
        regionCtx.putImageData(regionData, 0, 0);
        
        // Convert to data URL for processing
        const regionDataUrl = regionCanvas.toDataURL('image/jpeg', 0.95);
        
        // Apply enhancements to this region
        let enhancedRegionDataUrl = regionDataUrl;
        
        // Apply noise reduction
        enhancedRegionDataUrl = await this.applyNoiseReduction(enhancedRegionDataUrl, params.noiseReduction);
        
        // Apply sharpening
        enhancedRegionDataUrl = await this.applySharpening(enhancedRegionDataUrl, params.sharpness);
        
        // Apply color enhancement if needed
        enhancedRegionDataUrl = await this.applyColorEnhancement(enhancedRegionDataUrl, params.colorIntensity);
        
        // Load enhanced region back
        const enhancedRegionImg = await this.loadImage(enhancedRegionDataUrl);
        
        // Draw the enhanced region back to the main canvas
        ctx.drawImage(enhancedRegionImg, region.x, region.y, region.width, region.height);
      }
    }
    
    // Return the enhanced image
    return canvas.toDataURL('image/jpeg', 0.95);
  }

  private async applySuperResolution(imageData: string): Promise<string> {
    try {
      if (!this.modelState.superResolution) {
        throw new Error('Super-resolution model not initialized');
      }
      
      console.log('Applying super-resolution with Real-ESRGAN');
      
      // Load image
      const img = await this.loadImage(imageData);
      
      // Process with Real-ESRGAN
      const result = await this.modelState.superResolution(img.src);
      
      return result.output;
    } catch (error) {
      console.error('Error applying super-resolution:', error);
      return imageData;
    }
  }

  private async applyNoiseReduction(imageData: string, strength: number): Promise<string> {
    try {
      if (!this.modelState.denoise) {
        throw new Error('Denoising model not initialized');
      }
      
      console.log(`Applying noise reduction with SwinIR (strength: ${strength})`);
      
      // Load image
      const img = await this.loadImage(imageData);
      
      // Process with SwinIR
      const result = await this.modelState.denoise(img.src);
      
      // Blend with original based on strength
      return this.blendImages(imageData, result.output, strength / 100);
    } catch (error) {
      console.error('Error applying noise reduction:', error);
      return imageData;
    }
  }

  private async applyColorEnhancement(imageData: string, strength: number): Promise<string> {
    // Load the image
    const img = await this.loadImage(imageData);
    
    // Create a canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    
    // Calculate saturation adjustment factor
    const satFactor = 1 + (strength / 100);
    
    // Apply color enhancement
    for (let i = 0; i < data.length; i += 4) {
      // Convert RGB to HSL
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        
        h /= 6;
      }
      
      // Adjust saturation
      s = Math.min(1, s * satFactor);
      
      // Convert back to RGB
      let r1, g1, b1;
      
      if (s === 0) {
        r1 = g1 = b1 = l; // achromatic
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r1 = this.hue2rgb(p, q, h + 1/3);
        g1 = this.hue2rgb(p, q, h);
        b1 = this.hue2rgb(p, q, h - 1/3);
      }
      
      // Set the adjusted RGB values
      data[i] = Math.round(r1 * 255);
      data[i + 1] = Math.round(g1 * 255);
      data[i + 2] = Math.round(b1 * 255);
    }
    
    // Put the modified image data back
    ctx.putImageData(imgData, 0, 0);
    
    // Return the enhanced image
    return canvas.toDataURL('image/jpeg', 0.95);
  }
  
  private hue2rgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }

  private async applySharpening(imageData: string, strength: number): Promise<string> {
    // Load the image
    const img = await this.loadImage(imageData);
    
    // Create a canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    // Apply unsharp masking for sharpening
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const sharpened = this.unsharpMask(imgData, strength / 100);
    
    ctx.putImageData(sharpened, 0, 0);
    
    // Return the sharpened image
    return canvas.toDataURL('image/jpeg', 0.95);
  }
  
  private unsharpMask(imgData: ImageData, amount: number): ImageData {
    const width = imgData.width;
    const height = imgData.height;
    const data = new Uint8ClampedArray(imgData.data);
    
    // Create a blurred version using a simple box blur
    const blurred = this.boxBlur(imgData, 1);
    const blurredData = blurred.data;
    
    // Apply unsharp mask
    const radius = 1;
    const threshold = 10;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        
        // For each color channel
        for (let c = 0; c < 3; c++) {
          // Calculate the difference between original and blurred
          const diff = data[i + c] - blurredData[i + c];
          
          // Apply threshold and amount
          if (Math.abs(diff) > threshold) {
            data[i + c] = Math.min(255, Math.max(0, data[i + c] + diff * amount));
          }
        }
      }
    }
    
    return new ImageData(data, width, height);
  }
  
  private boxBlur(imgData: ImageData, radius: number): ImageData {
    const width = imgData.width;
    const height = imgData.height;
    const data = new Uint8ClampedArray(imgData.data);
    const result = new Uint8ClampedArray(data);
    
    // Horizontal pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        // Box blur kernel
        for (let kx = -radius; kx <= radius; kx++) {
          const px = x + kx;
          if (px >= 0 && px < width) {
            const i = (y * width + px) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
        
        // Set pixel value
        const i = (y * width + x) * 4;
        result[i] = r / count;
        result[i + 1] = g / count;
        result[i + 2] = b / count;
      }
    }
    
    // Vertical pass
    const temp = new Uint8ClampedArray(result);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        // Box blur kernel
        for (let ky = -radius; ky <= radius; ky++) {
          const py = y + ky;
          if (py >= 0 && py < height) {
            const i = (py * width + x) * 4;
            r += temp[i];
            g += temp[i + 1];
            b += temp[i + 2];
            count++;
          }
        }
        
        // Set pixel value
        const i = (y * width + x) * 4;
        result[i] = r / count;
        result[i + 1] = g / count;
        result[i + 2] = b / count;
        // Keep alpha channel
        result[i + 3] = data[i + 3];
      }
    }
    
    return new ImageData(result, width, height);
  }

  private async applyHDREffect(imageData: string, params: EnhancementStrengthParams): Promise<string> {
    // Load the image
    const img = await this.loadImage(imageData);
    
    // Create a canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    
    // Apply HDR tone mapping effect
    const exposure = 1.3 + (params.brightness / 200);
    const contrast = 1.2 + (params.contrast / 200);
    const saturation = 1.1 + (params.colorIntensity / 200);
    
    // Tone mapping parameters
    const gamma = 1.0;
    
    // Apply local contrast enhancement
    this.localContrastEnhancement(imgData, 10, 0.3);
    
    // Apply tone mapping to RGB channels
    for (let i = 0; i < data.length; i += 4) {
      // Apply exposure adjustment
      let r = data[i] * exposure;
      let g = data[i + 1] * exposure;
      let b = data[i + 2] * exposure;
      
      // Apply contrast adjustment
      r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
      g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
      b = ((b / 255 - 0.5) * contrast + 0.5) * 255;
      
      // Apply gamma correction
      r = Math.pow(r / 255, 1 / gamma) * 255;
      g = Math.pow(g / 255, 1 / gamma) * 255;
      b = Math.pow(b / 255, 1 / gamma) * 255;
      
      // Ensure values are in valid range
      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }
    
    // Apply saturation adjustment
    this.adjustSaturation(imgData, saturation);
    
    // Put modified image data back to canvas
    ctx.putImageData(imgData, 0, 0);
    
    // Return enhanced image
    return canvas.toDataURL('image/jpeg', 0.95);
  }
  
  private localContrastEnhancement(imgData: ImageData, radius: number, amount: number): void {
    const width = imgData.width;
    const height = imgData.height;
    const data = imgData.data;
    
    // Create a blurred version for local contrast detection
    const blurred = this.boxBlur(imgData, radius);
    const blurredData = blurred.data;
    
    // Apply local contrast enhancement
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        
        // For each color channel
        for (let c = 0; c < 3; c++) {
          const original = data[i + c];
          const blur = blurredData[i + c];
          
          // Calculate local contrast
          const localContrast = original - blur;
          
          // Apply enhancement
          data[i + c] = Math.min(255, Math.max(0, original + localContrast * amount));
        }
      }
    }
  }
  
  private adjustSaturation(imgData: ImageData, saturationFactor: number): void {
    const data = imgData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Convert RGB to HSL
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        
        h /= 6;
      }
      
      // Adjust saturation
      s = Math.min(1, s * saturationFactor);
      
      // Convert back to RGB
      let r1, g1, b1;
      
      if (s === 0) {
        r1 = g1 = b1 = l; // achromatic
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r1 = this.hue2rgb(p, q, h + 1/3);
        g1 = this.hue2rgb(p, q, h);
        b1 = this.hue2rgb(p, q, h - 1/3);
      }
      
      // Set the adjusted RGB values
      data[i] = Math.round(r1 * 255);
      data[i + 1] = Math.round(g1 * 255);
      data[i + 2] = Math.round(b1 * 255);
    }
  }
  
  private async applyNightModeEnhancement(imageData: string, params: EnhancementStrengthParams): Promise<string> {
    // Load the image
    const img = await this.loadImage(imageData);
    
    // Create a canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    
    // First apply noise reduction (high strength)
    const denoisedImageData = await this.applyNoiseReduction(imageData, params.noiseReduction * 1.5);
    const denoisedImg = await this.loadImage(denoisedImageData);
    
    // Redraw the denoised image
    ctx.drawImage(denoisedImg, 0, 0);
    
    // Get updated image data
    const updatedImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const updatedData = updatedImgData.data;
    
    // Apply brightness boost
    const brightnessBoost = 1 + (params.brightness / 100);
    
    // Apply night enhancement effect (blue tint, brightness boost, etc.)
    for (let i = 0; i < updatedData.length; i += 4) {
      // Increase brightness in shadows
      const r = updatedData[i];
      const g = updatedData[i + 1];
      const b = updatedData[i + 2];
      
      // Calculate luminance
      const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      
      // Apply stronger enhancement to dark areas
      const shadowBoost = 1 + (1 - luminance) * 0.5;
      
      // Apply blue tint to shadows (typical of night photos)
      const blueTint = 1 + (1 - luminance) * 0.1;
      
      // Apply transformations
      updatedData[i] = Math.min(255, r * brightnessBoost * shadowBoost);
      updatedData[i + 1] = Math.min(255, g * brightnessBoost * shadowBoost);
      updatedData[i + 2] = Math.min(255, b * brightnessBoost * shadowBoost * blueTint);
    }
    
    // Put modified image data back to canvas
    ctx.putImageData(updatedImgData, 0, 0);
    
    // Return enhanced image
    return canvas.toDataURL('image/jpeg', 0.95);
  }
  
  private async applyPortraitEnhancement(imageData: string, params: EnhancementStrengthParams): Promise<string> {
    // First apply skin smoothing (noise reduction)
    const smoothedImageData = await this.applyNoiseReduction(imageData, params.noiseReduction * 0.8);
    
    // Apply subtle sharpening to maintain details
    const sharpenedImageData = await this.applySharpening(smoothedImageData, params.sharpness * 0.7);
    
    // Apply subtle color enhancement
    const colorEnhancedImageData = await this.applyColorEnhancement(sharpenedImageData, params.colorIntensity * 0.9);
    
    // Load the image for final adjustments
    const img = await this.loadImage(colorEnhancedImageData);
    
    // Create a canvas for final processing
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    // Apply a subtle vignette effect (darken edges, focusing on the subject)
    this.applyVignette(ctx, img.width, img.height, 0.8, 0.15);
    
    // Return enhanced portrait
    return canvas.toDataURL('image/jpeg', 0.95);
  }
  
  private applyVignette(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number, falloff: number): void {
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.sqrt(width * width + height * height) / 2
    );
    
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1 - falloff, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${amount})`);
    
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
  }
  
  private async applyColorPop(imageData: string, params: EnhancementStrengthParams): Promise<string> {
    // Load the image
    const img = await this.loadImage(imageData);
    
    // Create a canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    
    // Apply vibrance (selective saturation increase)
    const saturationBoost = params.colorIntensity / 50;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      
      // Convert RGB to HSL
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        
        h /= 6;
      }
      
      // Apply selective saturation (vibrance)
      // Increase saturation more for less saturated colors
      const saturationIncrease = saturationBoost * (1 - s);
      s = Math.min(1, s + saturationIncrease);
      
      // Convert back to RGB
      let r1, g1, b1;
      
      if (s === 0) {
        r1 = g1 = b1 = l; // achromatic
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r1 = this.hue2rgb(p, q, h + 1/3);
        g1 = this.hue2rgb(p, q, h);
        b1 = this.hue2rgb(p, q, h - 1/3);
      }
      
      // Set the adjusted RGB values
      data[i] = Math.round(r1 * 255);
      data[i + 1] = Math.round(g1 * 255);
      data[i + 2] = Math.round(b1 * 255);
    }
    
    // Apply contrast enhancement
    const contrastFactor = 1 + (params.contrast / 200);
    
    for (let i = 0; i < data.length; i += 4) {
      // Apply contrast adjustment
      for (let c = 0; c < 3; c++) {
        const value = data[i + c];
        const normalized = value / 255;
        const adjusted = ((normalized - 0.5) * contrastFactor + 0.5) * 255;
        data[i + c] = Math.min(255, Math.max(0, adjusted));
      }
    }
    
    // Put modified image data back to canvas
    ctx.putImageData(imgData, 0, 0);
    
    // Return enhanced image
    return canvas.toDataURL('image/jpeg', 0.95);
  }
  
  private async applyStyleTransfer(imageData: string, params: EnhancementStrengthParams): Promise<string> {
    // This is a simplified style transfer. In a real app, this would use a neural network model
    // Apply a combination of effects to create a cinematic look
    
    // First, apply color grading
    let processedImage = await this.applyCinematicColorGrading(imageData, params);
    
    // Apply vignette effect
    const img = await this.loadImage(processedImage);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    // Apply a cinematic vignette
    this.applyVignette(ctx, img.width, img.height, 0.4, 0.3);
    
    // Apply letterbox for cinematic aspect ratio (optional)
    if (params.detailLevel > 80) {
      this.applyLetterbox(ctx, img.width, img.height);
    }
    
    // Return stylized image
    return canvas.toDataURL('image/jpeg', 0.95);
  }
  
  private async applyCinematicColorGrading(imageData: string, params: EnhancementStrengthParams): Promise<string> {
    // Load the image
    const img = await this.loadImage(imageData);
    
    // Create a canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    
    // Apply cinematic color grading - slightly teal shadows, orange highlights
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate luminance
      const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      
      // Teal shadows, orange highlights
      if (luminance < 0.5) {
        // Shadows - add teal (blue-green)
        data[i] = Math.max(0, r * 0.9);
        data[i + 1] = Math.min(255, g * 1.05);
        data[i + 2] = Math.min(255, b * 1.1);
      } else {
        // Highlights - add orange
        data[i] = Math.min(255, r * 1.1);
        data[i + 1] = Math.min(255, g * 1.05);
        data[i + 2] = Math.max(0, b * 0.9);
      }
    }
    
    // Apply contrast and saturation adjustment
    const contrastAmount = 1.2;
    const saturationAmount = 1.1;
    
    for (let i = 0; i < data.length; i += 4) {
      // Apply contrast
      for (let c = 0; c < 3; c++) {
        const value = data[i + c];
        const normalized = value / 255;
        const contrasted = ((normalized - 0.5) * contrastAmount + 0.5) * 255;
        data[i + c] = Math.min(255, Math.max(0, contrasted));
      }
      
      // Convert to HSL for saturation adjustment
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        
        h /= 6;
      }
      
      // Apply saturation adjustment
      s = Math.min(1, s * saturationAmount);
      
      // Convert back to RGB
      if (s === 0) {
        data[i] = data[i + 1] = data[i + 2] = Math.round(l * 255);
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        data[i] = Math.round(this.hue2rgb(p, q, h + 1/3) * 255);
        data[i + 1] = Math.round(this.hue2rgb(p, q, h) * 255);
        data[i + 2] = Math.round(this.hue2rgb(p, q, h - 1/3) * 255);
      }
    }
    
    // Put modified image data back to canvas
    ctx.putImageData(imgData, 0, 0);
    
    // Return graded image
    return canvas.toDataURL('image/jpeg', 0.95);
  }
  
  private applyLetterbox(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Standard cinematic aspect ratio is 2.35:1
    const targetRatio = 2.35 / 1;
    const currentRatio = width / height;
    
    // If the image is already wider than cinematic ratio, no need to add letterbox
    if (currentRatio >= targetRatio) return;
    
    // Calculate letterbox height
    const targetHeight = width / targetRatio;
    const letterboxHeight = (height - targetHeight) / 2;
    
    // Draw black bars at top and bottom
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, letterboxHeight);
    ctx.fillRect(0, height - letterboxHeight, width, letterboxHeight);
  }
  
  private async blendImages(original: string, enhanced: string, blendFactor: number): Promise<string> {
    // Load both images
    const imgOriginal = await this.loadImage(original);
    const imgEnhanced = await this.loadImage(enhanced);
    
    // Create a canvas for blending
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(imgOriginal.width, imgEnhanced.width);
    canvas.height = Math.max(imgOriginal.height, imgEnhanced.height);
    
    const ctx = canvas.getContext('2d')!;
    
    // Draw original image
    ctx.drawImage(imgOriginal, 0, 0, canvas.width, canvas.height);
    
    // Get original image data
    const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Draw enhanced image
    ctx.drawImage(imgEnhanced, 0, 0, canvas.width, canvas.height);
    
    // Get enhanced image data
    const enhancedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Create result image data
    const resultData = ctx.createImageData(canvas.width, canvas.height);
    
    // Blend pixels
    for (let i = 0; i < resultData.data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        resultData.data[i + c] = 
          originalData.data[i + c] * (1 - blendFactor) + 
          enhancedData.data[i + c] * blendFactor;
      }
      
      // Keep alpha channel from enhanced image
      resultData.data[i + 3] = enhancedData.data[i + 3];
    }
    
    // Put blended image data back to canvas
    ctx.putImageData(resultData, 0, 0);
    
    // Return blended image
    return canvas.toDataURL('image/jpeg', 0.95);
  }
}

// Create singleton instance
export const enhancementEngine = new EnhancementEngine();
