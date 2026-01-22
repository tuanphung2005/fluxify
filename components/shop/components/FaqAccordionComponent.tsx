"use client";

import type { FaqAccordionConfig } from "@/types/shop";

import { Accordion, AccordionItem } from "@heroui/accordion";
import { HelpCircle } from "lucide-react";

interface FaqAccordionComponentProps {
  config: FaqAccordionConfig;
}

export default function FaqAccordionComponent({
  config,
}: FaqAccordionComponentProps) {
  const { title, items, backgroundColor } = config;

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section
      className="py-16 px-4"
      style={{ backgroundColor: backgroundColor || "transparent" }}
    >
      <div className="max-w-3xl mx-auto">
        {title && (
          <div className="text-center mb-12">
            <HelpCircle
              className="mx-auto mb-4 text-primary opacity-70"
              size={48}
            />
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
        )}

        <Accordion
          className="gap-4"
          selectionMode="multiple"
          variant="splitted"
        >
          {items.map((item, index) => (
            <AccordionItem
              key={index}
              aria-label={item.question}
              classNames={{
                base: "py-2 shadow-sm",
                title: "text-default-700",
                content: "text-default-600",
              }}
              title={
                <span className="font-semibold text-left">{item.question}</span>
              }
            >
              <div className="pb-4 text-default-600 leading-relaxed">
                {item.answer}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
