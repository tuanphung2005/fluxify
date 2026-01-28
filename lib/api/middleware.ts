import { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { errorResponse } from "@/lib/api/responses";
import {
  checkRateLimit,
  getClientIdentifier,
  rateLimitPresets,
  rateLimitExceededResponse,
} from "@/lib/api/rate-limit";

type UserRole = "CUSTOMER" | "VENDOR" | "ADMIN";

export interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  };
}

export interface AuthOptions {
  requiredRoles?: UserRole[];
  rateLimit?: keyof typeof rateLimitPresets | false;
}

/**
 * Middleware to check authentication and authorization for API routes.
 * Returns null if authorized, or an error Response if not.
 *
 * @example
 * const authResult = await requireAuth(req, { requiredRoles: ["ADMIN"] });
 * if (authResult.error) return authResult.error;
 * // Use authResult.user
 */
export async function requireAuth(
  req: NextRequest,
  options: AuthOptions = {},
): Promise<
  | { user: AuthenticatedRequest["user"]; error?: never }
  | { user?: never; error: Response }
> {
  const { requiredRoles, rateLimit = "standard" } = options;

  // rate limiting
  if (rateLimit !== false) {
    const preset = rateLimitPresets[rateLimit];
    const rateLimitResult = checkRateLimit(getClientIdentifier(req), preset);

    if (!rateLimitResult.allowed) {
      return { error: rateLimitExceededResponse(rateLimitResult.resetTime) };
    }
  }

  // Check auth
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return { error: errorResponse("Unauthorized", 401) };
  }

  const user: AuthenticatedRequest["user"] = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };

  // check role auth
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(user.role)) {
      return { error: errorResponse("Forbidden", 403) };
    }
  }

  return { user };
}

/**
 * admin middleware
 */
export async function requireAdmin(req: NextRequest) {
  return requireAuth(req, { requiredRoles: ["ADMIN"], rateLimit: "admin" });
}

/**
 * Vendor middleware
 */
export async function requireVendor(req: NextRequest) {
  return requireAuth(req, {
    requiredRoles: ["VENDOR", "ADMIN"],
    rateLimit: "standard",
  });
}

/**
 * Customer authentication (any)
 */
export async function requireUser(req: NextRequest) {
  return requireAuth(req, { rateLimit: "standard" });
}
