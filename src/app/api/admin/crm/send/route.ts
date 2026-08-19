import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userIds, type, content } = body;

    if (!userIds || !type || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Since this is a prototype, we just log the mock sends in DB if users exist
    // Currently, our frontend uses mockUsers with IDs "1", "2", "3". 
    // They might not exist in Prisma DB yet, so we just return success for the demo.
    
    // In a real implementation:
    // for (const id of userIds) {
    //   await prisma.messageLog.create({
    //     data: { userId: id, type, content, status: "SUCCESS" }
    //   });
    // }

    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ success: true, count: userIds.length });
  } catch (error) {
    console.error("CRM Send Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
