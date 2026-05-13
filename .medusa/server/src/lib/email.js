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
    name: "MarkaSouq",
    color: "#1D4ED8", // Blue
    accentColor: "#2563EB",
    logo: "https://website.markasouqs.com/logo.png",
    storeUrl: process.env.STORE_URL || "https://website.markasouqs.com",
    supportEmail: process.env.SUPPORT_EMAIL || "support@markasouqs.com",
    fromEmail: process.env.SMTP_FROM || "noreply@markasouqs.com",
    fromName: process.env.SMTP_FROM_NAME || "MarkaSouq",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1haWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL2VtYWlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBZ1RBLG9EQThDQztBQTlWRCw0REFBb0M7QUFFcEM7Ozs7R0FJRztBQUVILGdGQUFnRjtBQUVoRixTQUFTLGlCQUFpQjtJQUN4QixPQUFPLG9CQUFVLENBQUMsZUFBZSxDQUFDO1FBQ2hDLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxnQkFBZ0I7UUFDL0MsSUFBSSxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxLQUFLLENBQUM7UUFDOUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxLQUFLLE1BQU0sRUFBRSw4QkFBOEI7UUFDMUUsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLEVBQUU7WUFDakMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLEVBQUU7U0FDbEM7S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsZ0ZBQWdGO0FBRWhGLE1BQU0sS0FBSyxHQUFHO0lBQ1osSUFBSSxFQUFFLFdBQVc7SUFDakIsS0FBSyxFQUFFLFNBQVMsRUFBUyxPQUFPO0lBQ2hDLFdBQVcsRUFBRSxTQUFTO0lBQ3RCLElBQUksRUFBRSx5Q0FBeUM7SUFDL0MsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLGdDQUFnQztJQUNuRSxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksd0JBQXdCO0lBQ25FLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSx3QkFBd0I7SUFDNUQsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLFdBQVc7Q0FDcEQsQ0FBQztB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