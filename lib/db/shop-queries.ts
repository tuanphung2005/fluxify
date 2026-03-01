import { prisma } from "@/lib/prisma";

export function getTemplateComponents(templateId: string) {
  return prisma.shopComponent.findMany({
    where: { templateId },
    orderBy: { order: "asc" },
  });
}
