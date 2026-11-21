import React, { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { ClerkProvider } from "@clerk/react";
import Toast from "react-native-toast-message";
import { ShopProvider } from "./src/context/ShopContext";
import { ThemeProvider, useTheme } from "./src/theme";
import RootNavigator from "./src/navigation/RootNavigator";
import ClerkSync from "./src/components/ClerkSync";

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function ThemedStatusBar() {
	const { dark } = useTheme();
	return <StatusBar style={dark ? "light" : "dark"} />;
}

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
		<ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/">
			<SafeAreaProvider>
				<ThemeProvider>
					<ShopProvider>
						<ThemedStatusBar />
						<ClerkSync />
						<RootNavigator navigationRef={navigationRef} />
						<Toast />
					</ShopProvider>
				</ThemeProvider>
			</SafeAreaProvider>
		</ClerkProvider>
	);
}
