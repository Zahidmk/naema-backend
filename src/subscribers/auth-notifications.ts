import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import nodemailer from "nodemailer";

export default async function authNotificationHandler({
  event: { data },
  container,
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  const logger = container.resolve("logger");
  const authModule = container.resolve(Modules.AUTH);

  try {
    // For emailpass, data.entity_id is actually the email identifier!
    const email = data.entity_id;
    
    if (!email) {
      logger.error(`Could not find email for password reset`);
      return;
    }

    logger.info(`Sending password reset email to ${email}`);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "vashakir245@gmail.com",
        pass: "bxbi keec bkzm gthg",
      },
    });

    // We assume the frontend is running on the same domain
    const resetLink = `https://naemafoodstuff.com/en/reset-password?token=${data.token}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: `"Naema Store" <vashakir245@gmail.com>`,
      to: email,
      subject: `Reset Your Password - Naema Foodstuff`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;">
          <h2 style="color: #0b1a30; border-bottom: 2px solid #ccba78; padding-bottom: 8px;">Password Reset Request</h2>
          <p>We received a request to reset the password for your Naema Foodstuff account.</p>
          <p>Click the button below to set a new password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #0b1a30; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p style="margin-top: 40px; font-size: 12px; color: #666;">
            Button not working? Copy and paste this link into your browser:<br>
            <a href="${resetLink}">${resetLink}</a>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email successfully sent to ${email}`);

  } catch (error) {
    logger.error(`Failed to handle password reset for ${data.entity_id}:`, error as Error);
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset", 
};
