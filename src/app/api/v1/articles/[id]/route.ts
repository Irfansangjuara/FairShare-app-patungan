import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { verifyApiRequest } from "@/lib/api/auth";
import { articleSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// GET /api/v1/articles/[id]
export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;

    const article = await db.query.articles.findFirst({
      where: or(eq(articles.id, id), eq(articles.slug, id)),
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

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    if (article.status !== "published") {
      const auth = await verifyApiRequest(req);
      const canViewDraft =
        auth.authorized &&
        (auth.tokenScopes?.includes("articles:read") ||
          auth.tokenScopes?.includes("admin:manage") ||
          auth.user?.role === "admin");

      if (!canViewDraft) {
        return NextResponse.json(
          { success: false, error: "Artikel tidak ditemukan atau masih berstatus draft" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error: unknown) {
    console.error("GET /api/v1/articles/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data artikel" },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/articles/[id]
// AI Agent updates article
export async function PATCH(req: NextRequest, { params }: RouteProps) {
  const auth = await verifyApiRequest(req, "articles:write");
  const canWrite =
    auth.authorized ||
    auth.tokenScopes?.includes("admin:manage") ||
    auth.user?.role === "admin";
  if (!canWrite) {
    return NextResponse.json(
      { error: auth.error || "Akses ditolak." },
      { status: auth.status || 401 }
    );
  }

  try {
    const { id } = await params;

    const existing = await db.query.articles.findFirst({
      where: or(eq(articles.id, id), eq(articles.slug, id)),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const merged = {
      title: body.title !== undefined ? body.title : existing.title,
      slug: body.slug !== undefined ? body.slug : existing.slug,
      summary: body.summary !== undefined ? body.summary : existing.summary,
      content: body.content !== undefined ? body.content : existing.content,
      featuredImage:
        body.featuredImage !== undefined ? body.featuredImage : existing.featuredImage,
      status: body.status !== undefined ? body.status : existing.status,
      seoTitle: body.seoTitle !== undefined ? body.seoTitle : existing.seoTitle,
      seoDescription:
        body.seoDescription !== undefined ? body.seoDescription : existing.seoDescription,
      canonicalUrl:
        body.canonicalUrl !== undefined ? body.canonicalUrl : existing.canonicalUrl,
      isNoindex:
        body.isNoindex !== undefined ? Boolean(body.isNoindex) : existing.isNoindex,
    };

    const parsed = articleSchema.safeParse(merged);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validasi gagal", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check slug collision if slug is changing
    if (data.slug !== existing.slug) {
      const slugExists = await db.query.articles.findFirst({
        where: eq(articles.slug, data.slug),
      });
      if (slugExists && slugExists.id !== existing.id) {
        return NextResponse.json(
          { success: false, error: `Slug "${data.slug}" sudah digunakan oleh artikel lain` },
          { status: 409 }
        );
      }
    }

    const wasPublished = existing.status === "published";
    const nowPublished = data.status === "published";

    const [updatedArticle] = await db
      .update(articles)
      .set({
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
        publishedAt: !wasPublished && nowPublished ? new Date() : existing.publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, existing.id))
      .returning();

    revalidatePath("/blog");
    revalidatePath(`/blog/${existing.slug}`);
    if (data.slug !== existing.slug) {
      revalidatePath(`/blog/${data.slug}`);
    }
    revalidatePath("/admin/blog");

    return NextResponse.json({
      success: true,
      message: "Artikel berhasil diperbarui",
      publicUrl: `/blog/${updatedArticle.slug}`,
      adminUrl: `/admin/blog/${updatedArticle.id}/edit`,
      article: updatedArticle,
    });
  } catch (error: unknown) {
    console.error("PATCH /api/v1/articles/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui artikel" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/articles/[id]
export async function DELETE(req: NextRequest, { params }: RouteProps) {
  const auth = await verifyApiRequest(req, "articles:write");
  const canWrite =
    auth.authorized ||
    auth.tokenScopes?.includes("admin:manage") ||
    auth.user?.role === "admin";
  if (!canWrite) {
    return NextResponse.json(
      { error: auth.error || "Akses ditolak." },
      { status: auth.status || 401 }
    );
  }

  try {
    const { id } = await params;

    const existing = await db.query.articles.findFirst({
      where: or(eq(articles.id, id), eq(articles.slug, id)),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.delete(articles).where(eq(articles.id, existing.id));

    revalidatePath("/blog");
    revalidatePath(`/blog/${existing.slug}`);
    revalidatePath("/admin/blog");

    return NextResponse.json({
      success: true,
      message: `Artikel "${existing.title}" berhasil dihapus`,
    });
  } catch (error: unknown) {
    console.error("DELETE /api/v1/articles/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus artikel" },
      { status: 500 }
    );
  }
}
