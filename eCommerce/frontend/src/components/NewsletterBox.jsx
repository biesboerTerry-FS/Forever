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
		<div className="px-4 py-10 my-10 text-center border border-gray-200 sm:my-14 sm:px-8 bg-gray-50/60 dark:bg-gray-900/40 dark:border-gray-800">
			<p className="text-2xl font-medium text-gray-800 sm:text-3xl dark:text-gray-100">
				Subscribe now and get 20% off
			</p>
			<p className="max-w-2xl mx-auto mt-3 text-sm leading-6 text-gray-500 sm:text-base dark:text-gray-400">
				Join the Forever list for early access to new arrivals, styling notes,
				and members-only offers. No spam — unsubscribe anytime.
			</p>
			<form
				onSubmit={onSubmitHandler}
				className="flex flex-col w-full max-w-xl gap-3 mx-auto mt-6 sm:flex-row sm:items-stretch"
			>
				<input
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full px-4 py-3 text-sm bg-white border border-gray-300 outline-none dark:bg-gray-950 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-300"
					type="email"
					placeholder="Enter your email address"
					aria-label="Email address"
					required
				/>
				<button
					className="px-8 py-3 text-xs font-semibold tracking-wide text-white transition-colors bg-black dark:text-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-60 sm:whitespace-nowrap"
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
