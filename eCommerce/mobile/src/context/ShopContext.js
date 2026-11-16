import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api";
import {
	registerForPushNotificationsAsync,
	unregisterForPushNotificationsAsync,
} from "../pushNotifications";

const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
	const [products, setProducts] = useState([]);
	const [productsLoading, setProductsLoading] = useState(true);
	const [cart, setCart] = useState({});
	const [wishlist, setWishlist] = useState([]);
	const [token, setToken] = useState("");
	const [user, setUser] = useState(null);
	const [booted, setBooted] = useState(false);

	useEffect(() => {
		const boot = async () => {
			try {
				const [storedToken, storedUser] = await Promise.all([
					AsyncStorage.getItem("token"),
					AsyncStorage.getItem("user"),
				]);
				if (storedToken) setToken(storedToken);
				if (storedUser) setUser(JSON.parse(storedUser));
			} catch (error) {
				console.warn("Could not restore session:", error.message);
			}

			try {
				const data = await api.get("/api/product/list");
				if (data.success) setProducts(data.products);
			} catch (error) {
				console.warn("Could not load products:", error.message);
			}
			setProductsLoading(false);
			setBooted(true);
		};
		boot();
	}, []);

	useEffect(() => {
		const loadUserData = async () => {
			if (!token) {
				setCart({});
				setWishlist([]);
				return;
			}
			try {
				const [cartData, wishData] = await Promise.all([
					api.post("/api/cart/get", {}, token),
					api.post("/api/wishlist/get", {}, token),
				]);
				if (cartData.success) setCart(cartData.cartData || {});
				if (wishData.success) setWishlist(wishData.wishlist || []);
			} catch (error) {
				console.warn("Could not load cart/wishlist:", error.message);
			}
			// Best-effort: register this device for order status push notifications.
			registerForPushNotificationsAsync(token);
		};
		if (booted) loadUserData();
	}, [token, booted]);

	const signIn = useCallback(async (data) => {
		setToken(data.token);
		await AsyncStorage.setItem("token", data.token);
		if (data.user) {
			setUser(data.user);
			await AsyncStorage.setItem("user", JSON.stringify(data.user));
		}
	}, []);

	const signOut = useCallback(async () => {
		const currentToken = token;
		// Best-effort: remove this device's push token before clearing session.
		if (currentToken) {
			await unregisterForPushNotificationsAsync(currentToken);
		}
		setToken("");
		setUser(null);
		setCart({});
		setWishlist([]);
		await AsyncStorage.multiRemove(["token", "user"]);
	}, [token]);

	const addToCart = useCallback(
		async (itemId, size) => {
			if (!token) throw new Error("Please log in to add items to your cart");
			if (!size) throw new Error("Please select a size first");
			const data = await api.post("/api/cart/add", { itemId, size }, token);
			if (!data.success) throw new Error(data.message || "Could not add to cart");
			const latest = await api.post("/api/cart/get", {}, token);
			if (latest.success) setCart(latest.cartData || {});
		},
		[token]
	);

	const setQuantity = useCallback(
		async (itemId, size, quantity) => {
			const data = await api.post(
				"/api/cart/update",
				{ itemId, size, quantity },
				token
			);
			if (!data.success) throw new Error(data.message || "Could not update cart");
			const latest = await api.post("/api/cart/get", {}, token);
			if (latest.success) setCart(latest.cartData || {});
		},
		[token]
	);

	const removeFromCart = useCallback(
		async (itemId, size) => {
			try {
				await api.post(
					"/api/cart/update",
					{ itemId, size, quantity: 0 },
					token
				);
			} catch (error) {
				console.warn(error.message);
			}
			setCart((prev) => {
				const next = { ...prev };
				if (next[itemId]) {
					const sizes = { ...next[itemId] };
					delete sizes[size];
					if (Object.keys(sizes).length === 0) delete next[itemId];
					else next[itemId] = sizes;
				}
				return next;
			});
		},
		[token]
	);

	const toggleWishlist = useCallback(
		async (productId) => {
			if (!token) throw new Error("Please log in to save items");
			const data = await api.post(
				"/api/wishlist/toggle",
				{ productId: String(productId) },
				token
			);
			if (data.success) setWishlist(data.wishlist || []);
			return data;
		},
		[token]
	);

	const isWishlisted = useCallback(
		(id) => wishlist.includes(String(id)),
		[wishlist]
	);

	const clearCart = useCallback(() => setCart({}), []);

	const cartLines = useMemo(() => {
		const lines = [];
		for (const [itemId, sizes] of Object.entries(cart || {})) {
			const product = products.find((p) => String(p._id) === String(itemId));
			for (const [size, quantity] of Object.entries(sizes || {})) {
				if (!quantity) continue;
				lines.push({
					itemId,
					size,
					quantity,
					product,
					name: product?.name || "Item",
					price: product?.price || 0,
					image: product?.image?.[0],
				});
			}
		}
		return lines;
	}, [cart, products]);

	const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
	const subtotal = cartLines.reduce(
		(sum, line) => sum + line.price * line.quantity,
		0
	);

	const value = {
		products,
		productsLoading,
		cart,
		cartLines,
		cartCount,
		subtotal,
		wishlist,
		token,
		user,
		setUser,
		signIn,
		signOut,
		addToCart,
		setQuantity,
		removeFromCart,
		clearCart,
		toggleWishlist,
		isWishlisted,
	};

	return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
	const context = useContext(ShopContext);
	if (!context) throw new Error("useShop must be used inside ShopProvider");
	return context;
};
