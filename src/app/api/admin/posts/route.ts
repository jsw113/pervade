import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type, content, published } = body;

    // TODO: Validate user is admin using NextAuth/Supabase session here
    
    // For now, since we don't have auth fully wired, we will create a dummy admin user if not exists
    // and assign the post to them.
    let adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: "admin@pervade.com",
          name: "Admin",
          passwordHash: "dummy_hash",
          role: "ADMIN"
        }
      });
    }

    const post = await prisma.post.create({
      data: {
        title,
        type,
        content,
        published,
        authorId: adminUser.id
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
