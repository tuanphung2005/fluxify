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
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; font-size: 24px; margin: 0;">Cảm ơn bạn đã mua hàng!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">
                Đây là hóa đơn cho đơn hàng của bạn
              </p>
            </div>

            <!-- Order Info -->
            <div style="padding: 24px 32px; border-bottom: 1px solid #e4e4e7;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <p style="margin: 0; font-size: 14px; color: #71717a;">Mã đơn hàng</p>
                  <p style="margin: 4px 0 0; font-size: 18px; font-weight: 700; color: #18181b;">#${orderId.slice(-8).toUpperCase()}</p>
                </div>
                <div style="text-align: right;">
                  <p style="margin: 0; font-size: 14px; color: #71717a;">Khách hàng</p>
                  <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #18181b;">${fullName}</p>
                </div>
              </div>
            </div>

            <!-- Items -->
            <div style="padding: 0 32px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="padding: 16px 16px 16px 0; text-align: left; font-size: 12px; text-transform: uppercase; color: #71717a; letter-spacing: 0.05em;">Sản phẩm</th>
                    <th style="padding: 16px; text-align: center; font-size: 12px; text-transform: uppercase; color: #71717a; letter-spacing: 0.05em;">SL</th>
                    <th style="padding: 16px 0 16px 16px; text-align: right; font-size: 12px; text-transform: uppercase; color: #71717a; letter-spacing: 0.05em;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Total -->
            <div style="padding: 24px 32px; background: #fafafa;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 18px; font-weight: 600; color: #18181b;">Tổng cộng</span>
                <span style="font-size: 24px; font-weight: 700; color: #2563eb;">${formatCurrency(total)}</span>
              </div>
            </div>

            ${address
                    ? `
            <!-- Shipping Address -->
            <div style="padding: 24px 32px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">Địa chỉ giao hàng</p>
              <p style="margin: 0; color: #18181b; line-height: 1.5;">
                ${address.street}<br>
                ${address.state ? `${address.state}, ` : ""}${address.city}
              </p>
            </div>
            `
                    : ""
                }

            <!-- Footer -->
            <div style="padding: 24px 32px; background: #18181b; text-align: center;">
              <p style="margin: 0; color: #a1a1aa; font-size: 14px;">
                Cảm ơn bạn đã tin tưởng và mua sắm tại Fluxify!
              </p>
              <p style="margin: 8px 0 0; color: #71717a; font-size: 12px;">
                Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với cửa hàng.
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
