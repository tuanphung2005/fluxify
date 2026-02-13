import z from "zod";

export const MAX_QUANTITY_PER_ITEM = 999;

// Common field schemas
export const phoneSchema = z
    .string()
    .regex(/^0\d{9}$/, "Invalid Vietnamese phone number");

export const emailSchema = z.string().email("Invalid email address");

export const addressSchema = z.object({
    street: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State/District is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"),
});

// Order related schemas
export const orderItemSchema = z.object({
    productId: z.string(),
    quantity: z
        .number()
        .min(1)
        .max(MAX_QUANTITY_PER_ITEM, `Maximum ${MAX_QUANTITY_PER_ITEM} items per product`),
    price: z.number().min(0),
    selectedVariant: z.string().optional(),
});

export const orderSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    phoneNumber: phoneSchema,
    email: emailSchema,
    items: z.array(orderItemSchema).min(1, "At least one item is required"),
    address: addressSchema,
});

export type OrderInput = z.infer<typeof orderSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
