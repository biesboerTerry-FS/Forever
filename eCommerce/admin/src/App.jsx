import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "$";

const THEME_KEY = "admin-theme";

const getInitialTheme = () => {
	if (typeof window === "undefined") return false;
	const stored = window.localStorage.getItem(THEME_KEY);
	if (stored === "dark") return true;
	if (stored === "light") return false;
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const App = () => {
	const [token, setToken] = useState(
		localStorage.getItem("token") ? localStorage.getItem("token") : ""
	);
	const [dark, setDark] = useState(getInitialTheme);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", dark);
		document.documentElement.style.colorScheme = dark ? "dark" : "light";
		localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
	}, [dark]);

	useEffect(() => {
		localStorage.setItem("token", token);
	}, [token]);

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-200 transition-colors">
			<a
				href="#admin-main"
				className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-gray-900 focus:text-white dark:focus:bg-white dark:focus:text-gray-900"
			>
				Skip to content
			</a>
			<ToastContainer theme={dark ? "dark" : "light"} />
			{token === "" ? (
				<Login setToken={setToken} dark={dark} setDark={setDark} />
			) : (
				<>
					<Navbar setToken={setToken} dark={dark} setDark={setDark} />
					<div className="flex w-full">
						<Sidebar />
						<main
							id="admin-main"
							className="flex-1 min-w-0 px-[4%] py-8 text-base"
						>
							<ErrorBoundary>
								<Routes>
									<Route path="/" element={<Dashboard token={token} />} />
									<Route path="/add" element={<Add token={token} />} />
									<Route path="/list" element={<List token={token} />} />
									<Route
										path="/orders"
										element={<Orders token={token} />}
									/>
								</Routes>
							</ErrorBoundary>
						</main>
					</div>
				</>
			)}
		</div>
	);
};

export default App;
