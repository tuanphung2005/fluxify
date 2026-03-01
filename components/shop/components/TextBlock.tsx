"use client";

import DOMPurify from "dompurify";

import { TextBlockConfig } from "@/types/shop";
import { cn } from "@/lib/utils";

interface TextBlockProps {
  config: TextBlockConfig;
}

export default function TextBlock({ config }: TextBlockProps) {
  const {
    content,
    alignment = "left",
    backgroundColor = "transparent",
    textColor,
    padding = "medium",
  } = config;

  const paddingClasses = {
    small: "py-4 px-4",
    medium: "py-8 px-6",
    large: "py-16 px-8",
  };

  const sanitizedContent =
    typeof window !== "undefined" ? DOMPurify.sanitize(content) : content;

  return (
    <div
      className={cn("w-full transition-colors", paddingClasses[padding])}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          className={cn("prose dark:prose-invert", {
            "text-left": alignment === "left",
            "text-center mx-auto": alignment === "center",
            "text-right ml-auto": alignment === "right",
          })}
          style={{ color: textColor }}
        />
      </div>
    </div>
  );
}
