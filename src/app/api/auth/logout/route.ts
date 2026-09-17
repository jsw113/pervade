import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("userId");
    cookieStore.set("userId", "", { path: "/", maxAge: 0 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("userId");
    cookieStore.set("userId", "", { path: "/", maxAge: 0 });
    
    // Determine the true host from reverse proxy headers
    const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    
    const baseUrl = forwardedHost && !forwardedHost.includes("localhost") && !forwardedHost.includes("127.0.0.1")
      ? `${forwardedProto}://${forwardedHost}`
      : "https://pervade.co.kr";

    const destination = `${baseUrl}/login`;

    // Return HTML response to cleanly remove client-side stored session, then redirect
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>로그아웃</title>
        </head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fafafa;">
          <div style="text-align: center;">
            <p style="color: #52525b; font-size: 14px;">로그아웃 처리 중입니다...</p>
          </div>
          <script>
            try {
              localStorage.removeItem("pervade_user");
              sessionStorage.removeItem("pervade_user");
              window.dispatchEvent(new Event("pervade_auth_update"));
            } catch(e) {}
            window.location.replace("${destination}");
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      }
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.redirect("https://pervade.co.kr/login");
  }
}

