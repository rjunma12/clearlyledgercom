import { Link } from "react-router-dom";
import { Calendar, ArrowRight, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { useState } from "react";

const blogPosts = [
  {
    slug: "why-banks-dont-provide-csv-excel-statements",
    title: "Why Banks Don't Provide Past Transactions in Excel or CSV Format",
    excerpt: "Learn why banks globally only provide historical statements as PDFs, why generic converters fail, and how specialized tools solve this universal problem.",
    date: "January 23, 2026",
    category: "Thought Leadership",
    readTime: "12 min read",
    featured: true
  },
  {
    slug: "australia-bank-statement-converter",
    title: "Convert Australian Bank Statement PDFs to Excel - CBA, ANZ, Westpac, NAB & More",
    excerpt: "Complete guide to converting CBA, ANZ, Westpac, NAB, ING, and Macquarie bank statements to Excel. MYOB and Xero compatible exports with AUD formatting.",
    date: "January 23, 2025",
    category: "Regional",
    readTime: "7 min read",
    featured: true
  },
  {
    slug: "convert-bank-statements-to-excel",
    title: "How to Convert Bank Statement PDFs to Excel (Step-by-Step Guide)",
    excerpt: "Learn how to convert PDF bank statements to Excel in minutes. Step-by-step workflow, common issues, and troubleshooting tips to make financial data usable.",
    date: "January 15, 2025",
    category: "Tutorial",
    readTime: "6 min read",
    featured: true
  },
  {
    slug: "indian-bank-statement-converter",
    title: "Best Tools for Converting Indian Bank Statement PDFs to Excel",
    excerpt: "If you work with Indian bank statement PDFs, this guide highlights tools, privacy tips, and how to convert to Excel with local formats and security in mind.",
    date: "January 12, 2025",
    category: "Regional",
    readTime: "5 min read",
    featured: false
  },
  {
    slug: "privacy-secure-bank-statement-conversion",
    title: "Bank Statement Conversion: Ensuring Privacy & Secure Processing",
    excerpt: "Financial documents are sensitive. Learn best practices for secure bank statement conversion, privacy-first workflows, and how to protect your data.",
    date: "January 8, 2025",
    category: "Security",
    readTime: "5 min read",
    featured: true
  },
  {
    slug: "accurate-bank-statement-conversion-workflows",
    title: "Improve Your Financial Workflows With Accurate Bank Statement Conversion",
    excerpt: "See how accurate bank statement conversion improves financial workflows, reduces manual errors, and frees up time for analysis and decision-making.",
    date: "January 5, 2025",
    category: "Productivity",
    readTime: "6 min read",
    featured: false
  },
  {
    slug: "south-africa-bank-statement-converter",
    title: "Convert South African Bank Statement PDFs to Excel - Complete Guide",
    excerpt: "Guide for converting South African bank statements from ABSA, Standard Bank, FNB, Nedbank, and Capitec to Excel with privacy and local format support.",
    date: "January 21, 2025",
    category: "Regional",
    readTime: "5 min read",
    featured: false
  },
  {
    slug: "malaysia-bank-statement-converter",
    title: "Best Tools for Converting Malaysian Bank Statement PDFs to Excel",
    excerpt: "Convert Maybank, CIMB, Public Bank, and RHB statements to Excel. Handles MYR formats, bilingual statements, and PDPA-compliant processing.",
    date: "January 21, 2025",
    category: "Regional",
    readTime: "5 min read",
    featured: false
  },
  {
    slug: "uk-bank-statement-converter",
    title: "Convert UK Bank Statement PDFs to Excel - Barclays, HSBC, Lloyds & More",
    excerpt: "Step-by-step guide for converting British bank statements to Excel. Covers Barclays, HSBC, Lloyds, NatWest with UK GDPR compliance.",
    date: "January 21, 2025",
    category: "Regional",
    readTime: "5 min read",
    featured: false
  },
  {
    slug: "japan-bank-statement-converter",
    title: "Japanese Bank Statement PDF to Excel Converter - Complete Guide",
    excerpt: "Convert MUFG, SMBC, Mizuho, and Japan Post Bank statements to Excel. Handles Kanji, Zenkaku numbers, and Japanese date formats.",
    date: "January 21, 2025",
    category: "Regional",
    readTime: "5 min read",
    featured: false
  }
];

const categories = ["All", "Thought Leadership", "Tutorial", "Regional", "Security", "Productivity"];

// JSON-LD Schema for CollectionPage + ItemList
const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "ClearlyLedger Blog - Bank Statement to Excel Tips & Guides",
  "description": "Helpful articles, tips, and insights on converting bank statement PDFs to Excel, privacy practices, multi-region bank statement handling, and financial data automation.",
  "url": "https://clearlyledger.com/blog",
  "publisher": {
    "@type": "Organization",
    "name": "ClearlyLedger",
    "url": "https://clearlyledger.com"
  },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": blogPosts.map((post, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://clearlyledger.com/blog/${post.slug}`,
      "name": post.title
    }))
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://clearlyledger.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://clearlyledger.com/blog"
    }
  ]
};

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const featuredPosts = blogPosts.filter((post) => post.featured);
  const filteredPosts = activeCategory === "All" 
    ? blogPosts 
    : blogPosts.filter((post) => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Blog - ClearlyLedger | Bank Statement to Excel Tips & Guides</title>
        <meta name="description" content="Helpful articles, tips, and insights on converting bank statement PDFs to Excel, privacy practices, multi-region bank statement handling, and financial data automation." />
        <meta name="keywords" content="bank statement to Excel, PDF to Excel converter, financial data automation, secure bank statement conversion" />
        <link rel="canonical" href="https://clearlyledger.com/blog" />
        <script type="application/ld+json">
          {JSON.stringify(collectionPageSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Helpful articles, tips, and insights on converting bank statement PDFs to Excel, privacy practices, multi-region bank statement handling, and financial data automation.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      <section className="pb-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {activeCategory === "All" && featuredPosts.length > 0 && (
        <section className="pb-12 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-primary fill-primary" />
              <h2 className="text-xl font-semibold text-foreground">Featured Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-xl overflow-hidden hover:border-primary/40 transition-colors group"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded">
                        Featured
                      </span>
                      <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.date}
                      </div>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                      >
                        Read more
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section className="pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/features">
              <Button variant="outline" size="sm">Features</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="sm">Pricing</Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="sm">Contact Us</Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="sm">About Us</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {activeCategory !== "All" && (
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {activeCategory} Articles
            </h2>
          )}
          {activeCategory === "All" && (
            <h2 className="text-xl font-semibold text-foreground mb-6">
              All Articles
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPosts.map((post) => (
              <article 
                key={post.slug}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors group"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    <Link to={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.date}
                    </div>
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Read more
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Ready to convert your bank statements?
          </h2>
          <p className="text-muted-foreground mb-6">
            Try our converter and get structured Excel output in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button variant="hero">Try Converter Free</Button>
            </Link>
            <Link to="/features">
              <Button variant="glass">View Features</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
