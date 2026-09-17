import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "업로드할 파일이 없습니다." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";

    let savedUrl = "";

    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "reviews");
      await mkdir(uploadDir, { recursive: true });

      const ext = path.extname(file.name) || ".jpg";
      const filename = `review_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, buffer);
      savedUrl = `/uploads/reviews/${filename}`;
    } catch (fsError) {
      console.warn("Filesystem write fallback to Base64:", fsError);
      const base64 = buffer.toString("base64");
      savedUrl = `data:${mimeType};base64,${base64}`;
    }

    return NextResponse.json({
      success: true,
      url: savedUrl,
    });
  } catch (error: any) {
    console.error("Review photo upload error:", error);
    return NextResponse.json({ error: error?.message || "이미지 업로드에 실패했습니다." }, { status: 500 });
  }
}
