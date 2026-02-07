

# Improve Blog Spacing and Formatting

Based on comparing your current blog to the Dodo Payments reference, here are the key spacing improvements needed:

---

## Current Problems

| Issue | Current State | Reference Site |
|-------|--------------|----------------|
| Line height | Default (~1.6) | More generous (~1.8) |
| Paragraph spacing | Compact (1rem) | Airy (1.5-2rem) |
| H2 margin top | 1.5em | 2.5-3em |
| H2 margin bottom | 0.5em | 1em |
| Text size | Mixed (prose-neutral/prose-lg) | Consistent large text |
| Overall feel | Dense, cramped | Spacious, readable |

---

## Implementation Plan

### 1. Add Custom Blog Prose Styles to CSS

**File: `src/index.css`**

Add new CSS classes specifically for blog content with better spacing:

```css
/* Blog-specific prose overrides for better readability */
.blog-prose {
  @apply text-lg leading-relaxed;
}

.blog-prose p {
  @apply mb-6;
}

.blog-prose h2 {
  @apply mt-12 mb-6 text-2xl font-bold;
}

.blog-prose h3 {
  @apply mt-8 mb-4 text-xl font-semibold;
}

.blog-prose ul, .blog-prose ol {
  @apply my-6 space-y-2;
}

.blog-prose li {
  @apply pl-2;
}

.blog-prose blockquote {
  @apply my-8;
}
```

---

### 2. Update BlogPostTemplate Component

**File: `src/components/blog/BlogPostTemplate.tsx`**

Changes:
- Replace `prose prose-neutral` with `prose prose-lg blog-prose`
- Increase header section margins
- Add more spacing to TL;DR box
- Improve overall container padding

Key updates:
- Header margin: `mb-10` to `mb-14`
- TL;DR box margin: `mb-8` to `mb-10`
- Content wrapper: Add `blog-prose` class
- Main content area: Increase vertical padding

---

### 3. Update All 11 Blog Posts

Each blog post needs consistent prose classes. Files to update:

1. `BlogPost1.tsx`
2. `BlogPost2.tsx`
3. `BlogPost3.tsx`
4. `BlogPost4.tsx`
5. `BlogPostAustralia.tsx`
6. `BlogPostJapan.tsx`
7. `BlogPostMalaysia.tsx`
8. `BlogPostRuleBasedVsAI.tsx`
9. `BlogPostSouthAfrica.tsx`
10. `BlogPostUK.tsx`
11. `BlogPostWhyBanksDontProvideCSV.tsx`

**Changes per file:**
- Replace `prose prose-neutral dark:prose-invert` with `prose prose-lg blog-prose dark:prose-invert`
- Ensure consistent `max-w-none` class
- Remove any conflicting inline spacing styles

---

### 4. Improve Table of Contents Styling

**File: `src/components/blog/TableOfContents.tsx`**

Changes:
- Increase padding and margins
- Add more visual separation
- Improve spacing between TOC items

---

## CSS Spacing Values (Tailwind Reference)

| Spacing | Value | Usage |
|---------|-------|-------|
| `mb-6` | 1.5rem | Between paragraphs |
| `mt-12` | 3rem | Before H2 headings |
| `mb-6` | 1.5rem | After H2 headings |
| `mt-8` | 2rem | Before H3 headings |
| `mb-4` | 1rem | After H3 headings |
| `my-6` | 1.5rem | Around lists |

---

## Expected Visual Result

After implementation:
- **40% more whitespace** between content blocks
- **Cleaner H2 separation** from surrounding text
- **More readable paragraphs** with relaxed line-height
- **Consistent styling** across all 11 blog posts
- **Professional, modern appearance** matching the Dodo Payments reference

---

## Technical Details

The changes use Tailwind CSS utilities and custom CSS overrides. The `blog-prose` class will extend the default prose typography plugin with blog-specific spacing values. This approach:

- Maintains SEO-friendly semantic HTML
- Works with both light and dark themes
- Keeps prose plugin benefits (smart quotes, etc.)
- Allows granular control over blog typography

