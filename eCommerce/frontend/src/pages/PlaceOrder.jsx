import React, { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
	const [method, setMethod] = useState("card");
	const {
		navigate,
		backendUrl,
		token,
		cartItems,
		setCartItems,
		getCartAmount,
		delivery_fee,
		products,
	} = useContext(ShopContext);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		street: "",
		city: "",
		state: "",
		zipcode: "",
		country: "",
		phone: "",
	});

	const onChangeHandler = (event) => {
		const name = event.target.name;
		const value = event.target.value;
		setFormData((data) => ({ ...data, [name]: value }));
	};

	// Checkout requires an account; send signed-out shoppers to login and
	// bring them straight back afterwards.
	useEffect(() => {
		if (!token) navigate("/login?redirect=/place-order");
	}, [token, navigate]);

	const onSubmitHandler = async (event) => {
		event.preventDefault();
		try {
			let orderItems = [];

			for (const items in cartItems) {
				for (const item in cartItems[items]) {
					if (cartItems[items][item] > 0) {
						const itemInfo = structuredClone(
							products.find((product) => product._id === items)
						);
						if (itemInfo) {
							itemInfo.size = item;
							itemInfo.quantity = cartItems[items][item];
							orderItems.push(itemInfo);
						}
					}
				}
			}

			let orderData = {
				address: formData,
				items: orderItems,
				amount: getCartAmount() + delivery_fee,
			};

			switch (method) {
				// Card option currently places the order for manual/card-on-delivery processing
				case "card": {
					const response = await axios.post(
						backendUrl + "/api/order/place",
						{ ...orderData, paymentMethod: "Card" },
						{ headers: { token } }
					);
					if (response.data.success) {
						setCartItems({});
						navigate("/orders");
					} else {
						toast.error(response.data.message);
					}
					break;
				}
				case "stripe": {
					const responseStripe = await axios.post(
						backendUrl + "/api/order/stripe",
						orderData,
						{ headers: { token } }
					);
					if (responseStripe.data.success) {
						const { session_url } = responseStripe.data;
						window.location.replace(session_url);
					} else {
						toast.error(responseStripe.data.message);
					}
					break;
				}

				default:
					break;
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		}
	};

	return (
		<form
			onSubmit={onSubmitHandler}
			className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
		>
			{/* ------------- Left Side ---------------- */}
			<div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
				<div className="my-3 text-xl sm:text-2xl">
					<Title text1={"DELIVERY"} text2={"INFORMATION"} />
				</div>
				<div className="flex gap-3">
					<input
						required
						onChange={onChangeHandler}
						name="firstName"
						value={formData.firstName}
						className="border border-gray-300 dark:border-gray-700 rounded py-1.5 px-3.5 w-full"
						type="text"
						placeholder="First name"
					/>
					<input
						required
						onChange={onChangeHandler}
						name="lastName"
						value={formData.lastName}
						className="border border-gray-300 dark:border-gray-700 rounded py-1.5 px-3.5 w-full"
						type="text"
						placeholder="Last name"
					/>
				</div>
				<input
					required
					onChange={onChangeHandler}
					name="email"
					value={formData.email}
					className="border border-gray-300 dark:border-gray-700 rounded py-1.5 px-3.5 w-full"
					type="email"
					placeholder="Email address"
				/>
				<input
					required
					onChange={onChangeHandler}
					name="street"
					value={formData.street}
					className="border border-gray-300 dark:border-gray-700 rounded py-1.5 px-3.5 w-full"
					type="text"
					placeholder="Street"
				/>
				<div className="flex gap-3">
					<input
						required
						onChange={onChangeHandler}
						name="city"
						value={formData.city}
						className="border border-gray-300 dark:border-gray-700 rounded py-1.5 px-3.5 w-full"
						type="text"
						placeholder="City"
					/>
					<input
						onChange={onChangeHandler}
						name="state"
						value={formData.state}
						className="border border-gray-300 dark:border-gray-700 rounded py-1.5 px-3.5 w-full"
						type="text"
						placeholder="State"
					/>
				</div>
				<div className="flex gap-3">
					<input
						required
						onChange={onChangeHandler}
						name="zipcode"
						value={formData.zipcode}
						className="border border-gray-300 dark:border-gray-700 rounded py-1.5 px-3.5 w-full"
						type="number"
						placeholder="Zipcode"
					/>
					<input
						required
						onChange={onChangeHandler}
						name="country"
						value={formData.country}
						className="border border-gray-300 dark:border-gray-700 rounded py-1.5 px-3.5 w-full"
						type="text"
						placeholder="Country"
					/>
				</div>
				<input
					required
					onChange={onChangeHandler}
					name="phone"
					value={formData.phone}
					className="border border-gray-300 dark:border-gray-700 rounded py-1.5 px-3.5 w-full"
					type="number"
					placeholder="Phone"
				/>
			</div>

			{/* ------------- Right Side ------------------ */}
			<div className="mt-8">
				<div className="mt-8 w-full sm:min-w-80">
					<CartTotal />
				</div>

				<div className="mt-12">
					<Title text1={"PAYMENT"} text2={"METHOD"} />
					{/* --------------- Payment Method Selection ------------- */}
					<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap" role="radiogroup" aria-label="Payment method">
						<button
							type="button"
							onClick={() => setMethod("stripe")}
							aria-checked={method === "stripe"}
							role="radio"
							className={`flex items-center gap-3 min-h-[52px] px-4 py-3 text-left border transition-colors ${
								method === "stripe"
									? "border-gray-900 bg-gray-50 dark:border-gray-200 dark:bg-gray-900"
									: "border-gray-300 hover:border-gray-500 dark:border-gray-700 dark:hover:border-gray-500"
							}`}
						>
							<span
								className={`w-4 h-4 border rounded-full flex items-center justify-center ${
									method === "stripe" ? "border-green-500" : "border-gray-400"
								}`}
							>
								{method === "stripe" && <span className="w-2 h-2 bg-green-500 rounded-full" />}
							</span>
							<img className="h-5 mx-1" src={assets.stripe_logo} alt="Stripe" />
						</button>
						<button
							type="button"
							onClick={() => setMethod("card")}
							aria-checked={method === "card"}
							role="radio"
							className={`flex items-center gap-3 min-h-[52px] px-4 py-3 text-left border transition-colors ${
								method === "card"
									? "border-gray-900 bg-gray-50 dark:border-gray-200 dark:bg-gray-900"
									: "border-gray-300 hover:border-gray-500 dark:border-gray-700 dark:hover:border-gray-500"
							}`}
						>
							<span
								className={`w-4 h-4 border rounded-full flex items-center justify-center ${
									method === "card" ? "border-green-500" : "border-gray-400"
								}`}
							>
								{method === "card" && <span className="w-2 h-2 bg-green-500 rounded-full" />}
							</span>
							<span className="text-sm font-medium tracking-wide text-gray-700 dark:text-gray-200">
								CREDIT / DEBIT CARD
							</span>
						</button>
					</div>

					<div className="w-full mt-8 sm:text-end">
						<button
							type="submit"
							className="w-full sm:w-auto px-12 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors bg-black dark:text-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200"
						>
							PLACE ORDER
						</button>
					</div>
				</div>
			</div>
		</form>
	);
};

export default PlaceOrder;
