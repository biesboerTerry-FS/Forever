import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const ForgotPassword = () => {
	const { backendUrl } = useContext(ShopContext);
	const [email, setEmail] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [sent, setSent] = useState(false);

	const onSubmitHandler = async (event) => {
		event.preventDefault();
		setSubmitting(true);
		try {
			const { data } = await axios.post(
				backendUrl + "/api/user/forgot-password",
				{ email }
			);
			// The API always reports success so it can't be used to discover
			// which emails have accounts.
			if (data.success) {
				setSent(true);
				toast.success(data.message);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800 dark:text-gray-100">
			<div className="inline-flex items-center gap-2 mt-10 mb-2">
				<p className="text-3xl prata-regular">Reset password</p>
				<hr className="border-none h-[1.5px] w-8 bg-gray-800 dark:bg-gray-200" />
			</div>

			{sent ? (
				<div className="flex flex-col items-center gap-4 text-center">
					<p className="text-sm text-gray-600 dark:text-gray-300">
						If an account exists for{" "}
						<span className="font-medium text-gray-900 dark:text-white">
							{email}
						</span>
						, a reset link is on its way. The link expires in one hour.
					</p>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						Didn't get it? Check your spam folder or{" "}
						<button
							type="button"
							onClick={() => setSent(false)}
							className="underline"
						>
							try again
						</button>
						.
					</p>
				</div>
			) : (
				<form
					onSubmit={onSubmitHandler}
					className="flex flex-col items-center w-full gap-4"
				>
					<p className="text-sm text-center text-gray-600 dark:text-gray-300">
						Enter the email address for your account and we'll send you a
						link to choose a new password.
					</p>
					<input
						onChange={(e) => setEmail(e.target.value)}
						value={email}
						type="email"
						autoComplete="email"
						aria-label="Email address"
						className="w-full px-3 py-2 border border-gray-800 dark:border-gray-300"
						placeholder="Email"
						required
					/>
					<button
						type="submit"
						disabled={submitting}
						className="px-8 py-2 mt-2 font-light text-white dark:text-gray-900 bg-black dark:bg-white disabled:opacity-60"
					>
						{submitting ? "Sending…" : "Send reset link"}
					</button>
				</form>
			)}

			<Link
				to="/login"
				className="mt-4 text-sm text-gray-600 dark:text-gray-300 underline"
			>
				Back to sign in
			</Link>
		</div>
	);
};

export default ForgotPassword;
