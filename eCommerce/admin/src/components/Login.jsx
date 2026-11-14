import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import ThemeToggle from "./ThemeToggle";

const Login = ({ setToken, dark, setDark }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const onSubmitHandler = async (e) => {
		try {
			e.preventDefault();
			const response = await axios.post(backendUrl + "/api/user/admin", {
				email,
				password,
			});
			if (response.data.success) {
				setToken(response.data.token);
				console.log(response);
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		}
	};

	return (
		<div className="relative flex items-center justify-center w-full min-h-screen px-4 bg-gradient-to-br from-pink-50 via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
			<div className="absolute top-5 right-5">
				<ThemeToggle dark={dark} onToggle={() => setDark((value) => !value)} />
			</div>
			<div className="w-full max-w-md px-8 py-9 bg-white rounded-2xl shadow-lg shadow-gray-200/70 dark:bg-gray-900 dark:shadow-black/40">
				<img
					className="w-24 mb-7 dark:brightness-0 dark:invert"
					src={assets.logo}
					alt="Forever"
				/>
				<h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
					Admin Panel
				</h1>
				<p className="mb-7 text-sm text-gray-500 dark:text-gray-400">
					Sign in to manage products and orders.
				</p>
				<form onSubmit={onSubmitHandler}>
					<div className="mb-4 min-w-72">
						<p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
							Email Address
						</p>
						<input
							onChange={(e) => setEmail(e.target.value)}
							value={email}
							className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none dark:border-gray-700"
							type="text"
							autoComplete="username"
							placeholder="admin@example.com"
							required
						/>
					</div>
					<div className="mb-4 min-w-72">
						<p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
							Password
						</p>
						<input
							onChange={(e) => setPassword(e.target.value)}
							value={password}
							className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none dark:border-gray-700"
							type="password"
							placeholder="password"
							required
						/>
					</div>
					<button
						className="w-full px-4 py-2.5 mt-2 text-sm font-medium text-white bg-gray-900 rounded-lg transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
						type="submit"
					>
						Login
					</button>
				</form>
			</div>
		</div>
	);
};

export default Login;
