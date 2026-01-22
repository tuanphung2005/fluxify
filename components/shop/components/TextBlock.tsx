"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

import { TextBlockConfig } from "@/types/shop";
import { BaseComponentProps } from "@/types/shop-components";

export default function TextBlock({
  config,
}: BaseComponentProps<TextBlockConfig>) {
  const {
    content = "<p>Add your text content here...</p>",
    alignment = "left",
    backgroundColor,
    textColor,
    padding = "medium",
  } = config as TextBlockConfig;

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[alignment];

  const paddingClasses = {
    small: "py-6 px-4",
    medium: "py-12 px-6",
    large: "py-20 px-8",
  }[padding];

  // sanitizer
  const sanitizedContent = useMemo(() => {
    if (typeof window === "undefined") return content;

    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "a",
        "blockquote",
      ],
      ALLOWED_ATTR: ["href", "target", "rel"],
    });
  }, [content]);

  return (
    <div
      className={`${paddingClasses}`}
      style={{
        backgroundColor: backgroundColor || "transparent",
        color: textColor || "inherit",
      }}
    >
      <div
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        className={`max-w-4xl mx-auto prose prose-lg ${alignmentClasses}`}
      />
    </div>
  );
}
