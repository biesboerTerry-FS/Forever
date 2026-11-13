// Lightweight transactional email helper.
//
// Uses Resend's HTTP API when RESEND_API_KEY is configured. When it is not,
// the message is logged to the server console so local development and the
// password-reset flow still work without an external account.
const escapeHtml = (value) =>
	String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

export const sendEmail = async ({ to, subject, html, text }) => {
	if (!to) return false;

	if (!process.env.RESEND_API_KEY) {
		console.log(`[email:dev] To: ${to} | Subject: ${subject}`);
		if (text) console.log(`[email:dev] ${text}`);
		return false;
	}

	try {
		const response = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: process.env.EMAIL_FROM || "Forever <onboarding@resend.dev>",
				to: [to],
				subject,
				html,
				text,
			}),
		});

		if (!response.ok) {
			const body = await response.text();
			console.error("Email send failed:", response.status, body);
			return false;
		}
		return true;
	} catch (error) {
		console.error("Email send failed:", error.message);
		return false;
	}
};

export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
	const safeName = escapeHtml(name || "there");
	const token = (() => {
		try {
			return new URL(resetUrl).searchParams.get("token") || "";
		} catch {
			return "";
		}
	})();
	const mobileUrl = token ? `forever://reset-password?token=${encodeURIComponent(token)}` : "";
	const mobileLink = mobileUrl
		? `<p>On the Forever mobile app, open: <a href="${escapeHtml(mobileUrl)}">${escapeHtml(mobileUrl)}</a></p>`
		: "";
	const mobileText = mobileUrl ? ` On the mobile app, open: ${mobileUrl}` : "";
	return sendEmail({
		to,
		subject: "Reset your Forever password",
		text: `Hi ${name || "there"}, reset your Forever password with this link: ${resetUrl} (valid for 1 hour).${mobileText}`,
		html: `
			<div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #111827;">
				<h1 style="font-size: 24px;">Reset your password</h1>
				<p>Hi ${safeName},</p>
				<p>We received a request to reset your Forever password. This link is valid for one hour.</p>
				<p style="margin: 28px 0;">
					<a href="${escapeHtml(resetUrl)}" style="background:#111827;color:#ffffff;padding:12px 22px;text-decoration:none;border-radius:4px;">Reset password</a>
				</p>
				${mobileLink}
				<p>If you did not request this, you can safely ignore this email.</p>
				<p>— The Forever team</p>
			</div>
		`,
	});
};

export const sendOrderConfirmationEmail = async ({ to, order }) => {
	if (!to) return false;
	const items = Array.isArray(order.items) ? order.items : [];
	const rows = items
		.map(
			(item) =>
				`<tr><td style="padding:6px 0;">${escapeHtml(item.name)} × ${escapeHtml(
					item.quantity ?? 1
				)}</td><td style="padding:6px 0; text-align:right;">$${Number(
					item.price || 0
				).toFixed(2)}</td></tr>`
		)
		.join("");

	return sendEmail({
		to,
		subject: `Your Forever order #${String(order._id).slice(-8).toUpperCase()}`,
		text: `Thanks for your order. Total: $${Number(order.amount || 0).toFixed(2)}.`,
		html: `
			<div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #111827;">
				<h1 style="font-size: 24px;">Thank you for your order</h1>
				<p>Order #${escapeHtml(String(order._id).slice(-8).toUpperCase())}</p>
				<table style="width:100%; border-collapse:collapse; font-family: Arial, sans-serif; font-size:14px;">${rows}</table>
				<p style="margin-top:16px; font-weight:bold; text-align:right;">Total: $${Number(
					order.amount || 0
				).toFixed(2)}</p>
				<p>We'll email tracking details once your parcel leaves the studio.</p>
				<p>— The Forever team</p>
			</div>
		`,
	});
};
