import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/auth-helpers";
import {
  errorResponse,
  successResponse,
  isErrorResult,
} from "@/lib/api/responses";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (isErrorResult(auth)) {
    return errorResponse(auth.error, auth.status);
  }

  try {
    const { isActive } = await request.json();
    const { id } = await params;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    return successResponse(user);
  } catch (error) {
    return errorResponse("Failed to update user status", 500, error);
  }
}
