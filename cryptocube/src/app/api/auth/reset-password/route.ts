import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => null);

		if (!body || typeof body !== "object") {
			return NextResponse.json(
				{ error: "Invalid request body." },
				{ status: 400 }
			);
		}

		const { token, password, confirmPassword } = body as {
			token?: string;
			password?: string;
			confirmPassword?: string;
		};

		if (!token || !password || !confirmPassword) {
			return NextResponse.json(
				{ error: "Token, password, and password Confirmation are required." },
				{ status: 400 }
			);
		}

		if (password !== confirmPassword) {
			return NextResponse.json(
				{ error: "Passwords do not match." },
				{ status: 400 }
			);
		}

		// Password strength check (same as frontend)
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		if (!passwordRegex.test(password)) {
			return NextResponse.json(
				{ error: "Password does not meet requirements." },
				{ status: 400 }
			);
		}

		// Find the reset token
		const resetToken = await prisma.passwordResetToken.findFirst({
			where: { resetToken: token },
			include: { user: true },
		});

		if (!resetToken || !resetToken.user) {
			return NextResponse.json(
				{ error: "Invalid or expired token." },
				{ status: 400 }
			);
		}

		// Check if token is expired
		if (resetToken.tokenValidUntil < new Date()) {
			return NextResponse.json(
				{ error: "Token has expired." },
				{ status: 400 }
			);
		}

		// Hash the new password
		const passwordHash = await hash(password, 10);

		// Update the user's password
		await prisma.user.update({
			where: { id: resetToken.userId },
			data: { passwordHash },
		});

		// Delete the used token
		await prisma.passwordResetToken.delete({
			where: { userId: resetToken.userId },
		});

		return NextResponse.json({ ok: true, message: "Password has been reset." });
	} catch (err) {
		console.error("RESET PASSWORD ROUTE ERROR", err);
		return NextResponse.json(
			{ error: "Internal server error." },
			{ status: 500 }
		);
	}
}
