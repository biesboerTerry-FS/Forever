import { createContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/react";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
	const currency = "$";
	const delivery_fee = 10;
	const rawBackendUrl = (import.meta.env.VITE_BACKEND_URL || "").trim().replace(/\/$/, "");
	const backendUrl = rawBackendUrl
		? /^https?:\/\//i.test(rawBackendUrl)
			? rawBackendUrl
			: /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(rawBackendUrl)
				? `http://${rawBackendUrl}`
				: `https://${rawBackendUrl}`
		: "";
	const [search, setSearch] = useState("");
	const [showSearch, setShowSearch] = useState(false);
	const [cartItems, setCartItems] = useState({});
	const [products, setProducts] = useState([]);
	const [productsLoading, setProductsLoading] = useState(true);
	const [token, setToken] = useState("");
	const [wishlist, setWishlist] = useState([]);
	const [dark, setDark] = useState(() => {
		try {
			const stored = localStorage.getItem("theme");
			if (stored) return stored === "dark";
			return window.matchMedia("(prefers-color-scheme: dark)").matches;
		} catch {
			return false;
		}
	});
	const [user, setUser] = useState(() => {
		try {
			return JSON.parse(localStorage.getItem("user")) || null;
		} catch {
			return null;
		}
	});
	const navigate = useNavigate();
	const { isSignedIn, getToken } = useAuth();
	const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
	const syncingRef = useRef(false);

	// Sync Clerk session with the backend JWT used by cart/wishlist/orders.
	useEffect(() => {
		const sync = async () => {
			if (syncingRef.current) return;
			if (!clerkLoaded) return;

			if (!isSignedIn) {
				if (token) {
					localStorage.removeItem("token");
					localStorage.removeItem("user");
					setToken("");
					setUser(null);
					setCartItems({});
					setWishlist([]);
				}
				return;
			}

			// Already have a backend token — assume it belongs to the signed-in Clerk user.
			if (token) return;

			try {
				syncingRef.current = true;
				const clerkToken = await getToken();
				if (!clerkToken) return;
				const response = await axios.post(
					backendUrl + "/api/user/clerk",
					{ clerkToken }
				);
				if (response.data.success) {
					setToken(response.data.token);
					localStorage.setItem("token", response.data.token);
					if (response.data.user) {
						setUser(response.data.user);
						localStorage.setItem("user", JSON.stringify(response.data.user));
					}
				} else {
					toast.error(response.data.message || "Sign-in sync failed.");
				}
			} catch (error) {
				console.log(error);
				toast.error(error.message || "Sign-in sync failed.");
			} finally {
				syncingRef.current = false;
			}
		};

		sync();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSignedIn, clerkLoaded, clerkUser?.id, token, backendUrl]);

	const addToCart = async (itemId, size) => {
		if (!size) {
			toast.error("Product Size not selected");
			return;
		}

		let cartData = structuredClone(cartItems);

		if (cartData[itemId]) {
			if (cartData[itemId][size]) {
				cartData[itemId][size] += 1;
			} else {
				cartData[itemId][size] = 1;
			}
		} else {
			cartData[itemId] = {};
			cartData[itemId][size] = 1;
		}
		setCartItems(cartData);

		if (token) {
			try {
				await axios.post(
					backendUrl + "/api/cart/add",
					{ itemId, size },
					{ headers: { token } }
				);
			} catch (error) {
				console.log(error);
				toast.error(error.message);
			}
		} else {
			console.log();
		}
	};

	useEffect(() => {
		console.log(cartItems);
	}, [cartItems]);

	const getCartCount = () => {
		let totalCount = 0;
		for (const items in cartItems) {
			for (const item in cartItems[items]) {
				try {
					if (cartItems[items][item] > 0) {
						totalCount += cartItems[items][item];
					}
				} catch (error) {
					console.log(error);
				}
			}
		}
		return totalCount;
	};

	const updateQuantity = async (itemId, size, quantity) => {
		let cartData = structuredClone(cartItems);

		cartData[itemId][size] = quantity;

		setCartItems(cartData);
		if (token) {
			try {
				await axios.post(
					backendUrl + "/api/cart/update",
					{ itemId, size, quantity },
					{ headers: { token } }
				);
			} catch (error) {
				console.log(error);
				toast.error(error.message);
			}
		}
	};

	const getCartAmount = () => {
		let totalAmount = 0;
		for (const items in cartItems) {
			let itemInfo = products.find((product) => product._id === items);
			if (itemInfo) {
				for (const item in cartItems[items]) {
					try {
						if (cartItems[items][item] > 0) {
							totalAmount += itemInfo.price * cartItems[items][item];
						}
					} catch (error) {
						console.log(error);
					}
				}
			}
		}
		return totalAmount;
	};

	const getProductsData = async () => {
		setProductsLoading(true);
		try {
			const response = await axios.get(backendUrl + "/api/product/list");
			// console.log( response.data );
			if (response.data.success) {
				setProducts(response.data.products);
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		} finally {
			setProductsLoading(false);
		}
	};

	const getUserCart = async (token) => {
		try {
			const response = await axios.post(
				backendUrl + "/api/cart/get",
				{},
				{ headers: { token } }
			);
			if (response.data.success) {
				setCartItems(response.data.cartData);
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		}
	};

	const getWishlist = async (token) => {
		try {
			const response = await axios.post(
				backendUrl + "/api/wishlist/get",
				{},
				{ headers: { token } }
			);
			if (response.data.success) setWishlist(response.data.wishlist);
		} catch (error) {
			console.log(error);
		}
	};

	const isWishlisted = (itemId) => wishlist.includes(String(itemId));

	// Toggle a product in the signed-in user's wishlist.
	const toggleWishlist = async (itemId) => {
		if (!token) {
			toast.info("Log in to save items to your wishlist");
			navigate("/login");
			return;
		}
		const id = String(itemId);
		const wasSaved = wishlist.includes(id);
		// Optimistic update so the heart responds instantly.
		setWishlist((prev) =>
			wasSaved ? prev.filter((x) => x !== id) : [...prev, id]
		);
		try {
			const response = await axios.post(
				backendUrl + "/api/wishlist/toggle",
				{ productId: id },
				{ headers: { token } }
			);
			if (response.data.success) {
				setWishlist(response.data.wishlist);
				toast.success(response.data.message);
			}
		} catch (error) {
			console.log(error);
			setWishlist((prev) =>
				wasSaved ? [...prev, id] : prev.filter((x) => x !== id)
			);
			toast.error(error.message);
		}
	};

	useEffect(() => {
		document.documentElement.classList.toggle("dark", dark);
		document.documentElement.style.colorScheme = dark ? "dark" : "light";
		localStorage.setItem("theme", dark ? "dark" : "light");
	}, [dark]);

	const toggleTheme = () => setDark((value) => !value);

	useEffect(() => {
		getProductsData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!token && localStorage.getItem("token")) {
			setToken(localStorage.getItem("token"));
			return;
		}
		if (token) {
			getUserCart(token);
			getWishlist(token);
		} else {
			setWishlist([]);
		}
	}, [token]); // eslint-disable-line react-hooks/exhaustive-deps

	const value = {
		products,
		productsLoading,
		currency,
		delivery_fee,
		search,
		setSearch,
		showSearch,
		setShowSearch,
		cartItems,
		setCartItems,
		addToCart,
		getCartCount,
		updateQuantity,
		getCartAmount,
		navigate,
		backendUrl,
		token,
		setToken,
		user,
		setUser,
		wishlist,
		setWishlist,
		toggleWishlist,
		isWishlisted,
		dark,
		toggleTheme,
	};

	return (
		<ShopContext.Provider value={value}>
			{props.children}
		</ShopContext.Provider>
	);
};

export default ShopContextProvider;
