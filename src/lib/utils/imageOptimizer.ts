/**
 * Client-side high performance image compressor / optimizer
 */

/**
 * Standard product gallery & banner optimizer (proportional square / landscape)
 */
export async function optimizeImageFile(file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.80): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === "image/svg+xml" || file.type === "image/gif") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * High-definition detail description long-strip image optimizer
 * Standard e-commerce detail page width: 860px (matches Korean Smartstore / Coupang / Cafe24 standard)
 * Perfectly fits shopping mall max-w-3xl (768px) container while keeping 20,000px tall banners under 300KB.
 */
export async function optimizeDetailImageFile(file: File, maxWidth = 860, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === "image/svg+xml" || file.type === "image/gif") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL("image/jpeg", quality);

        // Additional safeguard: if single image is still > 400KB, scale to 750px / 0.72 quality
        if (dataUrl.length > 400 * 1024) {
          const secCanvas = document.createElement("canvas");
          const targetW = Math.min(width, 750);
          const targetH = Math.round((height * targetW) / width);
          secCanvas.width = targetW;
          secCanvas.height = targetH;
          const secCtx = secCanvas.getContext("2d");
          if (secCtx) {
            secCtx.imageSmoothingEnabled = true;
            secCtx.imageSmoothingQuality = "high";
            secCtx.drawImage(canvas, 0, 0, targetW, targetH);
            dataUrl = secCanvas.toDataURL("image/jpeg", 0.72);
          }
        }

        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Re-compresses an existing Base64 Data URL to fit safely within payload limits
 */
export async function optimizeDataUrl(dataUrl: string, maxWidth = 860, quality = 0.76): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith("data:image/")) {
    return dataUrl;
  }
  // If already tiny (< 250KB), skip
  if (dataUrl.length < 250 * 1024) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const optimized = canvas.toDataURL("image/jpeg", quality);
      resolve(optimized);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// Alias for backwards compatibility
export const optimizeImage = optimizeImageFile;

/**
 * Ultra-HD Hero Banner Optimizer (Full HD/QHD 2560px width, 90% high quality)
 * Prevents pixelation on 4K / wide desktop monitors
 */
export async function optimizeHeroBannerImage(file: File, maxWidth = 2560, maxHeight = 1440, quality = 0.90): Promise<string> {
  return optimizeImageFile(file, maxWidth, maxHeight, quality);
}

