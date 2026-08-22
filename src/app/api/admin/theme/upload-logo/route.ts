import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File not found in form data" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "image/png";

    const fileExt = path.extname(file.name) || ".png";
    const fileName = `logo_${Date.now()}${fileExt}`;
    let fileUrl = "";

    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${fileName}`;
    } catch (fsErr) {
      const base64 = buffer.toString("base64");
      fileUrl = `data:${mimeType};base64,${base64}`;
    }

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Logo upload error:", error);
    return NextResponse.json({ error: error?.message || "Failed to upload logo image" }, { status: 500 });
  }
}
