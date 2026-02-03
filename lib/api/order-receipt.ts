import { Resend } from "resend";

// Lazy-initialize Resend to avoid build-time errors
let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
  image?: string;
}

interface OrderReceiptData {
  orderId: string;
  email: string;
  fullName: string;
  items: OrderItem[];
  total: number;
  address?: {
    street: string;
    city: string;
    state: string;
  };
}

/**
 * Format currency in VND
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate HTML for order items
 */
function generateItemsHtml(items: OrderItem[]): string {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #e4e4e7;">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${item.image
          ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />`
          : ""
        }
            <div>
              <p style="margin: 0; font-weight: 600; color: #18181b;">${item.name}</p>
              ${item.variant ? `<p style="margin: 4px 0 0; font-size: 14px; color: #71717a;">${item.variant}</p>` : ""}
            </div>
          </div>
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e4e4e7; text-align: center; color: #52525b;">
          x${item.quantity}
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e4e4e7; text-align: right; font-weight: 600; color: #18181b;">
          ${formatCurrency(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join("");
}

/**
 * Send order receipt email
 */
export async function sendOrderReceiptEmail(data: OrderReceiptData): Promise<void> {
  const { orderId, email, fullName, items, total, address } = data;

  // In development without API key, just log
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_test") {
    console.log("[DEV] Would send receipt email to:", email, "Order:", orderId);
    return;
  }

  const itemsHtml = generateItemsHtml(items);

  try {
    await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Fluxify <onboarding@phungtuan.io.vn>",
      to: email,
      subject: `Hóa đơn đơn hàng #${orderId.slice(-8).toUpperCase()} - Fluxify`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="padding: 24px 32px; border-bottom: 1px solid #e4e4e7;">
              <h1 style="color: #18181b; font-size: 20px; margin: 0;">Hóa đơn đơn hàng</h1>
              <p style="color: #71717a; margin: 4px 0 0; font-size: 14px;">
                Mã đơn: #${orderId.slice(-8).toUpperCase()}
              </p>
            </div>

            <!-- Customer -->
            <div style="padding: 16px 32px; background: #fafafa;">
              <p style="margin: 0; font-size: 14px; color: #52525b;">
                <strong>Khách hàng:</strong> ${fullName}
              </p>
            </div>

            <!-- Items -->
            <div style="padding: 0 32px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Total -->
            <div style="padding: 20px 32px; border-top: 2px solid #18181b; margin-top: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 16px; font-weight: 600; color: #18181b;">Tổng cộng</span>
                <span style="font-size: 18px; font-weight: 700; color: #18181b;">${formatCurrency(total)}</span>
              </div>
            </div>

            ${address
          ? `
            <!-- Shipping Address -->
            <div style="padding: 16px 32px; background: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">Địa chỉ giao hàng</p>
              <p style="margin: 0; color: #18181b; font-size: 14px;">
                ${address.street}, ${address.state ? `${address.state}, ` : ""}${address.city}
              </p>
            </div>
            `
          : ""
        }

            <!-- Footer -->
            <div style="padding: 16px 32px; border-top: 1px solid #e4e4e7; text-align: center;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                Cảm ơn bạn đã mua sắm tại Fluxify!
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send order receipt email:", error);
    throw error;
  }
}
