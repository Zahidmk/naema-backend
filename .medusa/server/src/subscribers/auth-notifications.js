"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = authNotificationHandler;
const utils_1 = require("@medusajs/framework/utils");
const nodemailer_1 = __importDefault(require("nodemailer"));
async function authNotificationHandler({ event: { data }, container, }) {
    const logger = container.resolve("logger");
    const authModule = container.resolve(utils_1.Modules.AUTH);
    try {
        // For emailpass, data.entity_id is actually the email identifier!
        const email = data.entity_id;
        if (!email) {
            logger.error(`Could not find email for password reset`);
            return;
        }
        logger.info(`Sending password reset email to ${email}`);
        const transporter = nodemailer_1.default.createTransport({
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
    }
    catch (error) {
        logger.error(`Failed to handle password reset for ${data.entity_id}:`, error);
    }
}
exports.config = {
    event: "auth.password_reset",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC1ub3RpZmljYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N1YnNjcmliZXJzL2F1dGgtbm90aWZpY2F0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFPQSwwQ0EwREM7QUE3REQscURBQW9EO0FBQ3BELDREQUFvQztBQUVyQixLQUFLLFVBQVUsdUJBQXVCLENBQUMsRUFDcEQsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQ2YsU0FBUyxHQUNnRTtJQUN6RSxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRW5ELElBQUksQ0FBQztRQUNILGtFQUFrRTtRQUNsRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRTdCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNYLE1BQU0sQ0FBQyxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztZQUN4RCxPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsbUNBQW1DLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFeEQsTUFBTSxXQUFXLEdBQUcsb0JBQVUsQ0FBQyxlQUFlLENBQUM7WUFDN0MsSUFBSSxFQUFFLGdCQUFnQjtZQUN0QixJQUFJLEVBQUUsR0FBRztZQUNULE1BQU0sRUFBRSxLQUFLO1lBQ2IsSUFBSSxFQUFFO2dCQUNKLElBQUksRUFBRSx1QkFBdUI7Z0JBQzdCLElBQUksRUFBRSxxQkFBcUI7YUFDNUI7U0FDRixDQUFDLENBQUM7UUFFSCx1REFBdUQ7UUFDdkQsTUFBTSxTQUFTLEdBQUcsc0RBQXNELElBQUksQ0FBQyxLQUFLLFVBQVUsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUV4SCxNQUFNLFdBQVcsR0FBRztZQUNsQixJQUFJLEVBQUUsdUNBQXVDO1lBQzdDLEVBQUUsRUFBRSxLQUFLO1lBQ1QsT0FBTyxFQUFFLHVDQUF1QztZQUNoRCxJQUFJLEVBQUU7Ozs7Ozt1QkFNVyxTQUFTOzs7Ozt1QkFLVCxTQUFTLEtBQUssU0FBUzs7O09BR3ZDO1NBQ0YsQ0FBQztRQUVGLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBRXBFLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsTUFBTSxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLEtBQWMsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7QUFDSCxDQUFDO0FBRVksUUFBQSxNQUFNLEdBQXFCO0lBQ3RDLEtBQUssRUFBRSxxQkFBcUI7Q0FDN0IsQ0FBQyJ9