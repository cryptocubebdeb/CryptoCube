import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import crypto from "crypto";
import * as nodemailer from "nodemailer";

export async function POST(req: Request) {
  const body = await req.json();
  console.log('Received body:', body);
  const email = body.email;
  console.log('Parsed email:', email);

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenValidFrom = new Date();
  const tokenValidUntil = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.upsert({
    where: { userId: user.id },
    update: {
      resetToken,
      tokenValidFrom,
      tokenValidUntil,
    },
    create: {
      userId: user.id,
      resetToken,
      tokenValidFrom,
      tokenValidUntil,
    },
  });

  // Build password reset URL with the token as a query
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}`;

  // Create Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Send the password reset email to the user
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Reset your password",
    html: `
      <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
      <p><a href="${resetUrl}" target="_blank" style="color: #1a73e8; text-decoration: underline;">Reset Password</a></p>
    `,
  });

  return NextResponse.json({ success: true, message: "Password reset email has been sent." });
}