import mongoose from "mongoose";
import paymentMethodModel from "../models/paymentMethodModel.js";

// Extra safety: only these keys are ever copied into the model. A request that
// tries to send a full card number/CVC is rejected outright.
const FORBIDDEN_KEYS = ["cardNumber", "number", "cvc", "cvv", "card", "pan"];
const BRANDS = ["Visa", "Mastercard", "Amex", "Discover"];

const present = (doc) => ({
	id: String(doc._id),
	label: doc.label || "Demo card",
	brand: doc.brand,
	last4: doc.last4,
	exp: doc.exp || "",
	isDefault: Boolean(doc.isDefault),
});

const listFor = async (userId) => {
	const cards = await paymentMethodModel
		.find({ userId })
		.sort({ isDefault: -1, createdAt: -1 });
	return cards.map(present);
};

const rejectFullCardData = (request, response) => {
	const forbidden = FORBIDDEN_KEYS.find((key) => key in request.body);
	if (forbidden) {
		response.status(400).json({
			success: false,
			message: "Demo cards store only the last 4 digits. Real card data is not accepted.",
		});
		return true;
	}
	return false;
};

const validMask = (last4) => /^\d{4}$/.test(String(last4 || ""));

// GET /api/payment-methods
const getPaymentMethods = async (request, response) => {
	try {
		return response.json({ success: true, paymentMethods: await listFor(request.auth.userId) });
	} catch (error) {
		return response.status(500).json({ success: false, message: error.message });
	}
};

// POST /api/payment-methods — masked metadata only, no Stripe calls.
const addPaymentMethod = async (request, response) => {
	try {
		if (rejectFullCardData(request, response)) return;
		const { brand, last4, exp, label } = request.body;
		if (!BRANDS.includes(brand) || !validMask(last4)) {
			return response.status(400).json({
				success: false,
				message: "Choose a card type and enter exactly the last 4 digits.",
			});
		}

		const userId = request.auth.userId;
		const count = await paymentMethodModel.countDocuments({ userId });
		const wantsDefault = request.body.isDefault === true || count === 0;
		if (wantsDefault) await paymentMethodModel.updateMany({ userId }, { $set: { isDefault: false } });

		const card = await paymentMethodModel.create({
			userId,
			brand,
			last4: String(last4),
			exp: String(exp || "").trim().slice(0, 8),
			label: String(label || "").trim().slice(0, 60) || "Demo card",
			isDefault: wantsDefault,
		});

		return response.json({
			success: true,
			paymentMethod: present(card),
			paymentMethods: await listFor(userId),
		});
	} catch (error) {
		return response.status(500).json({ success: false, message: error.message });
	}
};

// PATCH /api/payment-methods/:id
const updatePaymentMethod = async (request, response) => {
	try {
		if (rejectFullCardData(request, response)) return;
		const { id } = request.params;
		if (!mongoose.isValidObjectId(id)) {
			return response.status(400).json({ success: false, message: "Invalid card id" });
		}

		const userId = request.auth.userId;
		const card = await paymentMethodModel.findOne({ _id: id, userId });
		if (!card) return response.status(404).json({ success: false, message: "Demo card not found" });

		if (request.body.brand !== undefined && BRANDS.includes(request.body.brand)) {
			card.brand = request.body.brand;
		}
		if (request.body.last4 !== undefined && validMask(request.body.last4)) {
			card.last4 = String(request.body.last4);
		}
		if (request.body.exp !== undefined) card.exp = String(request.body.exp).trim().slice(0, 8);
		if (request.body.label !== undefined) card.label = String(request.body.label).trim().slice(0, 60);

		if (request.body.isDefault === true) {
			await paymentMethodModel.updateMany({ userId, _id: { $ne: id } }, { $set: { isDefault: false } });
			card.isDefault = true;
		} else if (card.isDefault && request.body.isDefault === false) {
			card.isDefault = false;
			const replacement = await paymentMethodModel
				.findOne({ userId, _id: { $ne: id } })
				.sort({ createdAt: -1 });
			if (replacement) {
				replacement.isDefault = true;
				await replacement.save();
			}
		}

		await card.save();
		return response.json({
			success: true,
			paymentMethod: present(card),
			paymentMethods: await listFor(userId),
		});
	} catch (error) {
		return response.status(500).json({ success: false, message: error.message });
	}
};

// DELETE /api/payment-methods/:id
const deletePaymentMethod = async (request, response) => {
	try {
		const { id } = request.params;
		if (!mongoose.isValidObjectId(id)) {
			return response.status(400).json({ success: false, message: "Invalid card id" });
		}

		const userId = request.auth.userId;
		const card = await paymentMethodModel.findOne({ _id: id, userId });
		if (!card) return response.status(404).json({ success: false, message: "Demo card not found" });

		const wasDefault = card.isDefault;
		await paymentMethodModel.deleteOne({ _id: id, userId });

		let paymentMethods = await listFor(userId);
		if (wasDefault && paymentMethods.length && !paymentMethods.some((item) => item.isDefault)) {
			await paymentMethodModel.updateOne(
				{ _id: paymentMethods[0].id, userId },
				{ $set: { isDefault: true } }
			);
			paymentMethods = await listFor(userId);
		}

		return response.json({ success: true, paymentMethods });
	} catch (error) {
		return response.status(500).json({ success: false, message: error.message });
	}
};

export {
	getPaymentMethods,
	addPaymentMethod,
	updatePaymentMethod,
	deletePaymentMethod,
};
