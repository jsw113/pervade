import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value || null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const currentUserId = await getAuthenticatedUserId();

    const questions = await prisma.question.findMany({
      where: {
        ...(productId ? { productId } : {})
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        product: {
          select: { id: true, name: true, imageUrl: true }
        }
      }
    });

    // Mask secret content if not author
    const formatted = questions.map(q => {
      const isAuthor = currentUserId === q.userId;
      return {
        id: q.id,
        title: q.isSecret && !isAuthor ? "🔒 비밀글입니다." : q.title,
        content: q.isSecret && !isAuthor ? "비밀글로 작성된 문의입니다. 작성자 본인 및 관리자만 열람 가능합니다." : q.content,
        category: q.category || "일반",
        isSecret: q.isSecret,
        answer: q.answer,
        createdAt: q.createdAt,
        userName: q.user.name.length > 2 ? q.user.name[0] + "*" + q.user.name.slice(-1) : q.user.name[0] + "*",
        isMine: isAuthor,
        product: q.product
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, isSecret, category, productId } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "제목과 문의 내용은 필수 입력 항목입니다." }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        title,
        content,
        category: category || "일반",
        isSecret: !!isSecret,
        userId,
        productId: productId || null,
      },
    });

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error("Failed to create question:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
