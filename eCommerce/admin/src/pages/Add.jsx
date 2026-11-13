import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

// Keep uploads well under the API's per-file limit and Vercel's request body
// cap. Photos are resized in the browser so slow connections finish quickly
// and product pages load less image data.
const MAX_UPLOAD_BYTES = 800 * 1024;
const MAX_DIMENSION = 1200;

const compressImage = (file) =>
	new Promise((resolve) => {
		if (!file || !file.type.startsWith("image/")) return resolve(file);

		// Small files are already fine; skip the canvas round-trip.
		if (file.size <= 400 * 1024) return resolve(file);

		const image = new Image();
		const objectUrl = URL.createObjectURL(file);

		const cleanup = () => URL.revokeObjectURL(objectUrl);

		image.onload = () => {
			cleanup();
			const scale = Math.min(
				1,
				MAX_DIMENSION / Math.max(image.width, image.height)
			);
			const canvas = document.createElement("canvas");
			canvas.width = Math.round(image.width * scale);
			canvas.height = Math.round(image.height * scale);
			const context = canvas.getContext("2d");
			if (!context) return resolve(file);
			context.drawImage(image, 0, 0, canvas.width, canvas.height);

			canvas.toBlob(
				(blob) => {
					// If compression didn't help (or the browser lacks WebP),
					// keep the original rather than making things worse.
					if (!blob || blob.type !== "image/webp") return resolve(file);
					if (blob.size >= file.size) return resolve(file);
					const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
					resolve(new File([blob], name, { type: "image/webp" }));
				},
				"image/webp",
				0.8
			);
		};
		image.onerror = () => {
			cleanup();
			resolve(file);
		};
		image.src = objectUrl;
	});

const Add = ({ token }) => {
	// State variables to store images
	const [image1, setImage1] = useState(false);
	const [image2, setImage2] = useState(false);
	const [image3, setImage3] = useState(false);
	const [image4, setImage4] = useState(false);
	const [image5, setImage5] = useState(false);

	// State variables for product info
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const [category, setCategory] = useState("");
	const [subCategory, setSubcategory] = useState("");
	const [bestseller, setBestseller] = useState(false);
	const [sizes, setSizes] = useState([]);

	const handleImageChange = async (event, setter) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Please choose an image file.");
			event.target.value = "";
			return;
		}

		const prepared = await compressImage(file);
		if (prepared.size > MAX_UPLOAD_BYTES) {
			toast.error("That image is still too large after compression. Try a smaller one.");
			event.target.value = "";
			return;
		}
		setter(prepared);
	};

	// Prevents reload when form is submitted
	const onSubmitHandler = async (e) => {
		e.preventDefault();

		try {
			const formData = new FormData();

			formData.append("name", name);
			formData.append("description", description);
			formData.append("price", price);
			formData.append("category", category);
			formData.append("subCategory", subCategory);
			formData.append("bestseller", bestseller);
			formData.append("sizes", JSON.stringify(sizes));

			image1 && formData.append("image1", image1);
			image2 && formData.append("image2", image2);
			image3 && formData.append("image3", image3);
			image4 && formData.append("image4", image4);
			image5 && formData.append("image5", image5);

			// send formdata to api
			const response = await axios.post(
				backendUrl + "/api/product/add",
				formData,
				{ headers: { token } }
			);

			if (response.data.success) {
				toast.success(response.data.message);
				setName("");
				setDescription("");
				setImage1(false);
				setImage2(false);
				setImage3(false);
				setImage4(false);
				setImage5(false);
				setPrice("");
				setSizes([]);
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		}
	};

	return (
		<form
			onSubmit={onSubmitHandler}
			className="flex flex-col items-start w-full max-w-2xl gap-4 p-6 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800"
		>
			<div>
				<p className="mb-2">Upload image(s)</p>
				<div className="flex gap-2">
					{/* Product images */}
					<label htmlFor="image1">
						<img
							className="object-cover w-20 rounded-lg"
							src={
								!image1
									? assets.upload_area
									: URL.createObjectURL(image1)
							}
							alt={image1 ? "Selected product image 1" : "Upload product image 1"}
						/>
						<input
							onChange={(e) => handleImageChange(e, setImage1)}
							type="file"
							id="image1"
							accept="image/*"
							hidden
						/>
					</label>
					<label htmlFor="image2">
						<img
							className="object-cover w-20 rounded-lg"
							src={
								!image2
									? assets.upload_area
									: URL.createObjectURL(image2)
							}
							alt={image2 ? "Selected product image 2" : "Upload product image 2"}
						/>
						<input
							onChange={(e) => handleImageChange(e, setImage2)}
							type="file"
							id="image2"
							accept="image/*"
							hidden
						/>
					</label>
					<label htmlFor="image3">
						<img
							className="object-cover w-20 rounded-lg"
							src={
								!image3
									? assets.upload_area
									: URL.createObjectURL(image3)
							}
							alt={image3 ? "Selected product image 3" : "Upload product image 3"}
						/>
						<input
							onChange={(e) => handleImageChange(e, setImage3)}
							type="file"
							id="image3"
							accept="image/*"
							hidden
						/>
					</label>
					<label htmlFor="image4">
						<img
							className="object-cover w-20 rounded-lg"
							src={
								!image4
									? assets.upload_area
									: URL.createObjectURL(image4)
							}
							alt={image4 ? "Selected product image 4" : "Upload product image 4"}
						/>
						<input
							onChange={(e) => handleImageChange(e, setImage4)}
							type="file"
							id="image4"
							accept="image/*"
							hidden
						/>
					</label>
					<label htmlFor="image5">
						<img
							className="object-cover w-20 rounded-lg"
							src={
								!image5
									? assets.upload_area
									: URL.createObjectURL(image5)
							}
							alt={image5 ? "Selected product image 5" : "Upload product image 5"}
						/>
						<input
							onChange={(e) => handleImageChange(e, setImage5)}
							type="file"
							id="image5"
							accept="image/*"
							hidden
						/>
					</label>
				</div>
			</div>

			{/* Product information */}
			<div className="w-full">
				<p className="mb-2">Product name</p>
				<input
					onChange={(e) => setName(e.target.value)}
					value={name}
					className="w-full max-w-[500px] px-3 py-2"
					type="text"
					placeholder="Type here"
					required
				/>
			</div>
			<div className="w-full">
				<p className="mb-2">Product description</p>
				<textarea
					onChange={(e) => setDescription(e.target.value)}
					value={description}
					className="w-full max-w-[500px] px-3 py-2"
					type="text"
					placeholder="Type description here"
					required
				/>
			</div>
			{/* Product Category */}
			<div className="flex flex-col w-full gap-2 sm:flex-row sm:gap-8">
				<div>
					<p className="mb-2">Product category</p>
					<select
						onChange={(e) => setCategory(e.target.value)}
						value={category}
						className="w-full px-3 py-2 text-gray-500 dark:text-gray-300"
					>
						<option value="" className="disabled">
							Select option
						</option>
						<option value="Men">Men</option>
						<option value="Women">Women</option>
						<option value="Kids">Kids</option>
					</select>
				</div>
				{/* Product Sub Category */}
				<div>
					<p className="mb-2">Product subCategory</p>
					<select
						onChange={(e) => setSubcategory(e.target.value)}
						value={subCategory}
						className="w-full px-3 py-2 text-gray-500 dark:text-gray-300"
					>
						<option value="" className="disabled">
							Select option
						</option>
						<option value="Topwear">Topwear</option>
						<option value="Bottomwear">Bottomwear</option>
						<option value="Winterwear">Winterwear</option>
					</select>
				</div>

				<div>
					<p className="mb-2">Product price</p>
					<input
						onChange={(e) => setPrice(e.target.value)}
						value={price}
						className="w-full px-3 py-2 sm:w-[120px]"
						type="number"
						placeholder="25"
					/>
				</div>
			</div>

			{/* Product sizes */}
			<div>
				<p className="mb-2">Product Sizes</p>
				<div className="flex gap-3">
					<div
						onClick={() =>
							setSizes((prev) =>
								prev.includes("S")
									? prev.filter((item) => item !== "S")
									: [...prev, "S"]
							)
						}
					>
						<p
							className={`${
								sizes.includes("S") ? "bg-pink-100 dark:bg-pink-500/25 dark:text-pink-100" : "bg-slate-200 dark:bg-gray-800"
							}  px-3 py-1 rounded-lg cursor-pointer select-none transition-colors `}
						>
							S
						</p>
					</div>
					<div
						onClick={() =>
							setSizes((prev) =>
								prev.includes("M")
									? prev.filter((item) => item !== "M")
									: [...prev, "M"]
							)
						}
					>
						<p
							className={`${
								sizes.includes("M") ? "bg-pink-100 dark:bg-pink-500/25 dark:text-pink-100" : "bg-slate-200 dark:bg-gray-800"
							}  px-3 py-1 rounded-lg cursor-pointer select-none transition-colors`}
						>
							M
						</p>
					</div>
					<div
						onClick={() =>
							setSizes((prev) =>
								prev.includes("L")
									? prev.filter((item) => item !== "L")
									: [...prev, "L"]
							)
						}
					>
						<p
							className={`${
								sizes.includes("L") ? "bg-pink-100 dark:bg-pink-500/25 dark:text-pink-100" : "bg-slate-200 dark:bg-gray-800"
							}  px-3 py-1 rounded-lg cursor-pointer select-none transition-colors`}
						>
							L
						</p>
					</div>
					<div
						onClick={() =>
							setSizes((prev) =>
								prev.includes("XL")
									? prev.filter((item) => item !== "XL")
									: [...prev, "XL"]
							)
						}
					>
						<p
							className={`${
								sizes.includes("XL") ? "bg-pink-100 dark:bg-pink-500/25 dark:text-pink-100" : "bg-slate-200 dark:bg-gray-800"
							}  px-3 py-1 rounded-lg cursor-pointer select-none transition-colors`}
						>
							XL
						</p>
					</div>
					<div
						onClick={() =>
							setSizes((prev) =>
								prev.includes("XXL")
									? prev.filter((item) => item !== "XXL")
									: [...prev, "XXL"]
							)
						}
					>
						<p
							className={`${
								sizes.includes("XXL") ? "bg-pink-100 dark:bg-pink-500/25 dark:text-pink-100" : "bg-slate-200 dark:bg-gray-800"
							}  px-3 py-1 rounded-lg cursor-pointer select-none transition-colors`}
						>
							XXL
						</p>
					</div>
				</div>
			</div>

			<div className="flex gap-2 mt-2">
				<input
					onChange={() => setBestseller((prev) => !prev)}
					checked={bestseller}
					type="checkbox"
					id="bestseller"
				/>
				<label className="cursor-pointer" htmlFor="bestseller">
					Add to Bestseller
				</label>
			</div>

			<button
				className="px-8 py-3 mt-4 text-sm font-medium text-white bg-gray-900 rounded-lg transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
				type="submit"
			>
				ADD
			</button>
		</form>
	);
};

export default Add;
