import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DEMO_OAUTH_ENABLED = import.meta.env.DEV;

const GoogleIcon = () => (
	<svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
		<path
			fill="#EA4335"
			d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
		/>
		<path
			fill="#4285F4"
			d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
		/>
		<path
			fill="#FBBC05"
			d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
		/>
		<path
			fill="#34A853"
			d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
		/>
	</svg>
);

const Login = () => {
	const [currentState, setCurrentState] = useState("Login");
	const {
		token,
		setToken,
		navigate,
		backendUrl,
		setUser,
	} = useContext(ShopContext);

	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");
	const googleButtonRef = useRef(null);
	const [searchParams] = useSearchParams();

	// Only allow same-site relative redirects so a crafted link can't bounce
	// shoppers to another domain after sign-in.
	const rawRedirect = searchParams.get("redirect") || "/";
	const redirectTo =
		rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
			? rawRedirect
			: "/";

	const finishSignIn = (data, greeting = true) => {
		setToken(data.token);
		localStorage.setItem("token", data.token);
		if (data.user) {
			setUser(data.user);
			localStorage.setItem("user", JSON.stringify(data.user));
		}
		if (greeting) {
			toast.success(
				data.user?.name
					? `Welcome back, ${data.user.name.split(" ")[0]}!`
					: "Signed in successfully"
			);
		}
		navigate(redirectTo);
	};

	const onSubmitHandler = async (event) => {
		event.preventDefault();
		try {
			if (currentState === "Sign Up") {
				const response = await axios.post(
					backendUrl + "/api/user/register",
					{ name, email, password }
				);
				if (response.data.success) {
					finishSignIn(response.data, false);
				} else {
					toast.error(response.data.message);
				}
			} else {
				const response = await axios.post(backendUrl + "/api/user/login", {
					email,
					password,
				});
				if (response.data.success) {
					finishSignIn(response.data);
				} else {
					toast.error(response.data.message);
				}
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		}
	};

	// Real Google sign-in: load Google Identity Services and verify the ID
	// token on the backend.
	useEffect(() => {
		if (!GOOGLE_CLIENT_ID) return;
		const scriptId = "google-gsi-script";

		const init = () => {
			if (!window.google?.accounts?.id) return;
			window.google.accounts.id.initialize({
				client_id: GOOGLE_CLIENT_ID,
				callback: async (response) => {
					try {
						const res = await axios.post(
							backendUrl + "/api/user/google",
							{ credential: response.credential }
						);
						if (res.data.success) finishSignIn(res.data);
						else toast.error(res.data.message);
					} catch (error) {
						console.log(error);
						toast.error("Google sign-in failed. Please try again.");
					}
				},
			});
			if (googleButtonRef.current) {
				window.google.accounts.id.renderButton(googleButtonRef.current, {
					theme: "outline",
					size: "large",
					text: "continue_with",
					width: 320,
				});
			}
		};

		if (document.getElementById(scriptId)) {
			init();
			return;
		}
		const script = document.createElement("script");
		script.id = scriptId;
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		script.onload = init;
		document.body.appendChild(script);
	}, [backendUrl]); // eslint-disable-line react-hooks/exhaustive-deps

	const demoOAuth = async () => {
		try {
			const response = await axios.post(
				backendUrl + "/api/user/oauth/demo",
				{}
			);
			if (response.data.success) finishSignIn(response.data);
			else toast.error(response.data.message);
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		}
	};

	useEffect(() => {
		if (token) navigate(redirectTo);
	}, [token]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div>
			<form
				onSubmit={onSubmitHandler}
				className=" flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800 dark:text-gray-100
		"
			>
				<div className="inline-flex items-center gap-2 mt-10 mb-2">
					<p className="text-3xl prata-regular">{currentState}</p>
					<hr className="border-none h-[1.5px] w-8 bg-gray-800 dark:bg-gray-200" />
				</div>
				{currentState === "Login" ? (
					""
				) : (
					<div className="">
						<input
							onChange={(e) => setName(e.target.value)}
							value={name}
							type="text"
							className="w-full px-3 py-2 my-2 border border-gray-800 dark:border-gray-300"
							placeholder="Full Name"
							required
						/>
					</div>
				)}

				<input
					onChange={(e) => setEmail(e.target.value)}
					value={email}
					type="email"
					className="w-full px-3 py-2 border border-gray-800 dark:border-gray-300"
					placeholder="Email"
					required
				/>
				<input
					onChange={(e) => setPassword(e.target.value)}
					value={password}
					type="password"
					className="w-full px-3 py-2 border border-gray-800 dark:border-gray-300"
					placeholder="Password"
					required
				/>
				<div className="w-full flex justify-between text-sm mt-[-8px]">
					{currentState === "Login" ? (
						<Link to="/forgot-password" className="cursor-pointer">
							Forgot your password?
						</Link>
					) : (
						<span />
					)}
					{currentState === "Login" ? (
						<button
							type="button"
							onClick={() => setCurrentState("Sign Up")}
							className="cursor-pointer"
						>
							Create Account
						</button>
					) : (
						<button
							type="button"
							onClick={() => setCurrentState("Login")}
							className="cursor-pointer"
						>
							Login
						</button>
					)}
				</div>
				<button className="px-8 py-2 mt-4 font-light text-white dark:text-gray-900 bg-black dark:bg-white">
					{currentState === "Login" ? "Sign In" : "Sign Up"}
				</button>

				<div className="flex items-center w-full gap-3 my-2 text-xs text-gray-400 dark:text-gray-500">
					<hr className="flex-1" />
					<span>OR</span>
					<hr className="flex-1" />
				</div>

				{GOOGLE_CLIENT_ID ? (
					<div ref={googleButtonRef} className="flex justify-center" />
				) : DEMO_OAUTH_ENABLED ? (
					<>
						<button
							type="button"
							onClick={demoOAuth}
							className="flex items-center justify-center w-full gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
						>
							<GoogleIcon />
							Continue with Google
							<span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-white dark:text-gray-900 bg-gray-700 dark:bg-gray-300 rounded">
								demo
							</span>
						</button>
						<p className="max-w-xs text-center text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
							Google OAuth isn't configured on this deployment, so this
							signs you in to a shared demo Google account to preview the
							social-login flow.
						</p>
					</>
				) : null}
			</form>
		</div>
	);
};

export default Login;
