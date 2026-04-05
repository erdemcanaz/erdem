import { notFound } from "next/navigation";
import { CATEGORIES, type CategorySlug, AGENT_COLORS } from "@/lib/constants";
import { db, initDB } from "@/db";
import { posts, postVersions, agentRuns, aiAgents } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { VersionTimeline } from "@/components/posts/version-timeline";
import { AgentCommentarySection } from "@/components/posts/agent-commentary";
import { Markdown } from "@/components/ui/markdown";

interface PostPageProps {
  params: Promise<{ category: string; slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: PostPageProps) {
  const { category, slug } = await params;
  const cat = CATEGORIES[category as CategorySlug];
  if (!cat) notFound();

  initDB();

  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.category, category)));

  if (!post || !post.isPublished) notFound();

  const versions = await db
    .select()
    .from(postVersions)
    .where(eq(postVersions.postId, post.id))
    .orderBy(postVersions.versionNumber);

  const latestNonDeleted = [...versions].reverse().find((v) => !v.isDeleted);
  if (!latestNonDeleted) notFound();

  // Get agent runs for this version
  const runs = await db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.postVersionId, latestNonDeleted.id));

  const agents = await db.select().from(aiAgents).orderBy(aiAgents.sortOrder);

  return (
    <div className="min-h-screen py-16">
      <article className="max-w-[720px] mx-auto px-6">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {/* Category label */}
          <Link href={`/${category}`}>
            <span className="text-xs font-medium uppercase tracking-wider text-blue-500 hover:text-blue-600">
              {cat.title}
            </span>
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-3 mb-2">
            {latestNonDeleted.title}
          </h1>

          <p className="text-sm text-muted-foreground mb-6">
            {new Date(latestNonDeleted.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {" · "}
            Version {latestNonDeleted.versionNumber}
          </p>

          {/* Version Timeline */}
          {versions.length > 1 && (
            <VersionTimeline
              versions={versions.map((v) => ({
                number: v.versionNumber,
                date: v.publishedAt,
                isDeleted: v.isDeleted,
                isCurrent: v.versionNumber === latestNonDeleted.versionNumber,
              }))}
              baseUrl={`/${category}/${slug}`}
            />
          )}

          {/* Content */}
          <div className="prose mt-8">
            <Markdown content={latestNonDeleted.contentMd} />
          </div>
          {/* References */}
          {(() => {
            const refs = latestNonDeleted.references ? JSON.parse(latestNonDeleted.references) : [];
            if (refs.length === 0) return null;
            return (
              <div className="mt-10 pt-6 border-t border-border">
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                  References & Inspirations
                </h3>
                <ul className="space-y-2">
                  {refs.map((ref: { label: string; url: string }, i: number) => (
                    <li key={i} className="text-sm text-foreground/80">
                      {ref.url ? (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {ref.label}
                        </a>
                      ) : (
                        ref.label
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
        </div>

        {/* Agent Commentaries */}
        {runs.length > 0 && (
          <AgentCommentarySection runs={runs} agents={agents} />
        )}
      </article>
    </div>
  );
}
