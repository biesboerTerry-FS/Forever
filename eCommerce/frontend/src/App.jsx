import React, { useContext, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import DemoLogin from "./pages/DemoLogin";
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeePortal from "./pages/EmployeePortal";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import ErrorBoundary from "./components/ErrorBoundary";
import CookieConsent, { getCookieConsent } from "./components/CookieConsent";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Verify from "./pages/Verify";
import Delivery from "./pages/Delivery";
import Returns from "./pages/Returns";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Wishlist from "./pages/Wishlist";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ShopContext } from "./context/ShopContext";

const App = () => {
	const { dark } = useContext(ShopContext);
	const [consent, setConsent] = useState(getCookieConsent);

	useEffect(() => {
		const onOffline = () => toast.error("You appear to be offline. Some actions may not work.");
		const onOnline = () => toast.success("Back online.");
		window.addEventListener("offline", onOffline);
		window.addEventListener("online", onOnline);
		return () => {
			window.removeEventListener("offline", onOffline);
			window.removeEventListener("online", onOnline);
		};
	}, []);

	useEffect(() => {
		const sync = () => setConsent(getCookieConsent());
		window.addEventListener("cookie-consent-changed", sync);
		window.addEventListener("storage", sync);
		return () => {
			window.removeEventListener("cookie-consent-changed", sync);
			window.removeEventListener("storage", sync);
		};
	}, []);

	return (
		<div className="min-h-screen px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 transition-colors">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black"
			>
				Skip to content
			</a>
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				closeOnClick
				pauseOnHover
				draggable={false}
				theme={dark ? "dark" : "light"}
				toastClassName="!bg-white !text-gray-900 !border !border-gray-200 !rounded-none !shadow-sm dark:!bg-gray-900 dark:!text-gray-100 dark:!border-gray-700"
				bodyClassName="!text-sm !font-medium"
				progressClassName="!bg-gray-900 dark:!bg-gray-100"
				closeButton={false}
			/>
			<NavBar />
			<SearchBar />
			<main id="main-content">
				<ErrorBoundary>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/collection" element={<Collection />} />
						<Route path="/about" element={<About />} />
						<Route path="/contact" element={<Contact />} />
						<Route path="/product/:productId" element={<Product />} />
						<Route path="/cart" element={<Cart />} />
						<Route path="/login" element={<Login />} />
						<Route path="/demo-login" element={<DemoLogin />} />
						<Route path="/employee-login" element={<EmployeeLogin />} />
						<Route path="/employee" element={<EmployeePortal />} />
						<Route path="/forgot-password" element={<ForgotPassword />} />
						<Route path="/reset-password" element={<ResetPassword />} />
						<Route path="/place-order" element={<PlaceOrder />} />
						<Route path="/orders" element={<Orders />} />
						<Route path="/verify" element={<Verify />} />
						<Route path="/delivery" element={<Delivery />} />
						<Route path="/returns" element={<Returns />} />
						<Route path="/privacy" element={<Privacy />} />
						<Route path="/terms" element={<Terms />} />
						<Route path="/wishlist" element={<Wishlist />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</ErrorBoundary>
			</main>
			<Footer />
			<CookieConsent />
			{consent.analytics ? <Analytics /> : null}
		</div>
	);
};

export default App;
