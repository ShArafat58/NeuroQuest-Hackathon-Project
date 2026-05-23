import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");
const fromEmail = "NeuroQuest <onboarding@resend.dev>"; // Default sandbox sender

/**
 * Sends a registration verification email.
 */
export async function sendVerificationEmail(
  to: string,
  code: string,
  name: string,
  version: "bangla" | "english"
) {
  const isBangla = version === "bangla";
  const subject = isBangla
    ? "আপনার NeuroQuest একাউন্ট ভেরিফাই করুন"
    : "Verify your NeuroQuest account";

  const html = isBangla
    ? `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #534AB7; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">NeuroQuest</h1>
          <p style="color: #1D9E75; margin: 4px 0 0 0; font-weight: 700; font-size: 16px; letter-spacing: 2px;">স্মৃতিযোদ্ধা</p>
        </div>
        <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; text-align: center; border: 1px solid #f1f5f9;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">প্রিয় ${name},</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
            NeuroQuest-এ আপনাকে স্বাগতম! আপনার একাউন্ট অ্যাক্টিভ করার জন্য নিচে দেওয়া ৬-ডিজিটের ওটিপি (OTP) কোডটি ব্যবহার করুন।
          </p>
          <div style="background-color: #eef2ff; border: 2px dashed #534AB7; padding: 16px 24px; border-radius: 8px; font-size: 36px; font-weight: 800; color: #534AB7; letter-spacing: 8px; display: inline-block; margin: 15px 0; font-family: Courier, monospace;">
            ${code}
          </div>
          <p style="color: #ea580c; font-size: 14px; font-weight: 600; margin: 15px 0 0 0;">
            * কোডটির মেয়াদ মাত্র ১৫ মিনিট।
          </p>
        </div>
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
          <p style="margin: 0; font-weight: 600; color: #64748b;">NeuroQuest — স্মৃতিযোদ্ধা — Team Hackers</p>
          <p style="margin: 4px 0 0 0;">Infinity AI BuildFest 2026 — BRAC University</p>
        </div>
      </div>
    `
    : `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #534AB7; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">NeuroQuest</h1>
          <p style="color: #1D9E75; margin: 4px 0 0 0; font-weight: 700; font-size: 16px; letter-spacing: 2px;">SMRITIJODDHA</p>
        </div>
        <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; text-align: center; border: 1px solid #f1f5f9;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">Dear ${name},</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
            Welcome to NeuroQuest! Please use the following 6-digit verification code to complete your signup process.
          </p>
          <div style="background-color: #eef2ff; border: 2px dashed #534AB7; padding: 16px 24px; border-radius: 8px; font-size: 36px; font-weight: 800; color: #534AB7; letter-spacing: 8px; display: inline-block; margin: 15px 0; font-family: Courier, monospace;">
            ${code}
          </div>
          <p style="color: #ea580c; font-size: 14px; font-weight: 600; margin: 15px 0 0 0;">
            * This verification code will expire in 15 minutes.
          </p>
        </div>
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
          <p style="margin: 0; font-weight: 600; color: #64748b;">NeuroQuest — স্মৃতিযোদ্ধা — Team Hackers</p>
          <p style="margin: 4px 0 0 0;">Infinity AI BuildFest 2026 — BRAC University</p>
        </div>
      </div>
    `;

  // Standard backend log backup for robust offline local development testing
  console.log(`\n========================================`);
  console.log(`[EMAIL DISPATCH] Verification OTP to: ${to}`);
  console.log(`Code: ${code}`);
  console.log(`========================================\n`);

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_mock_key") {
    return { success: true, mocked: true };
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Resend API failed to dispatch email:", error);
    // Continue gracefully during debug scenarios
    return { success: false, error };
  }
}

/**
 * Sends a password-reset verification email.
 */
export async function sendResetEmail(
  to: string,
  code: string,
  name: string,
  version: "bangla" | "english"
) {
  const isBangla = version === "bangla";
  const subject = isBangla
    ? "আপনার NeuroQuest পাসওয়ার্ড রিসেট করুন"
    : "Reset your NeuroQuest password";

  const html = isBangla
    ? `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #534AB7; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">NeuroQuest</h1>
          <p style="color: #1D9E75; margin: 4px 0 0 0; font-weight: 700; font-size: 16px; letter-spacing: 2px;">স্মৃতিযোদ্ধা</p>
        </div>
        <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; text-align: center; border: 1px solid #f1f5f9;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">প্রিয় ${name},</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
            আপনার অ্যাকাউন্টের পাসওয়ার্ডটি পরিবর্তনের আবেদন করা হয়েছে। পাসওয়ার্ডটি পরিবর্তন করতে নিচে দেওয়া ৬-ডিজিটের কোডটি ব্যবহার করুন।
          </p>
          <div style="background-color: #eef2ff; border: 2px dashed #534AB7; padding: 16px 24px; border-radius: 8px; font-size: 36px; font-weight: 800; color: #534AB7; letter-spacing: 8px; display: inline-block; margin: 15px 0; font-family: Courier, monospace;">
            ${code}
          </div>
          <p style="color: #ea580c; font-size: 14px; font-weight: 600; margin: 15px 0 0 0;">
            * কোডটির মেয়াদ মাত্র ১৫ মিনিট। আপনি নিজে এই অনুরোধ না করে থাকলে অনুগ্রহ করে ইমেইলটি ইগনোর করুন।
          </p>
        </div>
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
          <p style="margin: 0; font-weight: 600; color: #64748b;">NeuroQuest — স্মৃতিযোদ্ধা — Team Hackers</p>
          <p style="margin: 4px 0 0 0;">Infinity AI BuildFest 2026 — BRAC University</p>
        </div>
      </div>
    `
    : `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #534AB7; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">NeuroQuest</h1>
          <p style="color: #1D9E75; margin: 4px 0 0 0; font-weight: 700; font-size: 16px; letter-spacing: 2px;">SMRITIJODDHA</p>
        </div>
        <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; text-align: center; border: 1px solid #f1f5f9;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">Dear ${name},</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password. Please use the following 6-digit verification code to update your password.
          </p>
          <div style="background-color: #eef2ff; border: 2px dashed #534AB7; padding: 16px 24px; border-radius: 8px; font-size: 36px; font-weight: 800; color: #534AB7; letter-spacing: 8px; display: inline-block; margin: 15px 0; font-family: Courier, monospace;">
            ${code}
          </div>
          <p style="color: #ea580c; font-size: 14px; font-weight: 600; margin: 15px 0 0 0;">
            * This password reset code will expire in 15 minutes. If you did not initiate this request, you can safely ignore this email.
          </p>
        </div>
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
          <p style="margin: 0; font-weight: 600; color: #64748b;">NeuroQuest — স্মৃতিযোদ্ধা — Team Hackers</p>
          <p style="margin: 4px 0 0 0;">Infinity AI BuildFest 2026 — BRAC University</p>
        </div>
      </div>
    `;

  console.log(`\n========================================`);
  console.log(`[EMAIL DISPATCH] Password Reset OTP to: ${to}`);
  console.log(`Code: ${code}`);
  console.log(`========================================\n`);

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_mock_key") {
    return { success: true, mocked: true };
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Resend API failed to dispatch email:", error);
    return { success: false, error };
  }
}
