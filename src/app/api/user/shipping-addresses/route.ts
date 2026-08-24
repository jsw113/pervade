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

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try parsing shippingAddresses or fallback to default address if empty
    let addresses: ShippingAddressItem[] = [];
    const raw = (user as any).shippingAddresses;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) addresses = parsed;
      } catch (e) {
        console.warn("Failed to parse shippingAddresses:", e);
      }
    }

    // If no addresses registered but user.address exists, auto-populate initial default address
    if (addresses.length === 0 && user.address) {
      addresses = [
        {
          id: "addr_default",
          title: "기본 배송지",
          recipient: user.name,
          phone: user.phone || "",
          address: user.address,
          isDefault: true,
        },
      ];
    }

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

    let addresses: ShippingAddressItem[] = [];
    const raw = (user as any).shippingAddresses;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) addresses = parsed;
      } catch (e) {}
    }

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
      // Add new (Check MAX 3 constraint)
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

    // Save to user shippingAddresses
    await (prisma.user.update as any)({
      where: { id: user.id },
      data: {
        shippingAddresses: JSON.stringify(addresses),
        // If a default address is set, sync with user.address as well
        ...(addresses.find((a) => a.isDefault)
          ? { address: addresses.find((a) => a.isDefault)?.address }
          : {}),
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

    let addresses: ShippingAddressItem[] = [];
    const raw = (user as any).shippingAddresses;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) addresses = parsed;
      } catch (e) {}
    }

    addresses = addresses.filter((a) => a.id !== id);

    // If we deleted the default and there are remaining addresses, set the first one as default
    if (addresses.length > 0 && !addresses.some((a) => a.isDefault)) {
      addresses[0].isDefault = true;
    }

    await (prisma.user.update as any)({
      where: { id: user.id },
      data: {
        shippingAddresses: JSON.stringify(addresses),
        ...(addresses.find((a) => a.isDefault)
          ? { address: addresses.find((a) => a.isDefault)?.address }
          : {}),
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

    let addresses: ShippingAddressItem[] = [];
    const raw = (user as any).shippingAddresses;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) addresses = parsed;
      } catch (e) {}
    }

    addresses = addresses.map((a) => ({
      ...a,
      isDefault: a.id === defaultId,
    }));

    const defaultAddr = addresses.find((a) => a.id === defaultId);

    await (prisma.user.update as any)({
      where: { id: user.id },
      data: {
        shippingAddresses: JSON.stringify(addresses),
        ...(defaultAddr ? { address: defaultAddr.address } : {}),
      },
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Set default shipping address error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
