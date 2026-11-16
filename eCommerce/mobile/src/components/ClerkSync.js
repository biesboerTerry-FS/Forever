import { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/expo";
import { useShop } from "../context/ShopContext";
import { api } from "../api";

export default function ClerkSync() {
	const { token, signIn, signOut } = useShop();
	const { isSignedIn, getToken } = useAuth();
	const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
	const syncingRef = useRef(false);

	useEffect(() => {
		const sync = async () => {
			if (syncingRef.current) return;
			if (!clerkLoaded) return;

			if (!isSignedIn) {
				if (token) await signOut();
				return;
			}

			if (token) return;

			try {
				syncingRef.current = true;
				const clerkToken = await getToken();
				console.log("[ClerkSync] token available:", !!clerkToken);
				if (!clerkToken) return;
				const data = await api.post("/api/user/clerk", { clerkToken });
				console.log("[ClerkSync] backend response:", data.success, data.message);
				if (data.success) {
					await signIn(data);
				} else {
					console.warn("[ClerkSync] failed:", data.message);
				}
			} catch (error) {
				console.warn("[ClerkSync] error:", error.message);
			} finally {
				syncingRef.current = false;
			}
		};

		sync();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSignedIn, clerkLoaded, clerkUser?.id, token]);

	return null;
}
