import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, type CategorySlug } from "@/lib/constants";
import { db, initDB } from "@/db";
import { posts, postVersions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { VersionTimeline } from "@/components/posts/version-timeline";

interface VersionPageProps {
  params: Promise<{ category: string; slug: string; version: string }>;
}

export const dynamic = "force-dynamic";

export default async function VersionPage({ params }: VersionPageProps) {
  const { category, slug, version } = await params;
  const cat = CATEGORIES[category as CategorySlug];
  if (!cat) notFound();

  const versionNumber = parseInt(version, 10);
  if (isNaN(versionNumber)) notFound();

  initDB();

  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.category, category)));

  if (!post || !post.isPublished) notFound();

  const allVersions = await db
    .select()
    .from(postVersions)
    .where(eq(postVersions.postId, post.id))
    .orderBy(postVersions.versionNumber);

  const thisVersion = allVersions.find((v) => v.versionNumber === versionNumber);
  if (!thisVersion) notFound();

  const latestNonDeleted = [...allVersions].reverse().find((v) => !v.isDeleted);

  return (
    <div className="min-h-screen py-16">
      <article className="max-w-[720px] mx-auto px-6">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <Link href={`/${category}`}>
            <span className="text-xs font-medium uppercase tracking-wider text-blue-500 hover:text-blue-600">
              {cat.title}
            </span>
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-3 mb-2">
            {thisVersion.title}
          </h1>

          <p className="text-sm text-muted-foreground mb-6">
            {new Date(thisVersion.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {" · "}
            Version {thisVersion.versionNumber}
            {latestNonDeleted && thisVersion.versionNumber !== latestNonDeleted.versionNumber && (
              <>
                {" · "}
                <Link
                  href={`/${category}/${slug}`}
                  className="text-blue-500 hover:underline"
                >
                  View latest (v{latestNonDeleted.versionNumber})
                </Link>
              </>
            )}
          </p>

          {/* Version Timeline */}
          {allVersions.length > 1 && (
            <VersionTimeline
              versions={allVersions.map((v) => ({
                number: v.versionNumber,
                date: v.publishedAt,
                isDeleted: v.isDeleted,
                isCurrent: v.versionNumber === versionNumber,
              }))}
              baseUrl={`/${category}/${slug}`}
            />
          )}

          {/* Content */}
          {thisVersion.isDeleted ? (
            <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <p className="text-red-600 italic">
                This content was removed by Erdem.
              </p>
            </div>
          ) : (
            <div className="prose mt-8">
              {thisVersion.contentMd.split("\n").map((line, i) => {
                if (line.startsWith("### ")) return <h3 key={i}>{line.slice(4)}</h3>;
                if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
                if (line.startsWith("# ")) return <h2 key={i}>{line.slice(2)}</h2>;
                if (line.startsWith("- ")) return <li key={i}>{line.slice(2)}</li>;
                if (line.startsWith("**") && line.endsWith("**"))
                  return <p key={i}><strong>{line.slice(2, -2)}</strong></p>;
                if (line.trim() === "") return <br key={i} />;
                return <p key={i}>{line}</p>;
              })}
            </div>
          )}

          {thisVersion.changeNote && !thisVersion.isDeleted && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                Change note: {thisVersion.changeNote}
              </p>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
