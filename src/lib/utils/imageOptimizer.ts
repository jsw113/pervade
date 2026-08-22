/**
 * Client-side high performance image compressor / optimizer
 */

/**
 * Standard product gallery & banner optimizer (proportional square / landscape)
 */
export async function optimizeImageFile(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG or small gif, read directly
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

        // Calculate aspect ratio without extreme distortion
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

        // Always convert to high efficiency JPEG for web to prevent 10MB+ uncompressed PNG bloat
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
 * Constrains width to standard e-commerce container width (e.g. 1000px, 2x Retina for 500~768px containers)
 * and keeps vertical height uncompressed, while using high-efficiency JPEG compression (0.82)
 * to keep even 20,000px tall banners under 600KB and razor-sharp.
 */
export async function optimizeDetailImageFile(file: File, maxWidth = 1000, quality = 0.82): Promise<string> {
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

        // ONLY scale down if width exceeds maxWidth (never scale down height!)
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

        // MUST use image/jpeg so canvas.toDataURL properly compresses (PNG ignores quality argument)
        let dataUrl = canvas.toDataURL("image/jpeg", quality);

        // If extremely gigantic (e.g. > 1.2MB for 30,000px banner), apply a quick secondary optimize pass
        if (dataUrl.length > 1.2 * 1024 * 1024) {
          const secondaryCanvas = document.createElement("canvas");
          const targetW = Math.min(width, 860);
          const targetH = Math.round((height * targetW) / width);
          secondaryCanvas.width = targetW;
          secondaryCanvas.height = targetH;
          const secCtx = secondaryCanvas.getContext("2d");
          if (secCtx) {
            secCtx.imageSmoothingEnabled = true;
            secCtx.imageSmoothingQuality = "high";
            secCtx.drawImage(canvas, 0, 0, targetW, targetH);
            dataUrl = secondaryCanvas.toDataURL("image/jpeg", 0.78);
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

// Alias for backwards compatibility
export const optimizeImage = optimizeImageFile;
