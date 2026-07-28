"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOrderStatusEmail = sendOrderStatusEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
/**
 * Order Email Notification Service
 * Uses nodemailer SMTP — works with Gmail, Outlook, or any SMTP provider.
 * Configure via environment variables (see .env template).
 */
// ─── SMTP Transporter ────────────────────────────────────────────────────────
function createTransporter() {
    return nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER || "",
            pass: process.env.SMTP_PASS || "",
        },
    });
}
// ─── Brand Config ────────────────────────────────────────────────────────────
const BRAND = {
    name: "Naema",
    color: "#1D4ED8", // Blue
    accentColor: "#2563EB",
    logo: "https://website.naemafoodstuff.com/logo.png",
    storeUrl: process.env.STORE_URL || "https://website.naemafoodstuff.com",
    supportEmail: process.env.SUPPORT_EMAIL || "support@naemafoodstuff.com",
    fromEmail: process.env.SMTP_FROM || "noreply@naemafoodstuff.com",
    fromName: process.env.SMTP_FROM_NAME || "Naema",
};
// ─── Price Formatter ─────────────────────────────────────────────────────────
function formatPrice(amount, currencyCode = "kwd") {
    const decimals = currencyCode.toLowerCase() === "kwd" ? 3 : 2;
    const value = (amount / Math.pow(10, decimals)).toFixed(decimals);
    const symbol = currencyCode.toLowerCase() === "kwd" ? "KWD" : currencyCode.toUpperCase();
    return `${symbol} ${value}`;
}
// ─── Base Email Layout ────────────────────────────────────────────────────────
function baseLayout(content, previewText) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${BRAND.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f6fb; color: #1a1a2e; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
    .header { background: ${BRAND.color}; padding: 32px 40px; text-align: center; }
    .header img { height: 40px; }
    .header-title { color: #fff; font-size: 22px; font-weight: 700; margin-top: 16px; }
    .body { padding: 32px 40px; }
    .status-badge { display: inline-block; padding: 8px 20px; border-radius: 50px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
    .order-box { background: #f8faff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
    .order-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edf2f7; font-size: 14px; }
    .order-row:last-child { border-bottom: none; font-weight: 700; font-size: 15px; }
    .order-row span:first-child { color: #64748b; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
    .items-table th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: 600; color: #475569; border-radius: 4px; }
    .items-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
    .btn { display: block; width: fit-content; margin: 28px auto 0; background: ${BRAND.accentColor}; color: #fff !important; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; text-align: center; }
    .tracking-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 18px 20px; margin: 20px 0; text-align: center; }
    .tracking-box .label { font-size: 12px; color: #3b82f6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .tracking-box .tracking-number { font-size: 18px; font-weight: 700; color: ${BRAND.color}; letter-spacing: 2px; }
    .footer { background: #f8faff; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { font-size: 12px; color: #94a3b8; line-height: 1.7; }
    .footer a { color: ${BRAND.color}; text-decoration: none; }
    h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
    p { font-size: 14px; line-height: 1.7; color: #475569; }
  </style>
</head>
<body>
  <span style="display:none;max-height:0;overflow:hidden;">${previewText}</span>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div style="color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">${BRAND.name}</div>
        <div class="header-title">${previewText}</div>
      </div>
      ${content}
    </div>
    <div style="text-align:center;margin-top:20px;">
      <p style="font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.</p>
      <p style="font-size:12px;color:#94a3b8;margin-top:4px;">
        <a href="${BRAND.storeUrl}" style="color:${BRAND.color};text-decoration:none;">${BRAND.storeUrl}</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
// ── 1. Order Confirmed ────────────────────────────────────────────────────────
function orderConfirmedTemplate(data) {
    const itemsRows = data.items
        .map((item) => `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">${item.title}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;">${formatPrice(item.unit_price * item.quantity, data.currencyCode)}</td>
        </tr>`)
        .join("");
    const content = `
    <div class="body">
      <span class="status-badge" style="background:#dcfce7;color:#16a34a;">✅ Order Confirmed</span>
      <h2>Thank you, ${data.customerName}!</h2>
      <p style="margin-top:8px;">Your order <strong>#${data.displayId}</strong> has been confirmed and is being prepared.</p>

      <div class="order-box">
        <div class="order-row"><span>Order Number</span><span><strong>#${data.displayId}</strong></span></div>
        ${data.shippingAddress ? `<div class="order-row"><span>Delivery To</span><span>${data.shippingAddress}</span></div>` : ""}
        <div class="order-row"><span>Payment</span><span>Cash on Delivery</span></div>
      </div>

      <table class="items-table">
        <thead><tr><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th></tr></thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <div class="order-box">
        <div class="order-row"><span>Subtotal</span><span>${formatPrice(data.subtotal, data.currencyCode)}</span></div>
        <div class="order-row"><span>Shipping</span><span style="color:#16a34a;">Free</span></div>
        <div class="order-row"><span>Total</span><span>${formatPrice(data.total, data.currencyCode)}</span></div>
      </div>

      <a href="${BRAND.storeUrl}/en/orders" class="btn">View My Order</a>
    </div>
    <div class="footer">
      <p>Questions? Reply to this email or contact us at <a href="mailto:${BRAND.supportEmail}">${BRAND.supportEmail}</a></p>
    </div>`;
    return {
        subject: `✅ Order Confirmed — #${data.displayId} | ${BRAND.name}`,
        html: baseLayout(content, `Your order #${data.displayId} is confirmed!`),
    };
}
// ── 2. Order Shipped ──────────────────────────────────────────────────────────
function orderShippedTemplate(data) {
    const trackingSection = data.trackingNumber
        ? `<div class="tracking-box">
        <div class="label">📦 Tracking Number</div>
        <div class="tracking-number">${data.trackingNumber}</div>
        ${data.carrierName ? `<p style="margin-top:8px;color:#64748b;font-size:13px;">Carrier: <strong>${data.carrierName}</strong></p>` : ""}
        ${data.trackingUrl
            ? `<a href="${data.trackingUrl}" style="display:inline-block;margin-top:12px;background:${BRAND.color};color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Track My Package →</a>`
            : ""}
      </div>`
        : "";
    const content = `
    <div class="body">
      <span class="status-badge" style="background:#dbeafe;color:#1d4ed8;">🚚 Order Shipped</span>
      <h2>Your order is on its way!</h2>
      <p style="margin-top:8px;">Great news, <strong>${data.customerName}</strong>! Your order <strong>#${data.displayId}</strong> has been shipped and is heading to you.</p>

      ${trackingSection}

      <div class="order-box">
        <div class="order-row"><span>Order Number</span><span><strong>#${data.displayId}</strong></span></div>
        ${data.shippingAddress ? `<div class="order-row"><span>Delivering To</span><span>${data.shippingAddress}</span></div>` : ""}
        <div class="order-row"><span>Total</span><span>${formatPrice(data.total, data.currencyCode)}</span></div>
      </div>

      <a href="${BRAND.storeUrl}/en/orders" class="btn">Track My Order</a>
    </div>
    <div class="footer">
      <p>Expected delivery within 1–3 business days. Questions? <a href="mailto:${BRAND.supportEmail}">Contact Support</a></p>
    </div>`;
    return {
        subject: `🚚 Your Order #${data.displayId} Has Been Shipped! | ${BRAND.name}`,
        html: baseLayout(content, `Order #${data.displayId} is on its way!`),
    };
}
// ── 3. Order Delivered ────────────────────────────────────────────────────────
function orderDeliveredTemplate(data) {
    const content = `
    <div class="body">
      <span class="status-badge" style="background:#dcfce7;color:#16a34a;">🎉 Delivered!</span>
      <h2>Your order has arrived!</h2>
      <p style="margin-top:8px;">Hi <strong>${data.customerName}</strong>, your order <strong>#${data.displayId}</strong> has been delivered. We hope you love your purchase!</p>

      <div class="order-box">
        <div class="order-row"><span>Order Number</span><span><strong>#${data.displayId}</strong></span></div>
        ${data.shippingAddress ? `<div class="order-row"><span>Delivered To</span><span>${data.shippingAddress}</span></div>` : ""}
        <div class="order-row"><span>Total Paid</span><span>${formatPrice(data.total, data.currencyCode)}</span></div>
      </div>

      <p style="margin-top:16px;text-align:center;">Loved your experience? Leave a review and help others discover great products.</p>

      <a href="${BRAND.storeUrl}/en/orders" class="btn">Rate & Review Your Purchase</a>
    </div>
    <div class="footer">
      <p>Need to return something? You have 45 days. <a href="${BRAND.storeUrl}/en/buyer-protection">Learn more about our return policy</a></p>
      <p style="margin-top:6px;">Questions? <a href="mailto:${BRAND.supportEmail}">Contact Support</a></p>
    </div>`;
    return {
        subject: `🎉 Delivered! Order #${data.displayId} | ${BRAND.name}`,
        html: baseLayout(content, `Order #${data.displayId} has been delivered!`),
    };
}
// ── 4. Order Cancelled ────────────────────────────────────────────────────────
function orderCancelledTemplate(data) {
    const content = `
    <div class="body">
      <span class="status-badge" style="background:#fee2e2;color:#dc2626;">❌ Order Cancelled</span>
      <h2>Your order has been cancelled</h2>
      <p style="margin-top:8px;">Hi <strong>${data.customerName}</strong>, your order <strong>#${data.displayId}</strong> has been cancelled.</p>

      ${data.cancelledReason ? `<div class="order-box"><div class="order-row"><span>Reason</span><span>${data.cancelledReason}</span></div></div>` : ""}

      <div class="order-box">
        <div class="order-row"><span>Order Number</span><span><strong>#${data.displayId}</strong></span></div>
        <div class="order-row"><span>Amount</span><span>${formatPrice(data.total, data.currencyCode)}</span></div>
      </div>

      <p style="text-align:center;margin-top:16px;">If you have any questions or this was a mistake, please contact our support team.</p>

      <a href="${BRAND.storeUrl}/en" class="btn">Continue Shopping</a>
    </div>
    <div class="footer">
      <p>Questions about your cancellation? <a href="mailto:${BRAND.supportEmail}">Contact Support</a></p>
    </div>`;
    return {
        subject: `❌ Order #${data.displayId} Cancelled | ${BRAND.name}`,
        html: baseLayout(content, `Order #${data.displayId} has been cancelled`),
    };
}
// ── 5. Out for Delivery ────────────────────────────────────────────────────────
function orderOutForDeliveryTemplate(data) {
    const content = `
    <div class="body">
      <span class="status-badge" style="background:#fef9c3;color:#b45309;">📍 Out for Delivery</span>
      <h2>Your order is out for delivery!</h2>
      <p style="margin-top:8px;">Hi <strong>${data.customerName}</strong>, your order <strong>#${data.displayId}</strong> is with our delivery team and will arrive today!</p>

      <div class="order-box">
        <div class="order-row"><span>Order Number</span><span><strong>#${data.displayId}</strong></span></div>
        ${data.shippingAddress ? `<div class="order-row"><span>Delivering To</span><span>${data.shippingAddress}</span></div>` : ""}
        ${data.trackingNumber ? `<div class="order-row"><span>Tracking #</span><span>${data.trackingNumber}</span></div>` : ""}
        <div class="order-row"><span>Total</span><span>${formatPrice(data.total, data.currencyCode)}</span></div>
      </div>

      <p style="text-align:center;margin-top:12px;">Please make sure someone is available to receive the delivery.</p>

      <a href="${BRAND.storeUrl}/en/orders" class="btn">View Order Details</a>
    </div>
    <div class="footer">
      <p>Questions? <a href="mailto:${BRAND.supportEmail}">Contact Support</a></p>
    </div>`;
    return {
        subject: `📍 Out for Delivery — Order #${data.displayId} | ${BRAND.name}`,
        html: baseLayout(content, `Order #${data.displayId} is out for delivery today!`),
    };
}
async function sendOrderStatusEmail(type, toEmail, data) {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (!smtpUser || !smtpPass) {
        console.warn(`[Email] SMTP_USER or SMTP_PASS not set — skipping ${type} email for order #${data.displayId}`);
        return;
    }
    let template;
    switch (type) {
        case "order.confirmed":
            template = orderConfirmedTemplate(data);
            break;
        case "order.shipped":
            template = orderShippedTemplate(data);
            break;
        case "order.delivered":
            template = orderDeliveredTemplate(data);
            break;
        case "order.out_for_delivery":
            template = orderOutForDeliveryTemplate(data);
            break;
        case "order.cancelled":
            template = orderCancelledTemplate(data);
            break;
        default:
            console.warn(`[Email] Unknown email type: ${type}`);
            return;
    }
    const transporter = createTransporter();
    await transporter.sendMail({
        from: `"${BRAND.fromName}" <${BRAND.fromEmail}>`,
        to: toEmail,
        subject: template.subject,
        html: template.html,
    });
    console.log(`[Email] ✅ Sent ${type} email to ${toEmail} for order #${data.displayId}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1haWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL2VtYWlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBZ1RBLG9EQThDQztBQTlWRCw0REFBb0M7QUFFcEM7Ozs7R0FJRztBQUVILGdGQUFnRjtBQUVoRixTQUFTLGlCQUFpQjtJQUN4QixPQUFPLG9CQUFVLENBQUMsZUFBZSxDQUFDO1FBQ2hDLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxnQkFBZ0I7UUFDL0MsSUFBSSxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxLQUFLLENBQUM7UUFDOUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxLQUFLLE1BQU0sRUFBRSw4QkFBOEI7UUFDMUUsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLEVBQUU7WUFDakMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLEVBQUU7U0FDbEM7S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsZ0ZBQWdGO0FBRWhGLE1BQU0sS0FBSyxHQUFHO0lBQ1osSUFBSSxFQUFFLE9BQU87SUFDYixLQUFLLEVBQUUsU0FBUyxFQUFTLE9BQU87SUFDaEMsV0FBVyxFQUFFLFNBQVM7SUFDdEIsSUFBSSxFQUFFLDZDQUE2QztJQUNuRCxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksb0NBQW9DO0lBQ3ZFLFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSw0QkFBNEI7SUFDdkUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLDRCQUE0QjtJQUNoRSxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksT0FBTztDQUNoRCxDQUFDO0FBRUYsZ0ZBQWdGO0FBRWhGLFNBQVMsV0FBVyxDQUFDLE1BQWMsRUFBRSxZQUFZLEdBQUcsS0FBSztJQUN2RCxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsV0FBVyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5RCxNQUFNLEtBQUssR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsRSxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsV0FBVyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6RixPQUFPLEdBQUcsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO0FBQzlCLENBQUM7QUFFRCxpRkFBaUY7QUFFakYsU0FBUyxVQUFVLENBQUMsT0FBZSxFQUFFLFdBQW1CO0lBQ3RELE9BQU87Ozs7O1dBS0UsS0FBSyxDQUFDLElBQUk7Ozs7Ozs0QkFNTyxLQUFLLENBQUMsS0FBSzs7Ozs7Ozs7Ozs7O2tGQVkyQyxLQUFLLENBQUMsV0FBVzs7O2lGQUdsQixLQUFLLENBQUMsS0FBSzs7O3lCQUduRSxLQUFLLENBQUMsS0FBSzs7Ozs7OzZEQU15QixXQUFXOzs7O3dGQUlnQixLQUFLLENBQUMsSUFBSTtvQ0FDOUQsV0FBVzs7UUFFdkMsT0FBTzs7O21EQUdvQyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxJQUFJLEtBQUssQ0FBQyxJQUFJOzttQkFFdEUsS0FBSyxDQUFDLFFBQVEsa0JBQWtCLEtBQUssQ0FBQyxLQUFLLDJCQUEyQixLQUFLLENBQUMsUUFBUTs7Ozs7UUFLL0YsQ0FBQztBQUNULENBQUM7QUFtQkQsaUZBQWlGO0FBQ2pGLFNBQVMsc0JBQXNCLENBQUMsSUFBb0I7SUFDbEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUs7U0FDekIsR0FBRyxDQUNGLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FDUDsyRUFDbUUsSUFBSSxDQUFDLEtBQUs7NkZBQ1EsSUFBSSxDQUFDLFFBQVE7NEdBQ0UsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDO2NBQzdKLENBQ1Q7U0FDQSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFWixNQUFNLE9BQU8sR0FBRzs7O3VCQUdLLElBQUksQ0FBQyxZQUFZO3VEQUNlLElBQUksQ0FBQyxTQUFTOzs7eUVBR0ksSUFBSSxDQUFDLFNBQVM7VUFDN0UsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsd0RBQXdELElBQUksQ0FBQyxlQUFlLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRTs7Ozs7O2lCQU1oSCxTQUFTOzs7OzREQUlrQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDOzt5REFFaEQsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQzs7O2lCQUdsRixLQUFLLENBQUMsUUFBUTs7OzJFQUc0QyxLQUFLLENBQUMsWUFBWSxLQUFLLEtBQUssQ0FBQyxZQUFZO1dBQ3pHLENBQUM7SUFFVixPQUFPO1FBQ0wsT0FBTyxFQUFFLHdCQUF3QixJQUFJLENBQUMsU0FBUyxNQUFNLEtBQUssQ0FBQyxJQUFJLEVBQUU7UUFDakUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsZUFBZSxJQUFJLENBQUMsU0FBUyxnQkFBZ0IsQ0FBQztLQUN6RSxDQUFDO0FBQ0osQ0FBQztBQUVELGlGQUFpRjtBQUNqRixTQUFTLG9CQUFvQixDQUFDLElBQW9CO0lBQ2hELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxjQUFjO1FBQ3pDLENBQUMsQ0FBQzs7dUNBRWlDLElBQUksQ0FBQyxjQUFjO1VBQ2hELElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLDRFQUE0RSxJQUFJLENBQUMsV0FBVyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUU7VUFFbkksSUFBSSxDQUFDLFdBQVc7WUFDZCxDQUFDLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyw0REFBNEQsS0FBSyxDQUFDLEtBQUssOEhBQThIO1lBQ25PLENBQUMsQ0FBQyxFQUNOO2FBQ0s7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDO0lBRVAsTUFBTSxPQUFPLEdBQUc7Ozs7dURBSXFDLElBQUksQ0FBQyxZQUFZLGtDQUFrQyxJQUFJLENBQUMsU0FBUzs7UUFFaEgsZUFBZTs7O3lFQUdrRCxJQUFJLENBQUMsU0FBUztVQUM3RSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQywwREFBMEQsSUFBSSxDQUFDLGVBQWUsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFO3lEQUMxRSxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDOzs7aUJBR2xGLEtBQUssQ0FBQyxRQUFROzs7a0ZBR21ELEtBQUssQ0FBQyxZQUFZO1dBQ3pGLENBQUM7SUFFVixPQUFPO1FBQ0wsT0FBTyxFQUFFLGtCQUFrQixJQUFJLENBQUMsU0FBUyx3QkFBd0IsS0FBSyxDQUFDLElBQUksRUFBRTtRQUM3RSxJQUFJLEVBQUUsVUFBVSxDQUFDLE9BQU8sRUFBRSxVQUFVLElBQUksQ0FBQyxTQUFTLGlCQUFpQixDQUFDO0tBQ3JFLENBQUM7QUFDSixDQUFDO0FBRUQsaUZBQWlGO0FBQ2pGLFNBQVMsc0JBQXNCLENBQUMsSUFBb0I7SUFDbEQsTUFBTSxPQUFPLEdBQUc7Ozs7OENBSTRCLElBQUksQ0FBQyxZQUFZLGtDQUFrQyxJQUFJLENBQUMsU0FBUzs7O3lFQUd0QyxJQUFJLENBQUMsU0FBUztVQUM3RSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyx5REFBeUQsSUFBSSxDQUFDLGVBQWUsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFOzhEQUNwRSxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDOzs7OztpQkFLdkYsS0FBSyxDQUFDLFFBQVE7OztnRUFHaUMsS0FBSyxDQUFDLFFBQVE7OERBQ2hCLEtBQUssQ0FBQyxZQUFZO1dBQ3JFLENBQUM7SUFFVixPQUFPO1FBQ0wsT0FBTyxFQUFFLHdCQUF3QixJQUFJLENBQUMsU0FBUyxNQUFNLEtBQUssQ0FBQyxJQUFJLEVBQUU7UUFDakUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxJQUFJLENBQUMsU0FBUyxzQkFBc0IsQ0FBQztLQUMxRSxDQUFDO0FBQ0osQ0FBQztBQUVELGlGQUFpRjtBQUNqRixTQUFTLHNCQUFzQixDQUFDLElBQW9CO0lBQ2xELE1BQU0sT0FBTyxHQUFHOzs7OzhDQUk0QixJQUFJLENBQUMsWUFBWSxrQ0FBa0MsSUFBSSxDQUFDLFNBQVM7O1FBRXZHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLDBFQUEwRSxJQUFJLENBQUMsZUFBZSxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsRUFBRTs7O3lFQUc5RSxJQUFJLENBQUMsU0FBUzswREFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQzs7Ozs7aUJBS25GLEtBQUssQ0FBQyxRQUFROzs7OERBRytCLEtBQUssQ0FBQyxZQUFZO1dBQ3JFLENBQUM7SUFFVixPQUFPO1FBQ0wsT0FBTyxFQUFFLFlBQVksSUFBSSxDQUFDLFNBQVMsZ0JBQWdCLEtBQUssQ0FBQyxJQUFJLEVBQUU7UUFDL0QsSUFBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxJQUFJLENBQUMsU0FBUyxxQkFBcUIsQ0FBQztLQUN6RSxDQUFDO0FBQ0osQ0FBQztBQUVELGtGQUFrRjtBQUNsRixTQUFTLDJCQUEyQixDQUFDLElBQW9CO0lBQ3ZELE1BQU0sT0FBTyxHQUFHOzs7OzhDQUk0QixJQUFJLENBQUMsWUFBWSxrQ0FBa0MsSUFBSSxDQUFDLFNBQVM7Ozt5RUFHdEMsSUFBSSxDQUFDLFNBQVM7VUFDN0UsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsMERBQTBELElBQUksQ0FBQyxlQUFlLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRTtVQUN6SCxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyx1REFBdUQsSUFBSSxDQUFDLGNBQWMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFO3lEQUNyRSxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDOzs7OztpQkFLbEYsS0FBSyxDQUFDLFFBQVE7OztzQ0FHTyxLQUFLLENBQUMsWUFBWTtXQUM3QyxDQUFDO0lBRVYsT0FBTztRQUNMLE9BQU8sRUFBRSxnQ0FBZ0MsSUFBSSxDQUFDLFNBQVMsTUFBTSxLQUFLLENBQUMsSUFBSSxFQUFFO1FBQ3pFLElBQUksRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsSUFBSSxDQUFDLFNBQVMsNkJBQTZCLENBQUM7S0FDakYsQ0FBQztBQUNKLENBQUM7QUFXTSxLQUFLLFVBQVUsb0JBQW9CLENBQ3hDLElBQW9CLEVBQ3BCLE9BQWUsRUFDZixJQUFvQjtJQUVwQixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztJQUN2QyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztJQUV2QyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxxREFBcUQsSUFBSSxxQkFBcUIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDN0csT0FBTztJQUNULENBQUM7SUFFRCxJQUFJLFFBQTJDLENBQUM7SUFFaEQsUUFBUSxJQUFJLEVBQUUsQ0FBQztRQUNiLEtBQUssaUJBQWlCO1lBQ3BCLFFBQVEsR0FBRyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QyxNQUFNO1FBQ1IsS0FBSyxlQUFlO1lBQ2xCLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QyxNQUFNO1FBQ1IsS0FBSyxpQkFBaUI7WUFDcEIsUUFBUSxHQUFHLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hDLE1BQU07UUFDUixLQUFLLHdCQUF3QjtZQUMzQixRQUFRLEdBQUcsMkJBQTJCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsTUFBTTtRQUNSLEtBQUssaUJBQWlCO1lBQ3BCLFFBQVEsR0FBRyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QyxNQUFNO1FBQ1I7WUFDRSxPQUFPLENBQUMsSUFBSSxDQUFDLCtCQUErQixJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELE9BQU87SUFDWCxDQUFDO0lBRUQsTUFBTSxXQUFXLEdBQUcsaUJBQWlCLEVBQUUsQ0FBQztJQUV4QyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUM7UUFDekIsSUFBSSxFQUFFLElBQUksS0FBSyxDQUFDLFFBQVEsTUFBTSxLQUFLLENBQUMsU0FBUyxHQUFHO1FBQ2hELEVBQUUsRUFBRSxPQUFPO1FBQ1gsT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPO1FBQ3pCLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTtLQUNwQixDQUFDLENBQUM7SUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixJQUFJLGFBQWEsT0FBTyxlQUFlLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0FBQ3pGLENBQUMifQ==