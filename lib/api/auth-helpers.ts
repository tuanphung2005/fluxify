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
export async function getAuthenticatedVendor(): Promise<AuthResult | AuthError> {
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
                    description: "Auto-generated store for Admin"
                }
            });

            return {
                vendor: newVendor,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            };
        }
        return { error: "Vendor profile not found", status: 404 };
    }

    return {
        vendor: user.vendorProfile,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
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
    vendorId: string
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
    vendorId: string
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
