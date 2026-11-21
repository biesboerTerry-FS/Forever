import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SignIn, useAuth } from "@clerk/react";
import { useShop } from "../context/ShopContext";
import { useTheme, spacing } from "../theme";

export default function LoginScreen({ navigation }) {
	const { colors } = useTheme();
	const { token } = useShop();
	const { isSignedIn } = useAuth();

	useEffect(() => {
		if (token) {
			// Backend session is ready — leave this screen.
			if (navigation.canGoBack()) navigation.goBack();
			else navigation.navigate("Tabs", { screen: "Home" });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token]);

	// Clerk session exists but the backend token is still being synced.
	if (isSignedIn && !token) {
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: colors.bg,
					alignItems: "center",
					justifyContent: "center",
					padding: spacing.lg,
				}}
			>
				<ActivityIndicator color={colors.ink} />
				<Text style={{ marginTop: 12, color: colors.muted }}>
					Signing you in…
				</Text>
			</View>
		);
	}

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
