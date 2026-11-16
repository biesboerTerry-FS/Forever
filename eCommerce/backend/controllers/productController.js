import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

//& function to add product {POST}
const addProduct = async (request, response) => {
	// middleware using multer
	try {
		// get product info from request borderStyle
		const {
			name,
			description,
			price,
			category,
			subCategory,
			sizes,
			bestseller,
		} = request.body;

		const image1 = request.files.image1 && request.files.image1[0];
		const image2 = request.files.image2 && request.files.image2[0];
		const image3 = request.files.image3 && request.files.image3[0];
		const image4 = request.files.image4 && request.files.image4[0];
		const image5 = request.files.image5 && request.files.image5[0];

		const images = [image1, image2, image3, image4, image5].filter(
			(item) => item !== undefined
		);

		let imagesUrl = await Promise.all(
			images.map(async (item) => {
				let result = await cloudinary.uploader.upload(item.path, {
					resource_type: "image",
				});
				return result.secure_url;
			})
		);

		// save to mongodb
		const productData = {
			name,
			description,
			category,
			price: Number(price),
			subCategory,
			bestseller: bestseller === "true" ? true : false,
			sizes: JSON.parse(sizes),
			image: imagesUrl,
			date: Date.now(),
		};

		console.log(productData);

		const product = new productModel(productData);
		await product.save();

		response.json({
			success: true,
			message: "Product added successfully.",
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

//& function to list products {GET}
const listProduct = async (request, response) => {
	try {
		const products = await productModel.find({});
		response.json({
			success: true,
			products,
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

//& function to remove product {DELETE}
const removeProduct = async (request, response) => {
	try {
		await productModel.findByIdAndDelete(request.body.id);
		response.json({
			success: true,
			message: "Product removed.",
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

//& function for single product info {GET BY ID}
const singleProduct = async (request, response) => {
	try {
		const { productId } = request.body;
		const product = await productModel.findById(productId);
		response.json({
			success: true,
			product,
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

//& function to update product {POST}
const updateProduct = async (request, response) => {
	try {
		const {
			id,
			name,
			description,
			price,
			category,
			subCategory,
			sizes,
			bestseller,
		} = request.body;

		if (!id) {
			return response.json({ success: false, message: "Product id is required." });
		}

		const update = {};
		if (name !== undefined) update.name = String(name).trim();
		if (description !== undefined) update.description = String(description).trim();
		if (price !== undefined) update.price = Number(price);
		if (category !== undefined) update.category = String(category).trim();
		if (subCategory !== undefined) update.subCategory = String(subCategory).trim();
		if (sizes !== undefined) {
			update.sizes = Array.isArray(sizes)
				? sizes
				: typeof sizes === "string"
					? JSON.parse(sizes)
					: sizes;
		}
		if (bestseller !== undefined) {
			update.bestseller =
				bestseller === true || bestseller === "true" ? true : false;
		}

		const product = await productModel.findByIdAndUpdate(id, update, {
			new: true,
		});
		if (!product) {
			return response.json({ success: false, message: "Product not found." });
		}

		response.json({
			success: true,
			message: "Product updated successfully.",
			product,
		});
	} catch (error) {
		console.log(error);
		response.json({ success: false, message: error.message });
	}
};

export { addProduct, listProduct, removeProduct, singleProduct, updateProduct };
