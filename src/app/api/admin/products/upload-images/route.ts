import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

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

      // Clean file extension & unique filename
      const ext = path.extname(file.name) || ".jpg";
      const filename = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filepath = path.join(process.cwd(), "public", "uploads", "products", filename);

      await writeFile(filepath, buffer);
      uploadedUrls.push(`/uploads/products/${filename}`);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length
    });
  } catch (error) {
    console.error("Product image upload error:", error);
    return NextResponse.json({ error: "이미지 업로드에 실패했습니다." }, { status: 500 });
  }
}
