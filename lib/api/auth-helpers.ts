import { isErrorResult } from "./responses";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface AuthResult {
  vendor: {
    id: string;
    storeName: string;
    description: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    emailVerified: boolean;
  };
}

export interface AuthError {
  error: string;
  status: number;
}

/**
 * Authenticates the current session and retrieves the vendor profile
 * @returns AuthResult on success, AuthError on failure
 */
export async function getAuthenticatedVendor(): Promise<
  AuthResult | AuthError
> {
  const session = await auth();

  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { vendorProfile: true },
  });

  if (!user?.vendorProfile) {
    // If user is ADMIN, create a vendor profile automatically
    if (user?.role === "ADMIN") {
      const newVendor = await prisma.vendorProfile.create({
        data: {
          userId: user.id,
          storeName: "Admin Store",
          description: "Auto-generated store for Admin",
        },
      });

      return {
        vendor: newVendor,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: !!user.emailVerified,
        },
      };
    }

    return { error: "Vendor profile not found", status: 404 };
  }

  // Check email verification for non-admin vendors
  if (user.role !== "ADMIN" && !user.emailVerified) {
    return { error: "Vui lòng xác thực email để sử dụng tính năng này", status: 403 };
  }

  return {
    vendor: user.vendorProfile,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: !!user.emailVerified,
    },
  };
}

/**
 * Verifies that a template belongs to the given vendor
 * @param templateId - The template ID to verify
 * @param vendorId - The vendor ID that should own the template
 * @returns The template on success, AuthError on failure
 */
export async function verifyTemplateOwnership(
  templateId: string,
  vendorId: string,
) {
  const template = await prisma.shopTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template || template.vendorId !== vendorId) {
    return { error: "Unauthorized", status: 403 };
  }

  return { template };
}

/**
 * Verifies that a component belongs to a template owned by the given vendor
 * @param componentId - The component ID to verify
 * @param vendorId - The vendor ID that should own the component
 * @returns The component on success, AuthError on failure
 */
export async function verifyComponentOwnership(
  componentId: string,
  vendorId: string,
) {
  const component = await prisma.shopComponent.findUnique({
    where: { id: componentId },
    include: { template: true },
  });

  if (!component || component.template.vendorId !== vendorId) {
    return { error: "Unauthorized", status: 403 };
  }

  return { component };
}

export interface UserAuthResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

/**
 * Authenticates the current session and retrieves the full user from database
 * Use this for routes that need authenticated user data but not vendor-specific
 * @returns UserAuthResult on success, AuthError on failure
 */
export async function getAuthenticatedUser(): Promise<
  UserAuthResult | AuthError
> {
  const session = await auth();

  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { error: "User not found", status: 404 };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

/**
 * Requires admin role for the current session
 * @returns UserAuthResult on success, AuthError on failure
 */
export async function requireAdmin(): Promise<UserAuthResult | AuthError> {
  const result = await getAuthenticatedUser();

  if (isErrorResult(result)) {
    return result;
  }

  if (result.user.role !== "ADMIN") {
    return { error: "Admin access required", status: 403 };
  }

  return result;
}
