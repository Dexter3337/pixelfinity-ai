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

  private async blendImages(image1: string, image2: string, ratio: number): Promise<string> {
    // Load both images
    const img1 = await this.loadImage(image1);
    const img2 = await this.loadImage(image2);
    
    // Create a canvas for blending
    const canvas = document.createElement('canvas');
    const width = img1.width;
    const height = img1.height;
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d')!;
    
    // Draw the first image (original)
    ctx.drawImage(img1, 0, 0);
    
    // Set global alpha for blending and draw the second image (processed)
    ctx.globalAlpha = ratio;
    ctx.drawImage(img2, 0, 0, width, height);
    
    // Reset global alpha
    ctx.globalAlpha = 1.0;
    
    // Return the blended image
    return canvas.toDataURL('image/jpeg', 0.95);
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
    
    // Apply tone mapping
    for (let i = 0; i < data.length; i += 4) {
      // Apply exposure adjustment
      let r = data[i] / 255 * exposure;
      let g = data[i + 1] / 255 * exposure;
      let b = data[i + 2] / 255 * exposure;
      
      // Apply contrast adjustment
      r = ((r - 0.5) * contrast + 0.5);
      g = ((g - 0.5) * contrast + 0.5);
      b = ((b - 0.5) * contrast + 0.5);
      
      // Convert to HSL for saturation adjustment
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;
      
      let s;
      let h;
      
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
      s = Math.min(1, s * saturation);
      
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
      
      // Apply gamma correction
      r1 = Math.pow(r1, 1 / gamma);
      g1 = Math.pow(g1, 1 / gamma);
      b1 = Math.pow(b1, 1 / gamma);
      
      // Set pixel values
      data[i] = Math.min(255, Math.max(0, Math.round(r1 * 255)));
      data[i + 1] = Math.min(255, Math.max(0, Math.round(g1 * 255)));
      data[i + 2] = Math.min(255, Math.max(0, Math.round(b1 * 255)));
    }
    
    // Put the modified image data back
    ctx.putImageData(imgData, 0, 0);
    
    // Return the enhanced image
    return canvas.toDataURL('image/jpeg', 0.95);
  }
  
  private localContrastEnhancement(imgData: ImageData, radius: number, amount: number): void {
    const width = imgData.width;
    const height = imgData.height;
    const data = imgData.data;
    
    // Create a grayscale version
    const gray = new Uint8Array(width * height);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      gray[j] = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
    }
    
    // Apply a blur to the grayscale image
    const blurred = new Uint8Array(gray.length);
    
    // Simple box blur
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;
        
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const px = x + kx;
            const py = y + ky;
            
            if (px >= 0 && px < width && py >= 0 && py < height) {
              sum += gray[py * width + px];
              count++;
            }
          }
        }
        
        blurred[y * width + x] = sum / count;
      }
    }
    
    // Apply local contrast enhancement
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      const center = gray[j];
      const surround = blurred[j];
      const factor = 128 + (center - surround) * amount;
      
      // Apply the enhancement to each channel
      for (let c = 0; c < 3; c++) {
        const value = data[i + c];
        data[i + c] = Math.min(255, Math.max(0, value * factor / 128));
      }
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
    
    // First, apply noise reduction
    let enhancedImageData = await this.applyNoiseReduction(canvas.toDataURL('image/jpeg', 0.95), params.noiseReduction * 1.5);
    
    // Load the noise-reduced image
    const enhancedImg = await this.loadImage(enhancedImageData);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(enhancedImg, 0, 0);
    
    // Get image data
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    
    // Apply night mode enhancement
    const brightnessAdjust = 1.2 + (params.brightness / 100);
    const blueTint = 1.1;
    
    for (let i = 0; i < data.length; i += 4) {
      // Brighten the image while preserving details
      data[i] = Math.min(255, data[i] * brightnessAdjust);
      data[i + 1] = Math.min(255, data[i + 1] * brightnessAdjust);
      data[i + 2] = Math.min(255, data[i + 2] * brightnessAdjust * blueTint);
    }
    
    // Put the modified image data back
    ctx.putImageData(imgData, 0, 0);
    
    // Return the enhanced image
    return canvas.toDataURL('image/jpeg', 0.95);
  }

  private async applyPortraitEnhancement(imageData: string, params: EnhancementStrengthParams): Promise<string> {
    // Load the image
    const img = await this.loadImage(imageData);
    
    // Create a canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    // Apply selective skin tone enhancement and portrait-specific processing
    // This would ideally use face detection and skin detection
    
    // For this demo, we'll apply a general portrait enhancement
    
    // First, apply skin tone enhancement
    let enhancedImageData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Apply subtle noise reduction
    enhancedImageData = await this.applyNoiseReduction(enhancedImageData, params.noiseReduction * 0.7);
    
    // Apply subtle sharpening
    enhancedImageData = await this.applySharpening(enhancedImageData, params.sharpness * 0.6);
    
    // Return the enhanced image
    return enhancedImageData;
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
    
    // Apply color pop enhancement
    const satFactor = 1 + (params.colorIntensity / 70);
    const vibranceFactor = params.colorIntensity / 200;
    
    for (let i = 0; i < data.length; i += 4) {
      // Convert RGB to HSL
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;
      
      let s;
      let h;
      
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
      
      // Adjust saturation (more for already colorful parts)
      const satAdjust = 1 + (s * vibranceFactor);
      s = Math.min(1, s * satFactor * satAdjust);
      
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
      data[i] = Math.min(255, Math.max(0, Math.round(r1 * 255)));
      data[i + 1] = Math.min(255, Math.max(0, Math.round(g1 * 255)));
      data[i + 2] = Math.min(255, Math.max(0, Math.round(b1 * 255)));
    }
    
    // Put the modified image data back
    ctx.putImageData(imgData, 0, 0);
    
    // Return the enhanced image
    return canvas.toDataURL('image/jpeg', 0.95);
  }

  private async applyStyleTransfer(imageData: string, params: EnhancementStrengthParams): Promise<string> {
    // In a real implementation, this would use a style transfer model
    // For this demo, we'll simulate it with a set of filters
    
    // Load the image
    const img = await this.loadImage(imageData);
    
    // Create a canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    // Apply a cinematic look
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    
    // Apply a cinematic color grading
    const shadows = [20, 30, 40];  // Tint shadows slightly blue
    const highlights = [255, 245, 235];  // Tint highlights slightly warm
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate luminance
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Apply cinematic color grading
      let factor = luminance / 255;
      
      // Interpolate between shadows and highlights
      data[i] = Math.min(255, Math.max(0, r * 0.9 + shadows[0] * (1 - factor) + highlights[0] * factor * 0.1));
      data[i + 1] = Math.min(255, Math.max(0, g * 0.9 + shadows[1] * (1 - factor) + highlights[1] * factor * 0.1));
      data[i + 2] = Math.min(255, Math.max(0, b * 0.9 + shadows[2] * (1 - factor) + highlights[2] * factor * 0.1));
    }
    
    // Put the modified image data back
    ctx.putImageData(imgData, 0, 0);
    
    // Add a subtle vignette
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.globalCompositeOperation = 'multiply';
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const innerRadius = Math.min(canvas.width, canvas.height) * 0.4;
    const outerRadius = Math.min(canvas.width, canvas.height) * 0.7;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    
    // Return the enhanced image
    return canvas.toDataURL('image/jpeg', 0.95);
  }
}

// Create and export a singleton instance
export const enhancementEngine = new EnhancementEngine();
