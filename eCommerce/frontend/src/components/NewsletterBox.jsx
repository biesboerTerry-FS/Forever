import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";

const NewsletterBox = () => {
	const { backendUrl } = useContext(ShopContext);
	const [email, setEmail] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const onSubmitHandler = async (event) => {
		event.preventDefault();
		setSubmitting(true);
		try {
			const { data } = await axios.post(
				backendUrl + "/api/newsletter/subscribe",
				{ email }
			);
			if (data.success) {
				toast.success(data.message);
				setEmail("");
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error("Could not subscribe right now. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="text-center">
			<p className="text-2xl font-medium text-gray-800 dark:text-gray-100">
				Subscribe now and get 20% off!
			</p>
			<p className="mt-3 text-gray-500 dark:text-gray-400">
				Join the Forever list for early access to new arrivals, styling
				notes and members-only offers. No spam — unsubscribe anytime.
			</p>
			<form
				onSubmit={onSubmitHandler}
				className="flex items-center w-full gap-3 pl-3 mx-auto my-6 border sm:w-1/2"
			>
				<input
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full outline-none sm:flex-1"
					type="email"
					placeholder="Enter your email"
					aria-label="Email address"
					required
				/>
				<button
					className="px-10 py-4 text-xs text-white dark:text-gray-900 bg-black dark:bg-white disabled:opacity-60"
					type="submit"
					disabled={submitting}
				>
					{submitting ? "SUBSCRIBING…" : "SUBSCRIBE"}
				</button>
			</form>
		</div>
	);
};

export default NewsletterBox;
