import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { imageUrl } from "../utils/image";

const Cart = () => {
	const { products, currency, cartItems, updateQuantity, navigate, token } =
		useContext(ShopContext);

	const [cartData, setCartData] = useState([]);

	useEffect(() => {
		if (products.length > 0) {
			const tempData = [];
			for (const items in cartItems) {
				for (const item in cartItems[items]) {
					if (cartItems[items][item] > 0) {
						tempData.push({
							_id: items,
							size: item,
							quantity: cartItems[items][item],
						});
					}
				}
			}
			setCartData(tempData);
		}
	}, [cartItems, products]);

	return (
		<div className="border-t pt-14">
			<div className="mb-3 text-2xl">
				<Title text1={"YOUR"} text2={"CART"} />
			</div>

			<div>
				{cartData.map((item, index) => {
					const productData = products.find(
						(product) => product._id === item._id
					);
					return (
						<div
							key={index}
							className="py-4 border-t border-b text-gray-700 dark:text-gray-200 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
						>
							<div className="flex items-start gap-6">
								<img
									className="w-16 sm:w-20"
									src={imageUrl(productData.image[0], 160)}
									alt={productData.name}
									loading="lazy"
									decoding="async"
									onError={(e) => {
										e.currentTarget.onerror = null;
										e.currentTarget.style.visibility = "hidden";
									}}
								/>
								<div>
									<p className="text-xs font-medium sm:text-lg">
										{productData.name}
									</p>
									<div className="flex items-center gap-5 mt-2">
										<p>
											{currency} {productData.price}
										</p>
										<p className="px-2 border sm:px-3 sm:py-1 bg-slate-50 dark:bg-gray-800">
											{item.size}
										</p>
									</div>
								</div>
							</div>
							<input
								onChange={(e) =>
									e.target.value === "" || e.target.value === "0"
										? null
										: updateQuantity(
												item._id,
												item.size,
												Number(e.target.value)
										  )
								}
								className="px-1 py-1 border max-w-10 sm:max-w-20 sm:px-2"
								type="number"
								min={1}
								aria-label={`Quantity for ${productData.name}, size ${item.size}`}
								defaultValue={item.quantity}
							/>
							<button
								type="button"
								onClick={() => updateQuantity(item._id, item.size, 0)}
								aria-label={`Remove ${productData.name}, size ${item.size} from cart`}
								className="p-1"
							>
								<img
									className="w-4 sm:w-5 dark:invert"
									src={assets.bin_icon}
									alt=""
								/>
							</button>
						</div>
					);
				})}
			</div>
			<div className="flex justify-end my-20">
				<div className="w-full sm:w-[450px]">
					<CartTotal />
					<div className="w-full text-end">
						<button
							onClick={() =>
								navigate(
									token
										? "/place-order"
										: "/login?redirect=/place-order"
								)
							}
							className="px-8 py-3 my-8 text-sm text-white dark:text-gray-900 bg-black dark:bg-white"
						>
							PROCEED TO CHECKOUT
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Cart;
