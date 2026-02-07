

# Blog Formatting Guidelines Implementation Plan

## Current State Analysis

After reviewing the existing blog infrastructure, here's how it compares to your guidelines:

| Guideline | Current Status | Action Needed |
|-----------|----------------|---------------|
| H1 Title (55-65 chars, keyword early) | Partial - some titles exceed limits | Audit & update titles |
| Metadata block (Author · Date · Read time) | Uses icons, not clean text | Simplify to text-only format |
| Introduction (50-80 words, no bullets/headings) | Some have "lead" class but length varies | Standardize length |
| Table of Contents (from H2s only) | Uses H2+H3, auto-generated | Keep H2-only option |
| Heading hierarchy (H1→H2→H3) | Generally correct | Minor cleanup |
| Paragraph formatting (max 3 lines, 60-90 words) | Some paragraphs are too long | Content review |
| Lists (3-7 items, start with noun/verb) | Mostly compliant | Minor adjustments |
| Internal links (2-4 per article) | Present but varies | Standardize |
| Image placeholders | Not currently used | Add to template |
| Conclusion/Key Takeaways | Present in some, not standardized | Add consistent section |
| No emojis/hype language | Compliant | Maintain |

---

## Files to Create/Modify

### 1. Create Blog Post Template Component

Create a reusable template that enforces the guidelines:

**New File: `src/components/blog/BlogPostTemplate.tsx`**

```text
Purpose: Provide a standardized wrapper for all blog posts that:
- Enforces metadata format: "By {Author} · {Date} · {X} min read"
- Removes Calendar/Clock icons from metadata line
- Includes validation for structure compliance
- Provides consistent TL;DR box styling
- Adds image placeholder helper component
- Standardizes conclusion/key takeaways section
```

### 2. Update AuthorSection Component

**File: `src/components/blog/AuthorSection.tsx`**

Changes:
- Keep as-is for bottom author section (E-E-A-T compliance)
- This is separate from the metadata line

### 3. Update TableOfContents Component

**File: `src/components/blog/TableOfContents.tsx`**

Changes:
- Add option to show H2s only (default) vs H2+H3
- Ensure clickable anchor links work correctly
- Add validation that TOC matches H2 headings exactly

### 4. Update Individual Blog Posts

All 11 blog post files need updates:

**Common changes across all posts:**

1. **Metadata line** - Remove icons, use text format:
   ```tsx
   // Current (with icons):
   <Calendar className="w-4 h-4" /> January 15, 2025
   
   // Updated (clean text):
   By ClearlyLedger Team · January 15, 2025 · 6 min read
   ```

2. **Introduction** - Ensure 50-80 words, no bullets/headings, contains primary keyword

3. **H1 titles** - Audit character length (55-65 chars target)

4. **Conclusion** - Add consistent "Key Takeaways" section before CTA

5. **Image placeholders** - Add `[Image: descriptive alt text]` after relevant H2s where appropriate

---

## Technical Implementation Details

### Phase 1: Create Reusable Components

**BlogPostTemplate.tsx structure:**

```tsx
interface BlogPostTemplateProps {
  title: string;           // H1 - validates 55-65 chars
  author?: string;         // Default: "ClearlyLedger Team"
  publishDate: string;     // Format: "January 15, 2025"
  readTime: string;        // Format: "6 min read"
  category: string;        // e.g., "Tutorial", "Regional"
  canonicalUrl: string;
  metaDescription: string;
  keywords: string;
  articleSchema: object;
  breadcrumbSchema: object;
  children: ReactNode;
}
```

**Key features:**
- Validates title length with console warning if outside 55-65 chars
- Renders clean metadata line without icons
- Includes ReadingProgress and ShareButtons
- Wraps content in proper `<article>` semantics

### Phase 2: Update Blog Posts

**Priority order (pillar content first):**

1. `BlogPostRuleBasedVsAI.tsx` - Thought leadership pillar
2. `BlogPostWhyBanksDontProvideCSV.tsx` - Thought leadership pillar
3. `BlogPost1.tsx` - Tutorial (high traffic)
4. `BlogPost3.tsx` - Security focus
5. Regional posts (BlogPostAustralia, BlogPostUK, etc.)
6. Remaining posts

**Changes per post:**

```tsx
// BEFORE (current metadata)
<div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
  <div className="flex items-center gap-1.5">
    <Calendar className="w-4 h-4" />
    January 15, 2025
  </div>
  <div className="flex items-center gap-1.5">
    <Clock className="w-4 h-4" />
    6 min read
  </div>
</div>

// AFTER (clean SEO format)
<p className="text-sm text-muted-foreground mb-4">
  By ClearlyLedger Team · January 15, 2025 · 6 min read
</p>
```

### Phase 3: Add Key Takeaways Sections

**Standard format for all posts:**

```tsx
<section>
  <h2>Key Takeaways</h2>
  <ul>
    <li>Takeaway 1 - reinforces search intent</li>
    <li>Takeaway 2 - summarizes main point</li>
    <li>Takeaway 3 - actionable next step</li>
  </ul>
  <p>
    {/* Optional soft CTA - no new information */}
    Ready to try it yourself? Start with our free converter.
  </p>
</section>
```

---

## SEO Validation Checklist Implementation

Add a development-only validation utility:

**New File: `src/lib/blogSeoValidator.ts`**

```text
Purpose: Console warnings during development for:
- H1 count (must be exactly 1)
- H1 length (55-65 characters target)
- Paragraph length (warn if >90 words)
- Heading hierarchy (no skipped levels)
- Primary keyword in first 100 words
- TOC matches H2s exactly

This runs only in development mode and logs warnings
without blocking the build.
```

---

## Summary of Changes

| Component | Action | Priority |
|-----------|--------|----------|
| `BlogPostTemplate.tsx` | Create new | High |
| `blogSeoValidator.ts` | Create new | Medium |
| `TableOfContents.tsx` | Add H2-only option | Medium |
| All 11 blog posts | Update metadata format | High |
| All 11 blog posts | Add Key Takeaways section | High |
| All 11 blog posts | Audit paragraph lengths | Medium |
| Blog post index | Keep as-is (already SEO-optimized) | None |

---

## Expected Results

After implementation:
- All blog posts follow consistent, SEO-optimized structure
- Clean metadata lines improve SERP appearance
- Key Takeaways sections boost featured snippet eligibility
- Development warnings catch formatting issues early
- Mobile readability improved through shorter paragraphs
- E-E-A-T signals strengthened with consistent author attribution

