import React, { useEffect } from "react";
import { View } from "react-native";
import { SignIn, useAuth } from "@clerk/react";
import { useShop } from "../context/ShopContext";
import { colors, spacing } from "../theme";

export default function LoginScreen({ navigation }) {
	const { token } = useShop();
	const { isSignedIn } = useAuth();

	useEffect(() => {
		if (token || isSignedIn) {
			// Prefer going back if this screen was pushed from the tab stack;
			// otherwise fall back to the Home tab.
			if (navigation.canGoBack()) navigation.goBack();
			else navigation.navigate("Tabs", { screen: "Home" });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, isSignedIn]);

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: colors.bg,
				padding: spacing.lg,
				paddingTop: 40,
				alignItems: "center",
			}}
		>
			<View style={{ width: "100%", maxWidth: 400 }}>
				<SignIn
					signUpUrl="/signup"
					fallbackRedirectUrl="/"
					appearance={{
						variables: {
							colorPrimary: colors.ink,
						},
					}}
				/>
			</View>
		</View>
	);
}
