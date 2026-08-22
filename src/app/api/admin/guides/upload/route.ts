import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "이미지 파일이 전송되지 않았습니다." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";

    let fileUrl = "";
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "guides");
      await mkdir(uploadDir, { recursive: true });

      const ext = path.extname(file.name) || ".jpg";
      const filename = `guide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, buffer);
      fileUrl = `/uploads/guides/${filename}`;
    } catch (fsErr) {
      const base64 = buffer.toString("base64");
      fileUrl = `data:${mimeType};base64,${base64}`;
    }

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Guide image upload error:", error);
    return NextResponse.json({ error: error?.message || "업로드에 실패했습니다." }, { status: 500 });
  }
}
