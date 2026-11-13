import React, { useContext, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const ResetPassword = () => {
	const { backendUrl, navigate } = useContext(ShopContext);
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token") || "";

	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [done, setDone] = useState(false);

	const onSubmitHandler = async (event) => {
		event.preventDefault();

		if (password !== confirm) {
			toast.error("Passwords do not match");
			return;
		}
		if (password.length < 8) {
			toast.error("Password must contain at least 8 characters");
			return;
		}

		setSubmitting(true);
		try {
			const { data } = await axios.post(
				backendUrl + "/api/user/reset-password",
				{ token, password }
			);
			if (data.success) {
				setDone(true);
				toast.success(data.message);
				setTimeout(() => navigate("/login"), 1200);
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
				<p className="text-3xl prata-regular">New password</p>
				<hr className="border-none h-[1.5px] w-8 bg-gray-800 dark:bg-gray-200" />
			</div>

			{!token ? (
				<div className="flex flex-col items-center gap-4 text-center">
					<p className="text-sm text-gray-600 dark:text-gray-300">
						This reset link is missing its token. Request a new link to
						continue.
					</p>
					<Link
						to="/forgot-password"
						className="px-8 py-2 font-light text-white dark:text-gray-900 bg-black dark:bg-white"
					>
						Request a new link
					</Link>
				</div>
			) : done ? (
				<p className="text-sm text-center text-gray-600 dark:text-gray-300">
					Your password has been updated. Taking you to sign in…
				</p>
			) : (
				<form
					onSubmit={onSubmitHandler}
					className="flex flex-col items-center w-full gap-4"
				>
					<input
						onChange={(e) => setPassword(e.target.value)}
						value={password}
						type="password"
						autoComplete="new-password"
						aria-label="New password"
						className="w-full px-3 py-2 border border-gray-800 dark:border-gray-300"
						placeholder="New password"
						minLength={8}
						required
					/>
					<input
						onChange={(e) => setConfirm(e.target.value)}
						value={confirm}
						type="password"
						autoComplete="new-password"
						aria-label="Confirm new password"
						className="w-full px-3 py-2 border border-gray-800 dark:border-gray-300"
						placeholder="Confirm new password"
						minLength={8}
						required
					/>
					<button
						type="submit"
						disabled={submitting}
						className="px-8 py-2 mt-2 font-light text-white dark:text-gray-900 bg-black dark:bg-white disabled:opacity-60"
					>
						{submitting ? "Updating…" : "Update password"}
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

export default ResetPassword;
