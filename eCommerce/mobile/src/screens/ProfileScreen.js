import React from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import Screen from "../components/Screen";
import Button from "../components/Button";
import { useShop } from "../context/ShopContext";
import { API_URL } from "../api";
import { toastSuccess } from "../utils/toast";
import { colors, spacing } from "../theme";

function LinkRow({ icon, label, onPress }) {
	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={label}
			style={{
				flexDirection: "row",
				alignItems: "center",
				paddingVertical: 15,
				borderBottomWidth: 1,
				borderBottomColor: colors.line,
			}}
		>
			<Ionicons name={icon} size={19} color={colors.ink} />
			<Text style={{ flex: 1, marginLeft: 12, fontSize: 14 }}>{label}</Text>
			<Ionicons name="chevron-forward" size={16} color={colors.muted} />
		</Pressable>
	);
}

export default function ProfileScreen({ navigation }) {
	const { user, token, wishlist, signOut: backendSignOut } = useShop();
	const { isSignedIn, signOut } = useAuth();

	const confirmLogout = () => {
		Alert.alert("Log out", "Are you sure you want to log out?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Log out",
				style: "destructive",
				onPress: async () => {
					await backendSignOut();
					if (isSignedIn) await signOut();
					toastSuccess("Logged out", "You have been signed out.");
					navigation.navigate("Home");
				},
			},
		]);
	};

	return (
		<Screen>
			<ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						marginBottom: 16,
					}}
				>
					<Text style={{ fontSize: 20, fontWeight: "600" }}>My account</Text>
					{token ? (
						<Pressable
							onPress={confirmLogout}
							accessibilityRole="button"
							accessibilityLabel="Log out"
							hitSlop={8}
							style={({ pressed }) => ({
								padding: 6,
								opacity: pressed ? 0.6 : 1,
							})}
						>
							<Ionicons name="log-out-outline" size={24} color={colors.ink} />
						</Pressable>
					) : null}
				</View>

				{token && user ? (
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							padding: 16,
							borderRadius: 10,
							backgroundColor: colors.soft,
							marginBottom: 12,
						}}
					>
						<View
							style={{
								width: 46,
								height: 46,
								borderRadius: 23,
								backgroundColor: colors.accent,
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
								{user.name?.[0]?.toUpperCase() || "U"}
							</Text>
						</View>
						<View style={{ marginLeft: 12, flex: 1 }}>
							<Text style={{ fontWeight: "600", fontSize: 15 }}>{user.name}</Text>
							<Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
								{user.email}
							</Text>
						</View>
						<View
							style={{
								paddingHorizontal: 8,
								paddingVertical: 3,
								borderRadius: 10,
								backgroundColor: colors.bg,
							}}
						>
							<Text style={{ fontSize: 10, color: colors.muted }}>
								{user.provider === "local" ? "EMAIL" : "GOOGLE"}
							</Text>
						</View>
					</View>
				) : (
					<View style={{ marginBottom: 12 }}>
						<Text style={{ color: colors.muted, marginBottom: 12 }}>
							Sign in to sync your bag, wishlist and orders across devices.
						</Text>
						<Button
							title="SIGN IN / CREATE ACCOUNT"
							onPress={() => navigation.navigate("Login")}
						/>
					</View>
				)}

				<View style={{ marginTop: 8 }}>
					<LinkRow
						icon="receipt-outline"
						label="My orders"
						onPress={() => navigation.navigate("Orders")}
					/>
					<LinkRow
						icon="heart-outline"
						label={`Wishlist${wishlist.length ? ` (${wishlist.length})` : ""}`}
						onPress={() => navigation.navigate("Wishlist")}
					/>
					<LinkRow
						icon="bag-outline"
						label="My bag"
						onPress={() => navigation.navigate("Cart")}
					/>
					<LinkRow
						icon="storefront-outline"
						label="Continue shopping"
						onPress={() => navigation.navigate("Shop")}
					/>
				</View>

				{token ? (
					<Button
						title="LOG OUT"
						onPress={confirmLogout}
						variant="secondary"
						style={{ marginTop: 24 }}
					/>
				) : null}

				<Text
					style={{
						color: colors.muted,
						fontSize: 10,
						marginTop: 28,
						textAlign: "center",
						lineHeight: 15,
					}}
				>
					Forever mobile · Expo + React Native{"\n"}
					API: {API_URL}
				</Text>
			</ScrollView>
		</Screen>
	);
}
