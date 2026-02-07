/**
 * Development-only SEO validation utility for blog posts.
 * Runs automatically in development mode and logs warnings to console.
 * Does not block builds or affect production.
 */

interface ValidationResult {
  type: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
}

/**
 * Validates blog post SEO structure and logs warnings in development.
 * Call this in useEffect within blog post components.
 * 
 * @param contentSelector - CSS selector for the article content (default: "article")
 */
export function validateBlogSeo(contentSelector = "article"): ValidationResult[] {
  if (import.meta.env.PROD) {
    return [];
  }

  const results: ValidationResult[] = [];
  const article = document.querySelector(contentSelector);

  if (!article) {
    results.push({
      type: "error",
      message: "No article element found",
      suggestion: "Wrap blog content in an <article> tag",
    });
    return results;
  }

  // 1. Validate H1 count (must be exactly 1)
  const h1Elements = article.querySelectorAll("h1");
  if (h1Elements.length === 0) {
    results.push({
      type: "error",
      message: "No H1 heading found",
      suggestion: "Add exactly one H1 heading as the page title",
    });
  } else if (h1Elements.length > 1) {
    results.push({
      type: "error",
      message: `Found ${h1Elements.length} H1 headings (should be exactly 1)`,
      suggestion: "Use only one H1 per page; use H2/H3 for sections",
    });
  }

  // 2. Validate H1 length (55-65 characters target)
  if (h1Elements.length > 0) {
    const h1Text = h1Elements[0].textContent || "";
    const h1Length = h1Text.length;
    if (h1Length < 55) {
      results.push({
        type: "warning",
        message: `H1 is ${h1Length} chars (target: 55-65): "${h1Text.substring(0, 40)}..."`,
        suggestion: "Consider making the title longer for better SEO",
      });
    } else if (h1Length > 65) {
      results.push({
        type: "warning",
        message: `H1 is ${h1Length} chars (target: 55-65): "${h1Text.substring(0, 40)}..."`,
        suggestion: "Consider shortening the title for SERP display",
      });
    }
  }

  // 3. Validate heading hierarchy (no skipped levels)
  const allHeadings = article.querySelectorAll("h1, h2, h3, h4, h5, h6");
  let lastLevel = 0;
  allHeadings.forEach((heading) => {
    const level = parseInt(heading.tagName.charAt(1));
    if (lastLevel > 0 && level > lastLevel + 1) {
      results.push({
        type: "warning",
        message: `Heading hierarchy skipped: H${lastLevel} → H${level}`,
        suggestion: `Add an H${lastLevel + 1} before "${heading.textContent?.substring(0, 30)}..."`,
      });
    }
    lastLevel = level;
  });

  // 4. Check for long paragraphs (>90 words)
  const paragraphs = article.querySelectorAll("p");
  paragraphs.forEach((p, index) => {
    const text = p.textContent || "";
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount > 90) {
      results.push({
        type: "warning",
        message: `Paragraph ${index + 1} has ${wordCount} words (max recommended: 90)`,
        suggestion: `Consider splitting: "${text.substring(0, 50)}..."`,
      });
    }
  });

  // 5. Validate TOC matches H2 headings
  const h2Elements = article.querySelectorAll("h2");
  const tocItems = article.querySelectorAll("nav ul li button, nav ul li a");
  
  if (tocItems.length > 0 && h2Elements.length > 0) {
    const h2Texts = Array.from(h2Elements).map((h) => h.textContent?.trim());
    const tocTexts = Array.from(tocItems).map((t) => t.textContent?.trim());
    
    // Check if TOC contains items not in H2s (ignoring H3s if h2Only)
    const missingInH2 = tocTexts.filter((t) => !h2Texts.includes(t));
    if (missingInH2.length > 0) {
      results.push({
        type: "info",
        message: `TOC may include H3s: ${missingInH2.slice(0, 2).join(", ")}...`,
        suggestion: "Consider using h2Only prop for TableOfContents",
      });
    }
  }

  // 6. Check for primary keyword in first 100 words
  const firstParagraph = article.querySelector("p.lead, article > div > p:first-of-type");
  if (firstParagraph) {
    const introText = firstParagraph.textContent || "";
    const introWords = introText.split(/\s+/).filter(Boolean);
    if (introWords.length < 50) {
      results.push({
        type: "warning",
        message: `Introduction is ${introWords.length} words (target: 50-80)`,
        suggestion: "Expand the introduction with primary keyword",
      });
    } else if (introWords.length > 80) {
      results.push({
        type: "warning",
        message: `Introduction is ${introWords.length} words (target: 50-80)`,
        suggestion: "Shorten the introduction paragraph",
      });
    }
  }

  // Log results in development
  results.forEach((result) => {
    const prefix = `[SEO ${result.type.toUpperCase()}]`;
    const message = `${prefix} ${result.message}`;
    
    switch (result.type) {
      case "error":
        console.error(message, result.suggestion ? `\n  → ${result.suggestion}` : "");
        break;
      case "warning":
        console.warn(message, result.suggestion ? `\n  → ${result.suggestion}` : "");
        break;
      case "info":
        console.info(message, result.suggestion ? `\n  → ${result.suggestion}` : "");
        break;
    }
  });

  return results;
}

/**
 * React hook for SEO validation in blog posts.
 * Runs validation after component mounts.
 */
export function useBlogSeoValidation(contentSelector = "article") {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { useEffect } = require("react");
    useEffect(() => {
      // Delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        validateBlogSeo(contentSelector);
      }, 500);
      return () => clearTimeout(timer);
    }, [contentSelector]);
  }
}
