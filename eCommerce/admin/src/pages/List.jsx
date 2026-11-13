import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { firstImage } from "../utils/image";

const List = ({ token }) => {
	const [list, setList] = useState([]);

	const fetchList = async () => {
		try {
			const response = await axios.get(backendUrl + "/api/product/list");
			if (response.data.success) {
				setList(response.data.products);
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		}
	};

	const removeProduct = async (id) => {
		try {
			const response = await axios.post(
				backendUrl + "/api/product/remove",
				{ id },
				{ headers: { token } }
			);
			if (response.data.message) {
				toast.success(response.data.message);
				await fetchList();
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		}
	};

	useEffect(() => {
		fetchList();
	}, []);

	return (
		<>
			<h3 className="mb-3 text-lg font-medium text-gray-800 dark:text-gray-100">All Products</h3>
			<div className="flex flex-col gap-1 p-2 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
				{/* ------------ List Table Title -------------- */}
				<div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center px-3 py-2 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
					<span>Image</span>
					<span>Name</span>
					<span>Category</span>
					<span>Price</span>
					<span className="text-center">Action</span>
				</div>

				{/* ------------ Product List ------------------ */}
				{list.map((item, index) => (
					<div
						className="grid grid-col-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60"
						key={index}
					>
						<img
							className="w-12 rounded-lg"
							src={firstImage(item.image, 120)}
							alt={item.name}
							loading="lazy"
							decoding="async"
						/>
						<p>{item.name}</p>
						<p className="text-gray-500 dark:text-gray-400">{item.category}</p>
						<p>
							{currency}
							{item.price}
						</p>
						<button
							type="button"
							onClick={() => {
								if (
									window.confirm(
										`Remove “${item.name}” from the catalogue?`
									)
								) {
									removeProduct(item._id);
								}
							}}
							aria-label={`Remove ${item.name}`}
							className="text-lg text-right text-gray-400 md:text-center hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
							title="Remove product"
						>
							X
						</button>
					</div>
				))}
			</div>
		</>
	);
};

export default List;
