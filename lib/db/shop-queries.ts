import { prisma } from "@/lib/prisma";

export function getTemplateWithComponents(id: string) {
  return prisma.shopTemplate.findUnique({
    where: { id },
    include: {
      components: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export function getVendorWithTemplate(vendorId: string) {
  return prisma.vendorProfile.findUnique({
    where: { id: vendorId },
    include: {
      shopTemplate: {
        include: {
          components: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
}

export function getTemplateComponents(templateId: string) {
  return prisma.shopComponent.findMany({
    where: { templateId },
    orderBy: { order: "asc" },
  });
}
