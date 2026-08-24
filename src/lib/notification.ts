import { prisma } from "@/lib/prisma";

export interface OrderNotificationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  items: Array<{
    name: string;
    option?: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  deliveryMemo?: string;
  earnedPoints: number;
  orderDate: string;
}

export interface ShippingNotificationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  productName: string;
  carrier: string; // e.g. "CJ대한통운", "우체국택배", "로젠택배"
  trackingNumber: string;
}

// 1. Generate Luxury HTML Email for Order Confirmation
export function generateOrderConfirmationEmailHtml(data: OrderNotificationData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px 8px; font-size: 13px; color: #1a1a1a; font-weight: bold;">
          ${item.name}
          ${item.option ? `<div style="font-size: 11px; color: #737373; font-weight: normal; margin-top: 2px;">옵션: ${item.option}</div>` : ""}
        </td>
        <td style="padding: 12px 8px; font-size: 13px; color: #525252; text-align: center;">${item.quantity}개</td>
        <td style="padding: 12px 8px; font-size: 13px; color: #1a1a1a; font-weight: bold; text-align: right;">₩${(item.price * item.quantity).toLocaleString()}원</td>
      </tr>
    `
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PERVADE 주문 결제 완료 확인서</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8f8f8; font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f8f8; padding: 40px 10px;">
      <tr>
        <td align="center">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eeeeee;">
            
            <!-- Brand Header -->
            <tr>
              <td style="padding: 36px 36px 24px; text-align: center; background-color: #09090b;">
                <h1 style="margin: 0; font-size: 22px; letter-spacing: 0.2em; color: #ffffff; font-weight: 900; text-transform: uppercase;">PERVADE</h1>
                <p style="margin: 6px 0 0; font-size: 11px; color: #a1a1aa; letter-spacing: 0.1em;">PREMIUM SHOWER SYSTEM & LIFESTYLE</p>
              </td>
            </tr>

            <!-- Title & Greeting -->
            <tr>
              <td style="padding: 32px 36px 20px;">
                <div style="display: inline-block; padding: 4px 12px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 999px; font-size: 11px; font-weight: bold; color: #065f46; margin-bottom: 12px;">
                  ✓ 주문 및 결제가 안전하게 완료되었습니다
                </div>
                <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 800; color: #09090b;">${data.customerName}님, 감사합니다.</h2>
                <p style="margin: 0; font-size: 13px; color: #52525b; line-height: 1.6;">
                  고객님께서 주문하신 퍼베이드 제품이 안전하게 접수되었습니다.<br/>
                  정성스럽게 검수하여 신속하게 배송해 드리겠습니다.
                </p>
              </td>
            </tr>

            <!-- Order Summary Card -->
            <tr>
              <td style="padding: 0 36px 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 16px; padding: 16px;">
                  <tr>
                    <td style="font-size: 12px; color: #71717a; padding-bottom: 6px;">주문번호</td>
                    <td style="font-size: 12px; color: #09090b; font-weight: bold; text-align: right; font-family: monospace;">${data.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #71717a; padding-bottom: 6px;">주문일시</td>
                    <td style="font-size: 12px; color: #09090b; font-weight: 500; text-align: right;">${data.orderDate}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #71717a;">결제수단</td>
                    <td style="font-size: 12px; color: #09090b; font-weight: bold; text-align: right;">${data.paymentMethod}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Item List Table -->
            <tr>
              <td style="padding: 0 36px 24px;">
                <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 800; color: #09090b;">주문 상품 내역</h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 2px solid #09090b; border-collapse: collapse;">
                  <thead>
                    <tr style="border-bottom: 1px solid #e4e4e7; background-color: #fafafa;">
                      <th style="padding: 10px 8px; font-size: 11px; font-weight: 700; color: #71717a; text-align: left;">상품명/옵션</th>
                      <th style="padding: 10px 8px; font-size: 11px; font-weight: 700; color: #71717a; text-align: center; width: 60px;">수량</th>
                      <th style="padding: 10px 8px; font-size: 11px; font-weight: 700; color: #71717a; text-align: right; width: 90px;">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
              </td>
            </tr>

            <!-- Total Payment & Rewards -->
            <tr>
              <td style="padding: 0 36px 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; border-radius: 16px; padding: 20px; color: #ffffff;">
                  <tr>
                    <td style="font-size: 13px; color: #a1a1aa; font-weight: 500;">최종 결제 금액</td>
                    <td style="font-size: 20px; color: #ffffff; font-weight: 900; text-align: right;">₩${data.totalAmount.toLocaleString()}원</td>
                  </tr>
                  <tr>
                    <td style="font-size: 11px; color: #c084fc; padding-top: 8px; font-weight: 600;">✨ 구매 확정 시 적립 예정 포인트</td>
                    <td style="font-size: 12px; color: #c084fc; text-align: right; padding-top: 8px; font-weight: bold;">+${data.earnedPoints.toLocaleString()} P</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Shipping Destination -->
            <tr>
              <td style="padding: 0 36px 32px;">
                <h3 style="margin: 0 0 10px; font-size: 13px; font-weight: 800; color: #09090b;">배송지 정보</h3>
                <div style="background-color: #fafafa; border: 1px solid #f4f4f5; border-radius: 14px; padding: 14px 16px; font-size: 12px; color: #3f3f46; line-height: 1.6;">
                  <div><strong style="color: #18181b;">받는 분:</strong> ${data.customerName} ${data.customerPhone ? `(${data.customerPhone})` : ""}</div>
                  <div style="margin-top: 4px;"><strong style="color: #18181b;">배송 주소:</strong> ${data.shippingAddress}</div>
                  ${data.deliveryMemo ? `<div style="margin-top: 4px;"><strong style="color: #18181b;">배송 요청사항:</strong> ${data.deliveryMemo}</div>` : ""}
                </div>
              </td>
            </tr>

            <!-- CTA Button -->
            <tr>
              <td style="padding: 0 36px 36px; text-align: center;">
                <a href="https://pervade.co.kr/mypage" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #09090b; color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 13px; font-weight: 800; letter-spacing: 0.05em; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                  주문 및 배송상태 실시간 조회 →
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 24px 36px; background-color: #fafafa; border-top: 1px solid #f0f0f0; text-align: center;">
                <p style="margin: 0 0 6px; font-size: 11px; color: #71717a; font-weight: 700;">PERVADE 고객 감동 센터</p>
                <p style="margin: 0 0 8px; font-size: 10px; color: #a1a1aa; line-height: 1.5;">
                  상담시간: 평일 10:00 ~ 17:00 (점심 12:30 ~ 13:30) | 이메일: support@pervade.co.kr<br/>
                  본 메일은 발신전용 메일입니다. 문의사항은 마이페이지 1:1 문의를 이용해 주세요.
                </p>
                <p style="margin: 0; font-size: 9px; color: #d4d4d8;">© 2026 PERVADE Co., Ltd. All rights reserved.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

// 2. Dispatch Email & Record MessageLog
export async function sendOrderNotification(userId: string, data: OrderNotificationData) {
  const subject = `[PERVADE] ${data.customerName}님의 주문 및 결제가 안전하게 완료되었습니다. (${data.orderNumber.slice(0, 8)})`;
  const html = generateOrderConfirmationEmailHtml(data);

  // Attempt real email sending if RESEND_API_KEY or SMTP is provided
  let sendSuccess = false;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "PERVADE <orders@pervade.co.kr>",
          to: [data.customerEmail],
          subject,
          html
        })
      });
      if (res.ok) {
        sendSuccess = true;
      } else {
        console.warn("Resend email dispatch error:", await res.text());
      }
    } catch (e) {
      console.error("Resend fetch error:", e);
    }
  }

  // Record Message Log in Database for CRM monitoring
  try {
    await prisma.messageLog.create({
      data: {
        userId,
        type: "EMAIL",
        content: `[주문결제완료] 주문번호: ${data.orderNumber} | 수신자: ${data.customerEmail} | 결제금액: ₩${data.totalAmount.toLocaleString()}원 | 결제수단: ${data.paymentMethod}`,
        status: sendSuccess ? "SENT" : "LOGGED",
      }
    });
  } catch (e) {
    console.error("Failed to write MessageLog:", e);
  }

  return { success: true, sendSuccess };
}
