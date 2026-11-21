import mongoose from "mongoose";
import addressModel from "../models/addressModel.js";

const ADDRESS_FIELDS = [
	"label",
	"firstName",
	"lastName",
	"email",
	"phone",
	"line1",
	"line2",
	"city",
	"state",
	"zip",
	"country",
];

const present = (doc) => ({
	id: String(doc._id),
	...Object.fromEntries(ADDRESS_FIELDS.map((field) => [field, doc[field] || ""])),
	isDefault: Boolean(doc.isDefault),
});

const listFor = async (userId) => {
	const addresses = await addressModel
		.find({ userId })
		.sort({ isDefault: -1, createdAt: -1 });
	return addresses.map(present);
};

const cleanInput = (body) =>
	Object.fromEntries(
		ADDRESS_FIELDS.filter((field) => body[field] !== undefined)
			.map((field) => [
				field,
				typeof body[field] === "string" ? body[field].trim() : body[field],
			])
	);

const validId = (id) => mongoose.isValidObjectId(id);

// GET /api/address — all addresses owned by the signed-in shopper.
const getAddresses = async (request, response) => {
	try {
		return response.json({ success: true, addresses: await listFor(request.auth.userId) });
	} catch (error) {
		return response.status(500).json({ success: false, message: error.message });
	}
};

// POST /api/address — first address (or an explicit isDefault) becomes default.
const addAddress = async (request, response) => {
	try {
		const userId = request.auth.userId;
		const count = await addressModel.countDocuments({ userId });
		const wantsDefault = request.body.isDefault === true || count === 0;

		if (wantsDefault) await addressModel.updateMany({ userId }, { $set: { isDefault: false } });
		const address = await addressModel.create({
			...cleanInput(request.body),
			userId,
			isDefault: wantsDefault,
		});

		return response.json({
			success: true,
			address: present(address),
			addresses: await listFor(userId),
		});
	} catch (error) {
		return response.status(500).json({ success: false, message: error.message });
	}
};

// PATCH /api/address/:id — edit fields and/or default status.
const updateAddress = async (request, response) => {
	try {
		const { id } = request.params;
		if (!validId(id)) return response.status(400).json({ success: false, message: "Invalid address id" });

		const userId = request.auth.userId;
		const address = await addressModel.findOne({ _id: id, userId });
		if (!address) return response.status(404).json({ success: false, message: "Address not found" });

		Object.assign(address, cleanInput(request.body));

		if (request.body.isDefault === true) {
			await addressModel.updateMany({ userId, _id: { $ne: id } }, { $set: { isDefault: false } });
			address.isDefault = true;
		} else if (address.isDefault && request.body.isDefault === false) {
			address.isDefault = false;
			const replacement = await addressModel
				.findOne({ userId, _id: { $ne: id } })
				.sort({ createdAt: -1 });
			if (replacement) {
				replacement.isDefault = true;
				await replacement.save();
			}
		}

		await address.save();
		return response.json({
			success: true,
			address: present(address),
			addresses: await listFor(userId),
		});
	} catch (error) {
		return response.status(500).json({ success: false, message: error.message });
	}
};

// PATCH /api/address/:id/default — convenience route for "set as default".
const setDefaultAddress = async (request, response) => {
	try {
		const { id } = request.params;
		if (!validId(id)) return response.status(400).json({ success: false, message: "Invalid address id" });

		const userId = request.auth.userId;
		const address = await addressModel.findOne({ _id: id, userId });
		if (!address) return response.status(404).json({ success: false, message: "Address not found" });

		await addressModel.updateMany({ userId }, { $set: { isDefault: false } });
		address.isDefault = true;
		await address.save();

		return response.json({ success: true, addresses: await listFor(userId) });
	} catch (error) {
		return response.status(500).json({ success: false, message: error.message });
	}
};

// DELETE /api/address/:id — deleting the default promotes another address.
const deleteAddress = async (request, response) => {
	try {
		const { id } = request.params;
		if (!validId(id)) return response.status(400).json({ success: false, message: "Invalid address id" });

		const userId = request.auth.userId;
		const address = await addressModel.findOne({ _id: id, userId });
		if (!address) return response.status(404).json({ success: false, message: "Address not found" });

		const wasDefault = address.isDefault;
		await addressModel.deleteOne({ _id: id, userId });

		let addresses = await listFor(userId);
		if (wasDefault && addresses.length && !addresses.some((item) => item.isDefault)) {
			await addressModel.updateOne({ _id: addresses[0].id, userId }, { $set: { isDefault: true } });
			addresses = await listFor(userId);
		}

		return response.json({ success: true, addresses });
	} catch (error) {
		return response.status(500).json({ success: false, message: error.message });
	}
};

export { getAddresses, addAddress, updateAddress, setDefaultAddress, deleteAddress };
