import React, { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { ClerkProvider, tokenCache } from "@clerk/expo";
import { ShopProvider } from "./src/context/ShopContext";
import RootNavigator from "./src/navigation/RootNavigator";

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function App() {
	const navigationRef = useRef(null);

	useEffect(() => {
		const sub = Notifications.addNotificationResponseReceivedListener(
			(response) => {
				const data = response?.notification?.request?.content?.data || {};
				if (data.orderId && navigationRef.current?.isReady()) {
					navigationRef.current.navigate("Orders");
				}
			}
		);
		return () => sub.remove();
	}, []);

	return (
		<ClerkProvider
			tokenCache={tokenCache}
			publishableKey={clerkPublishableKey}
		>
			<SafeAreaProvider>
				<ShopProvider>
					<StatusBar style="dark" />
					<RootNavigator navigationRef={navigationRef} />
				</ShopProvider>
			</SafeAreaProvider>
		</ClerkProvider>
	);
}
