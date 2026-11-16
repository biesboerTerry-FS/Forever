import React, { useEffect, useMemo, useState } from "react";
import { backendUrl, currency } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { firstImage } from "../utils/image";

const List = ({ token }) => {
	const [list, setList] = useState([]);
	const [editingId, setEditingId] = useState(null);
	const [editForm, setEditForm] = useState(null);
	const [saving, setSaving] = useState(false);
	const [search, setSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [bestsellerFilter, setBestsellerFilter] = useState("all");

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

	const startEdit = (item) => {
		setEditingId(item._id);
		setEditForm({
			name: item.name || "",
			description: item.description || "",
			price: item.price ?? "",
			category: item.category || "",
			subCategory: item.subCategory || "",
			sizes: Array.isArray(item.sizes) ? item.sizes.join(", ") : "",
			bestseller: !!item.bestseller,
		});
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditForm(null);
	};

	const saveEdit = async (id) => {
		try {
			setSaving(true);
			const sizes = editForm.sizes
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);
			const payload = {
				id,
				name: editForm.name,
				description: editForm.description,
				price: Number(editForm.price),
				category: editForm.category,
				subCategory: editForm.subCategory,
				sizes,
				bestseller: editForm.bestseller,
			};
			const response = await axios.post(
				backendUrl + "/api/product/update",
				payload,
				{ headers: { token } }
			);
			if (response.data.success) {
				toast.success(response.data.message || "Product updated.");
				cancelEdit();
				await fetchList();
			} else {
				toast.error(response.data.message || "Failed to update product.");
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		} finally {
			setSaving(false);
		}
	};

	const categories = useMemo(() => {
		const set = new Set(list.map((i) => i.category).filter(Boolean));
		return ["all", ...Array.from(set).sort()];
	}, [list]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return list.filter((item) => {
			const matchesSearch =
				!q ||
				[item.name, item.category, item.subCategory, item.description]
					.filter(Boolean)
					.some((v) => String(v).toLowerCase().includes(q));
			const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
			const matchesBest =
				bestsellerFilter === "all" ||
				(bestsellerFilter === "yes" ? !!item.bestseller : !item.bestseller);
			return matchesSearch && matchesCategory && matchesBest;
		});
	}, [list, search, categoryFilter, bestsellerFilter]);

	const exportCsv = () => {
		const rows = [
			["id", "name", "category", "subCategory", "price", "bestseller", "sizes", "date"],
			...filtered.map((p) => [
				p._id,
				p.name || "",
				p.category || "",
				p.subCategory || "",
				p.price ?? "",
				p.bestseller ? "yes" : "no",
				Array.isArray(p.sizes) ? p.sizes.join("|") : "",
				p.date ? new Date(p.date).toISOString() : "",
			]),
		];
		const csv = rows
			.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
			.join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	useEffect(() => {
		fetchList();
	}, []);

	return (
		<>
			<div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">All Products</h3>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						Showing {filtered.length} of {list.length} products
					</p>
				</div>
				<button
					type="button"
					onClick={exportCsv}
					className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
				>
					Export CSV
				</button>
			</div>

			<div className="grid gap-2 p-3 mb-3 bg-white rounded-2xl shadow-sm sm:grid-cols-4 dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
				<input
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search products..."
					className="px-3 py-2 text-sm border rounded-lg sm:col-span-2 dark:bg-gray-950 dark:border-gray-700"
				/>
				<select
					value={categoryFilter}
					onChange={(e) => setCategoryFilter(e.target.value)}
					className="px-3 py-2 text-sm border rounded-lg dark:bg-gray-950 dark:border-gray-700"
				>
					{categories.map((c) => (
						<option key={c} value={c}>
							{c === "all" ? "All categories" : c}
						</option>
					))}
				</select>
				<select
					value={bestsellerFilter}
					onChange={(e) => setBestsellerFilter(e.target.value)}
					className="px-3 py-2 text-sm border rounded-lg dark:bg-gray-950 dark:border-gray-700"
				>
					<option value="all">All items</option>
					<option value="yes">Bestsellers</option>
					<option value="no">Non-bestsellers</option>
				</select>
			</div>

			<div className="flex flex-col gap-1 p-2 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
				{/* ------------ List Table Title -------------- */}
				<div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1.2fr] items-center px-3 py-2 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
					<span>Image</span>
					<span>Name</span>
					<span>Category</span>
					<span>Price</span>
					<span className="text-center">Actions</span>
				</div>

				{/* ------------ Product List ------------------ */}
				{filtered.length === 0 ? (
					<p className="px-3 py-10 text-sm text-center text-gray-500 dark:text-gray-400">No products match your filters.</p>
				) : null}
				{filtered.map((item) => (
					<div
						key={item._id}
						className="px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60"
					>
						<div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_3fr_1fr_1fr_1.2fr] items-center gap-2">
							<img
								className="object-cover w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800"
								src={firstImage(item.image, 120)}
								alt={item.name}
								loading="lazy"
								decoding="async"
							/>
							<div className="md:contents">
								<p className="font-medium md:font-normal">{item.name}</p>
								<p className="text-gray-500 dark:text-gray-400">{item.category}</p>
								<p>
									{currency}
									{item.price}
								</p>
							</div>
							<div className="flex items-center justify-end gap-3 col-span-3 md:col-span-1 md:justify-center">
								<button
									type="button"
									onClick={() => (editingId === item._id ? cancelEdit() : startEdit(item))}
									className="text-sm text-blue-600 hover:underline dark:text-blue-400"
								>
									{editingId === item._id ? "Close" : "Edit"}
								</button>
								<button
									type="button"
									onClick={() => {
										if (window.confirm(`Remove “${item.name}” from the catalogue?`)) {
											removeProduct(item._id);
										}
									}}
									aria-label={`Remove ${item.name}`}
									className="text-lg text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
									title="Remove product"
								>
									X
								</button>
							</div>
						</div>

						{editingId === item._id && editForm && (
							<div className="grid gap-3 p-3 mt-3 border border-gray-200 rounded-lg md:grid-cols-2 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
								<label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
									Name
									<input
										className="px-3 py-2 text-sm border rounded dark:bg-gray-900 dark:border-gray-700"
										value={editForm.name}
										onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
									/>
								</label>
								<label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
									Price
									<input
										type="number"
										className="px-3 py-2 text-sm border rounded dark:bg-gray-900 dark:border-gray-700"
										value={editForm.price}
										onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
									/>
								</label>
								<label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300 md:col-span-2">
									Description
									<textarea
										rows={3}
										className="px-3 py-2 text-sm border rounded dark:bg-gray-900 dark:border-gray-700"
										value={editForm.description}
										onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
									/>
								</label>
								<label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
									Category
									<input
										className="px-3 py-2 text-sm border rounded dark:bg-gray-900 dark:border-gray-700"
										value={editForm.category}
										onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
									/>
								</label>
								<label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
									Sub Category
									<input
										className="px-3 py-2 text-sm border rounded dark:bg-gray-900 dark:border-gray-700"
										value={editForm.subCategory}
										onChange={(e) => setEditForm({ ...editForm, subCategory: e.target.value })}
									/>
								</label>
								<label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300 md:col-span-2">
									Sizes (comma separated)
									<input
										className="px-3 py-2 text-sm border rounded dark:bg-gray-900 dark:border-gray-700"
										value={editForm.sizes}
										onChange={(e) => setEditForm({ ...editForm, sizes: e.target.value })}
									/>
								</label>
								<label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
									<input
										type="checkbox"
										checked={editForm.bestseller}
										onChange={(e) => setEditForm({ ...editForm, bestseller: e.target.checked })}
									/>
									Bestseller
								</label>
								<div className="flex gap-2 md:col-span-2">
									<button
										type="button"
										disabled={saving}
										onClick={() => saveEdit(item._id)}
										className="px-4 py-2 text-sm text-white bg-black rounded disabled:opacity-60 dark:bg-white dark:text-gray-900"
									>
										{saving ? "Saving..." : "Save changes"}
									</button>
									<button
										type="button"
										onClick={cancelEdit}
										className="px-4 py-2 text-sm border rounded dark:border-gray-700"
									>
										Cancel
									</button>
								</div>
								<p className="text-xs text-gray-500 md:col-span-2 dark:text-gray-400">
									Images are not editable here; remove and re-add the product to change images.
								</p>
							</div>
						)}
					</div>
				))}
			</div>
		</>
	);
};

export default List;
