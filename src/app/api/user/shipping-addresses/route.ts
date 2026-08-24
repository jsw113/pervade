import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export interface ShippingAddressItem {
  id: string;
  title: string;
  recipient: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  return await prisma.user.findFirst({ where: { id: userId } });
}

function parseAddresses(user: any): ShippingAddressItem[] {
  if (!user || !user.address) return [];

  const raw = user.address.trim();
  if (raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }

  // Plain string address
  return [
    {
      id: "addr_default",
      title: "기본 배송지",
      recipient: user.name,
      phone: user.phone || "",
      address: raw,
      isDefault: true,
    },
  ];
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = parseAddresses(user);
    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Fetch shipping addresses error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, recipient, phone, address, isDefault } = body;

    if (!address || !recipient || !phone) {
      return NextResponse.json({ error: "수령인, 연락처, 배송 주소는 필수입니다." }, { status: 400 });
    }

    let addresses = parseAddresses(user);

    if (id) {
      // Edit existing
      addresses = addresses.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            title: title || a.title || "배송지",
            recipient: recipient.trim(),
            phone: phone.trim(),
            address: address.trim(),
            isDefault: isDefault !== undefined ? !!isDefault : a.isDefault,
          };
        }
        return isDefault ? { ...a, isDefault: false } : a;
      });
    } else {
      // Add new (Check MAX 3 limit)
      if (addresses.length >= 3) {
        return NextResponse.json({ 
          error: "배송지는 최대 3개까지만 등록할 수 있습니다. 기존 배송지를 수정하거나 삭제해주세요." 
        }, { status: 400 });
      }

      const newId = `addr_${Date.now()}`;
      const shouldBeDefault = isDefault || addresses.length === 0;

      if (shouldBeDefault) {
        addresses = addresses.map((a) => ({ ...a, isDefault: false }));
      }

      addresses.push({
        id: newId,
        title: title?.trim() || `배송지 ${addresses.length + 1}`,
        recipient: recipient.trim(),
        phone: phone.trim(),
        address: address.trim(),
        isDefault: shouldBeDefault,
      });
    }

    // Save JSON array in user.address
    await prisma.user.update({
      where: { id: user.id },
      data: {
        address: JSON.stringify(addresses),
      },
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Save shipping address error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 });
    }

    let addresses = parseAddresses(user);
    addresses = addresses.filter((a) => a.id !== id);

    if (addresses.length > 0 && !addresses.some((a) => a.isDefault)) {
      addresses[0].isDefault = true;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        address: addresses.length > 0 ? JSON.stringify(addresses) : "",
      },
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Delete shipping address error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { defaultId } = await request.json();
    if (!defaultId) {
      return NextResponse.json({ error: "defaultId required" }, { status: 400 });
    }

    let addresses = parseAddresses(user);
    addresses = addresses.map((a) => ({
      ...a,
      isDefault: a.id === defaultId,
    }));

    await prisma.user.update({
      where: { id: user.id },
      data: {
        address: JSON.stringify(addresses),
      },
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Set default shipping address error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
