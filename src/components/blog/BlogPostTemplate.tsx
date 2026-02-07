import { ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Lightbulb } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReadingProgress from "./ReadingProgress";
import TableOfContents from "./TableOfContents";
import ShareButtons from "./ShareButtons";
import AuthorSection from "./AuthorSection";

interface BlogPostTemplateProps {
  title: string;
  author?: string;
  publishDate: string;
  readTime: string;
  category: string;
  categorySlug?: string;
  canonicalUrl: string;
  metaDescription: string;
  keywords: string;
  articleSchema: object;
  breadcrumbSchema: object;
  additionalSchemas?: object[];
  tldr?: string;
  children: ReactNode;
}

/**
 * SEO-optimized blog post template that enforces formatting guidelines:
 * - Single H1 title (55-65 chars recommended)
 * - Clean metadata line: "By {Author} · {Date} · {X} min read"
 * - TL;DR box for featured snippet eligibility
 * - Table of Contents from H2 headings
 * - Proper article semantics
 */
const BlogPostTemplate = ({
  title,
  author = "ClearlyLedger Team",
  publishDate,
  readTime,
  category,
  categorySlug,
  canonicalUrl,
  metaDescription,
  keywords,
  articleSchema,
  breadcrumbSchema,
  additionalSchemas = [],
  tldr,
  children,
}: BlogPostTemplateProps) => {
  // Development-only title length validation
  useEffect(() => {
    if (import.meta.env.DEV) {
      const titleLength = title.length;
      if (titleLength < 55) {
        console.warn(
          `[SEO] Title is ${titleLength} chars (target: 55-65). Consider making it longer: "${title}"`
        );
      } else if (titleLength > 65) {
        console.warn(
          `[SEO] Title is ${titleLength} chars (target: 55-65). Consider shortening: "${title}"`
        );
      }
    }
  }, [title]);

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgress />
      <Helmet>
        <title>{title} | ClearlyLedger</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="ClearlyLedger" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metaDescription} />
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
        {additionalSchemas.map((schema, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      <Navbar />

      <article className="pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{categorySlug || category}</span>
          </nav>

          {/* Header Section */}
          <header className="mb-14">
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
              {category}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4 mb-4">
              {title}
            </h1>
            {/* Clean SEO-optimized metadata line - no icons */}
            <p className="text-sm text-muted-foreground mb-4">
              By {author} · {publishDate} · {readTime}
            </p>
            <ShareButtons url={canonicalUrl} title={title} />
          </header>

          {/* Table of Contents - H2 headings only */}
          <TableOfContents h2Only />

          {/* TL;DR Box for Featured Snippet Eligibility */}
          {tldr && (
            <div className="mb-10 p-5 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground mb-1">TL;DR</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tldr}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="prose prose-lg blog-prose dark:prose-invert max-w-none">
            {children}
          </div>

          {/* Author Section for E-E-A-T */}
          <AuthorSection />
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPostTemplate;
