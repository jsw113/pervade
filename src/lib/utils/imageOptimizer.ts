/**
 * Client-side high performance image compressor / optimizer
 * Resizes large camera photos (e.g. 10MB+) down to web-optimized dimensions & quality
 */
export async function optimizeImageFile(file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.85): Promise<string> {
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

        // Calculate aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
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

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp or jpeg Data URL
        const outputFormat = file.type === "image/png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(outputFormat, quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        // Fallback to original Data URL
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
