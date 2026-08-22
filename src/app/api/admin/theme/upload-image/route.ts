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
    const filename = `hero_bg_${Date.now()}${path.extname(file.name) || ".jpg"}`;

    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, buffer);
      fileUrl = `/uploads/${filename}`;
    } catch (fsErr) {
      const base64 = buffer.toString("base64");
      fileUrl = `data:${mimeType};base64,${base64}`;
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: filename
    });
  } catch (error: any) {
    console.error("Theme background image upload error:", error);
    return NextResponse.json({ error: error?.message || "배경 이미지 업로드에 실패했습니다." }, { status: 500 });
  }
}
