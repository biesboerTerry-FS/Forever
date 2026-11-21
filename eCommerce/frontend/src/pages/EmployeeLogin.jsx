import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import {
	demoEmployeeSignIn,
	readEmployeeSession,
} from "../utils/employeeSession";

const EmployeeLogin = () => {
	const { backendUrl, navigate } = useContext(ShopContext);
	const [status, setStatus] = useState("Signing you in as a demo employee…");
	const started = useRef(false);

	useEffect(() => {
		if (started.current) return;
		started.current = true;

		if (readEmployeeSession()) {
			navigate("/employee", { replace: true });
			return;
		}

		let active = true;
		const signIn = async () => {
			try {
				const session = await demoEmployeeSignIn(backendUrl);
				if (active) {
					setStatus(
						session.offline
							? "Signed in with the offline demo profile."
							: "Signed in. Opening your portal…"
					);
					navigate("/employee", { replace: true });
				}
			} catch (error) {
				if (active) {
					setStatus(error?.message || "Demo employee sign-in failed.");
				}
			}
		};
		signIn();
		return () => {
			active = false;
		};
	}, [backendUrl, navigate]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center text-gray-800 dark:text-gray-100">
			<div className="w-10 h-10 mb-4 border-2 border-gray-300 rounded-full border-t-gray-800 animate-spin dark:border-gray-600 dark:border-t-gray-200" />
			<p className="text-lg font-medium">{status}</p>
			<Link
				to="/login"
				className="mt-4 text-sm underline hover:text-black dark:hover:text-white"
			>
				Back to sign in
			</Link>
		</div>
	);
};

export default EmployeeLogin;
