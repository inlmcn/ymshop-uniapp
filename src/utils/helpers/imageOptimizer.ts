/**
 * 图像优化工具
 * 用于处理图像格式转换、压缩和优化
 */

interface ImageOptimizationOptions {
  quality?: number; // 图像质量 (0-1)
  maxWidth?: number; // 最大宽度
  maxHeight?: number; // 最大高度
  format?: 'webp' | 'jpeg' | 'png'; // 目标格式
  progressive?: boolean; // 是否使用渐进式加载
}

interface OptimizedImage {
  url: string;
  optimized: boolean;
  originalSize?: number;
  optimizedSize?: number;
  format: string;
}

export class ImageOptimizer {
  private supportedFormats: string[] = ['webp', 'jpeg', 'jpg', 'png'];
  private fallbackFormat: 'jpeg' | 'png' = 'jpeg';

  /**
   * 检查浏览器是否支持WebP
   */
  async supportsWebP(): Promise<boolean> {
    // 在uni-app环境中，我们无法直接使用Canvas检测WebP支持
    // 所以我们假设大部分现代移动设备都支持WebP
    return true;
  }

  /**
   * 优化单个图像
   */
  async optimize(src: string, options: ImageOptimizationOptions = {}): Promise<OptimizedImage> {
    const {
      quality = 0.8,
      maxWidth,
      maxHeight,
      format,
      progressive = false
    } = options;

    try {
      // 检查是否支持目标格式
      const targetFormat = format || await this.getTargetFormat();
      const optimizedUrl = this.buildOptimizedImageUrl(src, {
        quality,
        maxWidth,
        maxHeight,
        format: targetFormat,
        progressive
      });

      return {
        url: optimizedUrl,
        optimized: true,
        format: targetFormat,
        originalSize: undefined, // 在实际环境中可以添加原始尺寸检测
        optimizedSize: undefined
      };
    } catch (error) {
      console.error('Image optimization failed:', error);
      // 如果优化失败，返回原始URL
      return {
        url: src,
        optimized: false,
        format: this.getFileExtension(src) || this.fallbackFormat,
        originalSize: undefined,
        optimizedSize: undefined
      };
    }
  }

  /**
   * 批量优化图像
   */
  async optimizeBatch(sources: string[], options: ImageOptimizationOptions = {}): Promise<OptimizedImage[]> {
    const promises = sources.map(src => this.optimize(src, options));
    return Promise.all(promises);
  }

  /**
   * 预加载图像
   */
  async preloadImage(src: string): Promise<boolean> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = src;
    });
  }

  /**
   * 批量预加载图像
   */
  async preloadImages(sources: string[]): Promise<boolean[]> {
    const promises = sources.map(src => this.preloadImage(src));
    return Promise.all(promises);
  }

  /**
   * 获取图像信息
   */
  async getImageInfo(src: string): Promise<{ width: number; height: number; type: string } | null> {
    return new Promise((resolve) => {
      uni.getImageInfo({
        src,
        success: (res) => {
          resolve({
            width: res.width,
            height: res.height,
            type: res.type
          });
        },
        fail: () => {
          resolve(null);
        }
      });
    });
  }

  /**
   * 压缩图像
   */
  async compressImage(src: string, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      uni.compressImage({
        src,
        quality: Math.round(quality * 100),
        success: (res) => {
          resolve(res.tempFilePath);
        },
        fail: (error) => {
          console.error('Image compression failed:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * 选择最适合的目标格式
   */
  private async getTargetFormat(): Promise<'webp' | 'jpeg' | 'png'> {
    if (await this.supportsWebP()) {
      return 'webp';
    }
    return this.fallbackFormat;
  }

  /**
   * 构建优化的图像URL
   */
  private buildOptimizedImageUrl(src: string, options: ImageOptimizationOptions): string {
    // 如果是远程图片，添加优化参数
    if (this.isRemoteUrl(src)) {
      const separator = src.includes('?') ? '&' : '?';
      
      const params = new URLSearchParams();
      
      if (options.quality !== undefined) {
        params.append('quality', Math.round(options.quality * 100).toString());
      }
      
      if (options.maxWidth) {
        params.append('w', options.maxWidth.toString());
      }
      
      if (options.maxHeight) {
        params.append('h', options.maxHeight.toString());
      }
      
      if (options.format) {
        params.append('f', options.format);
      }
      
      if (options.progressive) {
        params.append('progressive', 'true');
      }
      
      return `${src}${separator}${params.toString()}`;
    }
    
    // 如果是本地文件，直接返回
    return src;
  }

  /**
   * 检查是否为远程URL
   */
  private isRemoteUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(filename: string): string | null {
    const match = filename.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : null;
  }

  /**
   * 验证图像URL
   */
  validateImageUrl(url: string): boolean {
    // 基本的URL验证
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    const validExtensions = /\.(jpeg|jpg|png|webp|gif|bmp|svg)$/i;
    
    return urlPattern.test(url) && validExtensions.test(url);
  }

  /**
   * 生成响应式图像源
   */
  generateResponsiveSources(src: string, sizes: number[]): string[] {
    return sizes.map(size => {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}w=${size}`;
    });
  }

  /**
   * 清理临时文件
   */
  async cleanupTempFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        await uni.removeSavedFile({
          filePath,
          success: () => console.log('Temporary file removed:', filePath),
          fail: (error) => console.error('Failed to remove temporary file:', filePath, error)
        });
      } catch (error) {
        console.error('Error removing temp file:', error);
      }
    }
  }
}

// 创建全局图像优化实例
export const imageOptimizer = new ImageOptimizer();

/**
 * 图像优化的Composition函数
 */
export function useImageOptimizer() {
  const optimize = async (src: string, options: ImageOptimizationOptions = {}) => {
    return imageOptimizer.optimize(src, options);
  };

  const compress = async (src: string, quality: number = 0.8) => {
    return imageOptimizer.compressImage(src, quality);
  };

  const preload = async (src: string) => {
    return imageOptimizer.preloadImage(src);
  };

  const getInfo = async (src: string) => {
    return imageOptimizer.getImageInfo(src);
  };

  return {
    optimize,
    compress,
    preload,
    getInfo,
    optimizer: imageOptimizer
  };
}