import React, { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const isDev = import.meta.env.DEV;

const DemoLogin = () => {
	const { setToken, setUser, navigate, backendUrl } = useContext(ShopContext);
	const [searchParams] = useSearchParams();
	const [status, setStatus] = useState("Signing you into the demo account…");

	const redirectTo =
		searchParams.get("redirect")?.startsWith("/") &&
		!searchParams.get("redirect")?.startsWith("//")
			? searchParams.get("redirect")
			: "/";

	useEffect(() => {
		if (!isDev) {
			setStatus("Demo login is only available in development.");
			return;
		}

		const signIn = async () => {
			try {
				const response = await axios.post(backendUrl + "/api/user/oauth/demo");
				if (response.data.success) {
					const { token: demoToken, user: demoUser } = response.data;
					localStorage.setItem("token", demoToken);
					localStorage.setItem("user", JSON.stringify(demoUser));
					localStorage.setItem("demo-login", "1");
					setToken(demoToken);
					setUser(demoUser);
					toast.success("Signed in as demo user");
					navigate(redirectTo);
				} else {
					setStatus(response.data.message || "Demo sign-in failed.");
				}
			} catch (error) {
				console.log(error);
				setStatus(error.message || "Demo sign-in failed.");
			}
		};

		signIn();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [backendUrl, navigate, redirectTo, setToken, setUser]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center text-gray-800 dark:text-gray-100">
			<div className="w-10 h-10 mb-4 border-2 border-gray-300 rounded-full border-t-gray-800 animate-spin dark:border-gray-600 dark:border-t-gray-200" />
			<p className="text-lg font-medium">{status}</p>
		</div>
	);
};

export default DemoLogin;
