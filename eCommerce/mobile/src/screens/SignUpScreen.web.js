import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SignUp, useAuth } from "@clerk/react";
import { useShop } from "../context/ShopContext";
import { colors, spacing } from "../theme";

export default function SignUpScreen({ navigation }) {
	const { token } = useShop();
	const { isSignedIn } = useAuth();

	useEffect(() => {
		if (token) {
			if (navigation.canGoBack()) navigation.goBack();
			else navigation.navigate("Tabs", { screen: "Home" });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token]);

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
					Finishing registration…
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
				<SignUp
					signInUrl="/login"
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
