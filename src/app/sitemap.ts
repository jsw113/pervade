import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pervade.vercel.app";

  // 1. Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    // 2. Dynamic Product Pages
    const products = await prisma.product.findMany({
      where: { isVisible: true },
      select: { id: true, updatedAt: true },
    });

    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/shop/${product.id}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    }));

    // 3. Dynamic Guide Pages
    const guides = await prisma.guidePost.findMany({
      where: { published: true },
      select: { id: true, updatedAt: true },
    });

    const guidePages: MetadataRoute.Sitemap = guides.map((guide) => ({
      url: `${baseUrl}/guide/${guide.id}`,
      lastModified: guide.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // 4. Dynamic Journal Posts
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { id: true, createdAt: true },
    });

    const journalPages: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/journal/${post.id}`,
      lastModified: post.createdAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    return [...staticPages, ...productPages, ...guidePages, ...journalPages];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return staticPages;
  }
}
