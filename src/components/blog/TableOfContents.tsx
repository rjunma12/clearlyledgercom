import { useEffect, useState } from "react";
import { List } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentSelector?: string;
  /** When true, only shows H2 headings (recommended for SEO) */
  h2Only?: boolean;
}

const TableOfContents = ({ 
  contentSelector = "article",
  h2Only = false 
}: TableOfContentsProps) => {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const article = document.querySelector(contentSelector);
    if (!article) return;

    // Select only H2s if h2Only is true, otherwise H2 and H3
    const headingSelector = h2Only ? "h2" : "h2, h3";
    const headings = article.querySelectorAll(headingSelector);
    const tocItems: TOCItem[] = [];

    headings.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`;
      if (!heading.id) {
        heading.id = id;
      }
      tocItems.push({
        id,
        text: heading.textContent || "",
        level: heading.tagName === "H2" ? 2 : 3,
      });
    });

    setItems(tocItems);
  }, [contentSelector, h2Only]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="bg-muted/30 border border-border rounded-lg p-5 mb-10">
      <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-foreground">
        <List className="w-4 h-4" />
        Table of Contents
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className={`${item.level === 3 ? "ml-4" : ""}`}
          >
            <button
              onClick={() => handleClick(item.id)}
              className={`text-left text-sm leading-relaxed transition-colors hover:text-primary ${
                activeId === item.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
