import React, { useContext, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SignIn, useAuth } from "@clerk/react";
import { ShopContext } from "../context/ShopContext";

const isDev = import.meta.env.DEV;

const Login = () => {
	const { token, navigate } = useContext(ShopContext);
	const { isSignedIn } = useAuth();
	const [searchParams] = useSearchParams();

	// Only allow same-site relative redirects so a crafted link can't bounce
	// shoppers to another domain after sign-in.
	const rawRedirect = searchParams.get("redirect") || "/";
	const redirectTo =
		rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
			? rawRedirect
			: "/";

	useEffect(() => {
		if (token || isSignedIn) navigate(redirectTo);
	}, [token, isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-14 gap-4 text-gray-800 dark:text-gray-100">
			<div className="inline-flex items-center gap-2 mt-10 mb-2">
				<p className="text-3xl prata-regular">Sign In</p>
				<hr className="border-none h-[1.5px] w-8 bg-gray-800 dark:bg-gray-200" />
			</div>
			<div className="w-full">
				<SignIn
					signUpUrl="/login"
					fallbackRedirectUrl={redirectTo}
					appearance={{
						variables: {
							colorPrimary: "#000000",
						},
					}}
				/>
			</div>
			{isDev && (
				<div className="w-full pt-2">
					<Link
						to={`/demo-login?redirect=${encodeURIComponent(redirectTo)}`}
						className="block w-full px-5 py-3 text-sm font-medium text-center text-gray-900 transition-colors bg-white border border-gray-300 rounded-full hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
					>
						Try demo account
					</Link>
					<p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
						Development-only login. No real account required.
					</p>
				</div>
			)}
			<Link
				to="/forgot-password"
				className="text-sm underline cursor-pointer hover:text-black dark:hover:text-white"
			>
				Forgot your password?
			</Link>
		</div>
	);
};

export default Login;
