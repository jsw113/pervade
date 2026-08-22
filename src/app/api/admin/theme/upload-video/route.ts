import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "동영상 파일이 제공되지 않았습니다." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "video/mp4";

    const fileExt = path.extname(file.name) || ".mp4";
    const fileName = `hero_video_${Date.now()}${fileExt}`;
    let fileUrl = "";

    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${fileName}`;
    } catch (fsErr) {
      // Vercel serverless read-only fallback: Base64
      const base64 = buffer.toString("base64");
      fileUrl = `data:${mimeType};base64,${base64}`;
    }

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Theme video upload error:", error);
    return NextResponse.json({ error: error?.message || "동영상 업로드에 실패했습니다." }, { status: 500 });
  }
}
