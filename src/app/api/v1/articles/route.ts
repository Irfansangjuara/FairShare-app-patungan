import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq, desc, and, like, or } from "drizzle-orm";
import { verifyApiRequest } from "@/lib/api/auth";
import { articleSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

// GET /api/v1/articles
// Fetches published articles (or all articles if authenticated with articles:read / admin:manage)
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyApiRequest(req);
    const hasAdminOrReadScope =
      auth.authorized &&
      (auth.tokenScopes?.includes("articles:read") ||
        auth.tokenScopes?.includes("admin:manage") ||
        auth.user?.role === "admin");

    const searchParams = req.nextUrl.searchParams;
    const requestedStatus = searchParams.get("status");
    const query = searchParams.get("q") || searchParams.get("search");
    const limit = Math.min(Number(searchParams.get("limit") || 50), 100);

    const condition = [];

    // If caller does not have read scope or admin role, strictly published only
    if (!hasAdminOrReadScope || requestedStatus === "published") {
      condition.push(eq(articles.status, "published"));
    } else if (requestedStatus === "draft") {
      condition.push(eq(articles.status, "draft"));
    }

    if (query) {
      condition.push(
        or(
          like(articles.title, `%${query}%`),
          like(articles.slug, `%${query}%`),
          like(articles.summary, `%${query}%`)
        )
      );
    }

    const whereClause = condition.length > 0 ? and(...condition) : undefined;

    const list = await db.query.articles.findMany({
      where: whereClause,
      orderBy: [desc(articles.createdAt)],
      limit,
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      total: list.length,
      data: list,
    });
  } catch (error: any) {
    console.error("GET /api/v1/articles error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil daftar artikel" },
      { status: 500 }
    );
  }
}

// POST /api/v1/articles
// AI Agent creates a new blog article
export async function POST(req: NextRequest) {
  const auth = await verifyApiRequest(req, "articles:write");
  if (!auth.authorized) {
    // Also accept admin:manage
    if (!auth.tokenScopes?.includes("admin:manage") && auth.user?.role !== "admin") {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }
  }

  try {
    const body = await req.json();

    // Auto-generate slug from title if not provided
    let slug = body.slug;
    if (!slug && body.title) {
      slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);
    }

    const parsed = articleSchema.safeParse({
      title: body.title,
      slug,
      summary: body.summary,
      content: body.content,
      featuredImage: body.featuredImage,
      status: body.status || "draft",
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      canonicalUrl: body.canonicalUrl,
      isNoindex: body.isNoindex || false,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi gagal",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check unique slug
    const existing = await db.query.articles.findFirst({
      where: eq(articles.slug, data.slug),
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Slug "${data.slug}" sudah digunakan oleh artikel lain.`,
        },
        { status: 409 }
      );
    }

    const [createdArticle] = await db
      .insert(articles)
      .values({
        authorId: auth.user!.id,
        title: data.title,
        slug: data.slug,
        summary: data.summary || null,
        content: data.content,
        featuredImage: data.featuredImage || null,
        status: data.status,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        canonicalUrl: data.canonicalUrl || null,
        isNoindex: data.isNoindex,
        publishedAt: data.status === "published" ? new Date() : null,
      })
      .returning();

    revalidatePath("/blog");
    revalidatePath(`/blog/${data.slug}`);
    revalidatePath("/admin/blog");

    return NextResponse.json(
      {
        success: true,
        message:
          data.status === "published"
            ? "Artikel berhasil dipublikasikan ke /blog"
            : "Draft artikel berhasil disimpan",
        publicUrl: `/blog/${createdArticle.slug}`,
        adminUrl: `/admin/blog/${createdArticle.id}/edit`,
        article: createdArticle,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/v1/articles error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat artikel baru" },
      { status: 500 }
    );
  }
}
