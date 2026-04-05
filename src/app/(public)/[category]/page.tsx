import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, type CategorySlug } from "@/lib/constants";
import { getCategoryIcon } from "@/components/icons/category-icons";
import { db, initDB } from "@/db";
import { posts, postVersions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = CATEGORIES[category as CategorySlug];
  if (!cat) return {};
  return {
    title: `${cat.title} — Erdem`,
    description: cat.shortTagline,
  };
}

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = CATEGORIES[category as CategorySlug];

  if (!cat) {
    notFound();
  }

  initDB();

  const categoryPosts = await db
    .select()
    .from(posts)
    .where(and(eq(posts.category, category), eq(posts.isPublished, true)))
    .orderBy(desc(posts.updatedAt));

  const postsWithVersions = await Promise.all(
    categoryPosts.map(async (post) => {
      const versions = await db
        .select()
        .from(postVersions)
        .where(eq(postVersions.postId, post.id))
        .orderBy(desc(postVersions.versionNumber));

      const latestNonDeleted = versions.find((v) => !v.isDeleted);
      return {
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : [],
        currentVersion: versions[0]?.versionNumber || 0,
        summary: latestNonDeleted?.summary || null,
      };
    })
  );

  return (
    <div className="min-h-screen">
      <section className="pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <div className="flex justify-center mb-6 text-muted-foreground">
            {getCategoryIcon(cat.icon, "w-32 h-32 md:w-40 md:h-40")}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {cat.title}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {cat.tagline}
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-[720px] mx-auto px-6">
          {postsWithVersions.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <p className="text-muted-foreground">
                No posts in {cat.title} yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {postsWithVersions.map((post) => (
                <Link key={post.id} href={`/${category}/${post.slug}`}>
                  <div className="bg-card border border-border rounded-xl p-6 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 mb-4">
                    <h2 className="text-lg font-semibold text-foreground mb-2">
                      {post.title}
                    </h2>
                    {post.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {post.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                      <Badge variant="secondary" className="text-xs">v{post.currentVersion}</Badge>
                      {post.tags?.map((tag: string) => (
                        <span key={tag} className="bg-accent px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
