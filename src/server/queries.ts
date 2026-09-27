import { db } from "../db";
import { events, members, expenses, settlements, users, siteSettings, sitePages, articles } from "../db/schema";
import { eq, and, desc, asc, isNull } from "drizzle-orm";
import { calculateSplitAndSettlements } from "../lib/settlement";

export async function getUserEvents(userId: string) {
  const userEvents = await db.query.events.findMany({
    where: eq(events.ownerId, userId),
    orderBy: [desc(events.createdAt)],
    with: {
      members: true,
      expenses: true,
      settlements: true,
    },
  });

  return userEvents.map((evt) => {
    const totalAmount = evt.expenses.reduce((sum, e) => sum + e.amount, BigInt(0));
    const unpaidCount = evt.settlements.filter((s) => !s.isPaid).length;
    return {
      ...evt,
      totalAmount,
      memberCount: evt.members.length,
      expenseCount: evt.expenses.length,
      settlementCount: evt.settlements.length,
      unpaidCount,
      isArchived: !!evt.archivedAt,
    };
  });
}

export async function getEventDetails(eventId: string, userId: string) {
  const event = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.ownerId, userId)),
    with: {
      members: {
        orderBy: [asc(members.createdAt), asc(members.id)],
      },
      expenses: {
        orderBy: [desc(expenses.createdAt)],
        with: {
          paidByMember: true,
        },
      },
      settlements: {
        orderBy: [asc(settlements.createdAt), asc(settlements.id)],
        with: {
          fromMember: true,
          toMember: true,
        },
      },
    },
  });

  if (!event) return null;

  // Compute live calculations
  const splitResult = calculateSplitAndSettlements(
    event.members.map((m) => ({ id: m.id, name: m.name, createdAt: m.createdAt })),
    event.expenses.map((e) => ({
      id: e.id,
      paidByMemberId: e.paidByMemberId,
      amount: e.amount,
      title: e.title,
    }))
  );

  const hasPaidSettlements = event.settlements.some((s) => s.isPaid);
  const unpaidCount = event.settlements.filter((s) => !s.isPaid).length;

  return {
    event,
    splitResult,
    hasPaidSettlements,
    unpaidCount,
    isOwner: true,
  };
}

export async function getEventByShareToken(token: string) {
  const event = await db.query.events.findFirst({
    where: eq(events.shareToken, token),
    with: {
      members: {
        orderBy: [asc(members.createdAt), asc(members.id)],
      },
      expenses: {
        orderBy: [desc(expenses.createdAt)],
        with: {
          paidByMember: true,
        },
      },
      settlements: {
        orderBy: [asc(settlements.createdAt), asc(settlements.id)],
        with: {
          fromMember: true,
          toMember: true,
        },
      },
      owner: {
        columns: {
          name: true,
        },
      },
    },
  });

  if (!event) return null;

  const splitResult = calculateSplitAndSettlements(
    event.members.map((m) => ({ id: m.id, name: m.name, createdAt: m.createdAt })),
    event.expenses.map((e) => ({
      id: e.id,
      paidByMemberId: e.paidByMemberId,
      amount: e.amount,
      title: e.title,
    }))
  );

  const unpaidCount = event.settlements.filter((s) => !s.isPaid).length;

  return {
    event,
    splitResult,
    unpaidCount,
    isOwner: false,
  };
}

export async function getSiteSettings() {
  try {
    const settings = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, "global"),
    });
    return settings || {
      id: "global",
      key: "global",
      siteName: "FairShare",
      defaultDescription: "Aplikasi patungan dan pelunasan trip cerdas.",
      defaultOgImage: "/assets/img/fair-share-cover.webp",
      titleTemplate: "%s | FairShare",
    };
  } catch (err) {
    return {
      id: "global",
      key: "global",
      siteName: "FairShare",
      defaultDescription: "Aplikasi patungan dan pelunasan trip cerdas.",
      defaultOgImage: "/assets/img/fair-share-cover.webp",
      titleTemplate: "%s | FairShare",
    };
  }
}

export async function getSitePageByKey(key: string) {
  try {
    return await db.query.sitePages.findFirst({
      where: eq(sitePages.key, key),
    });
  } catch (err) {
    return null;
  }
}

export async function getSitePageBySlug(slug: string) {
  try {
    return await db.query.sitePages.findFirst({
      where: eq(sitePages.slug, slug),
    });
  } catch (err) {
    return null;
  }
}

export async function getPublishedArticles() {
  try {
    return await db.query.articles.findMany({
      where: eq(articles.status, "published"),
      orderBy: [desc(articles.publishedAt), desc(articles.createdAt)],
      with: {
        author: {
          columns: {
            name: true,
          },
        },
      },
    });
  } catch (err) {
    return [];
  }
}

export async function getArticleBySlug(slug: string, allowDraft = false) {
  try {
    const article = await db.query.articles.findFirst({
      where: allowDraft
        ? eq(articles.slug, slug)
        : and(eq(articles.slug, slug), eq(articles.status, "published")),
      with: {
        author: {
          columns: {
            name: true,
          },
        },
      },
    });
    return article || null;
  } catch (err) {
    return null;
  }
}

export async function getAllArticlesAdmin() {
  try {
    return await db.query.articles.findMany({
      orderBy: [desc(articles.createdAt)],
      with: {
        author: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
    });
  } catch (err) {
    return [];
  }
}

export async function getAllSitePagesAdmin() {
  try {
    return await db.query.sitePages.findMany({
      orderBy: [asc(sitePages.navOrder)],
    });
  } catch (err) {
    return [];
  }
}

export async function getAdminOverviewStats() {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      with: {
        events: {
          columns: {
            id: true,
          },
        },
      },
    });

    const allArticles = await db.query.articles.findMany({
      orderBy: [desc(articles.createdAt)],
      with: {
        author: {
          columns: {
            name: true,
          },
        },
      },
    });

    const allEvents = await db.query.events.findMany({
      columns: {
        id: true,
      },
    });

    const allPages = await db.query.sitePages.findMany({
      columns: {
        id: true,
        isPublished: true,
      },
    });

    const adminCount = allUsers.filter((u) => u.role === "admin").length;
    const regularUserCount = allUsers.filter((u) => u.role !== "admin").length;
    const publishedArticleCount = allArticles.filter((a) => a.status === "published").length;
    const draftArticleCount = allArticles.filter((a) => a.status !== "published").length;

    return {
      totalUsers: allUsers.length,
      adminCount,
      regularUserCount,
      totalEvents: allEvents.length,
      totalArticles: allArticles.length,
      publishedArticleCount,
      draftArticleCount,
      totalPages: allPages.length,
      recentUsers: allUsers.slice(0, 5).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || "user",
        createdAt: u.createdAt,
        eventCount: u.events ? u.events.length : 0,
      })),
      recentArticles: allArticles.slice(0, 5).map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        status: a.status,
        authorName: a.author?.name || "Admin",
        createdAt: a.createdAt,
      })),
    };
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    return {
      totalUsers: 0,
      adminCount: 0,
      regularUserCount: 0,
      totalEvents: 0,
      totalArticles: 0,
      publishedArticleCount: 0,
      draftArticleCount: 0,
      totalPages: 0,
      recentUsers: [],
      recentArticles: [],
    };
  }
}

