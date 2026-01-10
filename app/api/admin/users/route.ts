import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/middleware";
import { errorResponse, successResponse } from "@/lib/api/responses";

export async function GET(req: NextRequest) {
    const auth = await requireAdmin(req);
    if (auth.error) return auth.error;

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
        const search = searchParams.get("search") || "";
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    vendorProfile: {
                        select: { id: true }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit,
            }),
            prisma.user.count({ where })
        ]);

        return successResponse({
            users,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        return errorResponse("Failed to fetch users", 500, error);
    }
}
