"use client";

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

  return (
    <div
      className={cn("w-full transition-colors", paddingClasses[padding])}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div
        className={cn("prose max-w-none dark:prose-invert", {
          "text-left": alignment === "left",
          "text-center": alignment === "center",
          "text-right": alignment === "right",
        })}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{ color: textColor }}
      />
    </div>
  );
}
