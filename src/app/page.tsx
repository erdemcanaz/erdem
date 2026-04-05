import Link from "next/link";
import { CATEGORIES, SITE } from "@/lib/constants";
import { getCategoryIcon } from "@/components/icons/category-icons";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Category Cards */}
      <section className="pt-8 pb-12 md:pt-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(CATEGORIES).map((category, index) => (
              <Link
                key={category.slug}
                href={`/${category.slug}`}
                className={`group bg-card border border-border rounded-xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center text-center animate-fade-in-up animate-delay-${(index) * 100}`}
              >
                <div className="text-muted-foreground/70 group-hover:text-muted-foreground transition-colors duration-300 mb-6">
                  {getCategoryIcon(category.icon, "w-40 h-40 md:w-48 md:h-48")}
                </div>

                <h2 className="text-xl font-semibold text-foreground mb-3">
                  {category.title}
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                  {category.shortTagline}
                </p>

                <span className="text-sm font-medium text-blue-500 group-hover:text-blue-600 transition-colors">
                  Explore &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="pt-8 pb-12 md:pt-12 md:pb-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight animate-fade-in-up animate-delay-300">
            {SITE.heroTitle}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-[600px] mx-auto leading-relaxed animate-fade-in-up animate-delay-400">
            {SITE.heroSubtitle}
          </p>
        </div>
      </section>

    </div>
  );
}
