import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "업로드할 파일이 없습니다." }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/jpeg";

      let savedUrl = "";

      // Try local filesystem write first (for local dev / VPS)
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
        await mkdir(uploadDir, { recursive: true });

        const ext = path.extname(file.name) || ".jpg";
        const filename = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);
        savedUrl = `/uploads/products/${filename}`;
      } catch (fsError) {
        // Fallback for Vercel / serverless read-only filesystem: convert to optimized Data URI (Base64)
        console.warn("Filesystem write not available, using Base64 Data URI fallback:", fsError);
        const base64 = buffer.toString("base64");
        savedUrl = `data:${mimeType};base64,${base64}`;
      }

      uploadedUrls.push(savedUrl);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length
    });
  } catch (error: any) {
    console.error("Product image upload error:", error);
    return NextResponse.json({ error: error?.message || "이미지 업로드에 실패했습니다." }, { status: 500 });
  }
}
