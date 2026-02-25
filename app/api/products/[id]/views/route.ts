import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { successResponse, errorResponse } from "@/lib/api/responses";
import { recordProductView } from "@/lib/db/ecommerce-queries";

// POST - Record a product view
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: productId } = await params;

    // Get optional user session (views are tracked for both authenticated and anonymous users)
    const session = await auth();
    const userId = session?.user?.id ?? undefined;

    // Use a session-based identifier for anonymous users
    const sessionId =
      req.headers.get("x-session-id") ??
      req.headers.get("x-forwarded-for") ??
      "anonymous";

    await recordProductView(productId, userId, sessionId);

    return successResponse({ message: "View recorded" });
  } catch (error) {
    return errorResponse("Failed to record view", 500, error);
  }
}
