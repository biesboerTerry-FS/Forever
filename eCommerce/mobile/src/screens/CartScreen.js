import React from "react";
import {
	Alert,
	FlatList,
	Image,
	Pressable,
	Text,
	View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import Button from "../components/Button";
import { useShop } from "../context/ShopContext";
import { toastSuccess, toastError } from "../utils/toast";
import { useTheme, money, spacing } from "../theme";

const DELIVERY = 10;

export default function CartScreen({ navigation }) {
	const { colors } = useTheme();
	const {
		cartLines,
		cartCount,
		subtotal,
		setQuantity,
		removeFromCart,
		token,
	} = useShop();

	const onCheckout = () => {
		if (!token) {
			Alert.alert("Sign in required", "Please log in to check out.", [
				{ text: "Cancel", style: "cancel" },
				{ text: "Log in", onPress: () => navigation.navigate("Login") },
			]);
			return;
		}
		navigation.navigate("Checkout");
	};

	const total = cartLines.length > 0 ? subtotal + DELIVERY : 0;

	return (
		<Screen>
			<View style={{ flex: 1 }}>
				<View style={{ paddingHorizontal: spacing.md, paddingTop: 8 }}>
					<Text style={{ fontSize: 20, fontWeight: "600" }} accessibilityRole="header">
						Your bag ({cartCount})
					</Text>
				</View>

				{cartLines.length === 0 ? (
					<View
						style={{
							flex: 1,
							alignItems: "center",
							justifyContent: "center",
							padding: spacing.lg,
						}}
					>
						<Ionicons name="bag-outline" size={44} color={colors.line} />
						<Text style={{ fontSize: 16, fontWeight: "600", marginTop: 12 }}>
							Your bag is empty
						</Text>
						<Text style={{ color: colors.muted, marginTop: 6, textAlign: "center" }}>
							Browse the collection and add something you love.
						</Text>
						<Button
							title="SHOP THE COLLECTION"
							onPress={() => navigation.navigate("Shop")}
							style={{ marginTop: 20, paddingHorizontal: 24 }}
						/>
					</View>
				) : (
					<>
						<FlatList
							data={cartLines}
							keyExtractor={(line) => `${line.itemId}-${line.size}`}
							contentContainerStyle={{ padding: spacing.md }}
							renderItem={({ item }) => (
								<View
									style={{
										flexDirection: "row",
										gap: 12,
										paddingVertical: 12,
										borderBottomWidth: 1,
										borderBottomColor: colors.line,
									}}
								>
									{item.image ? (
										<Image
											source={{ uri: item.image }}
											style={{ width: 74, height: 92, borderRadius: 6 }}
										/>
									) : (
										<View
											style={{
												width: 74,
												height: 92,
												backgroundColor: colors.soft,
												borderRadius: 6,
											}}
										/>
									)}
									<View style={{ flex: 1 }}>
										<View
											style={{
												flexDirection: "row",
												justifyContent: "space-between",
											}}
										>
											<Text
												numberOfLines={2}
												style={{ fontWeight: "600", flex: 1, marginRight: 8 }}
											>
												{item.name}
											</Text>
											<Pressable
												onPress={async () => {
													try {
														await removeFromCart(item.itemId, item.size);
														toastSuccess("Removed", `${item.name} removed from your bag.`);
													} catch (error) {
														toastError("Error", error.message);
													}
												}}
												accessibilityRole="button"
												accessibilityLabel={`Remove ${item.name}`}
											>
												<Ionicons name="trash-outline" size={18} color={colors.muted} />
											</Pressable>
										</View>
										<Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
											Size: {item.size}
										</Text>
										<View
											style={{
												flexDirection: "row",
												alignItems: "center",
												justifyContent: "space-between",
												marginTop: 12,
											}}
										>
											<View
												style={{
													flexDirection: "row",
													alignItems: "center",
													borderWidth: 1,
													borderColor: colors.line,
												}}
											>
												<Pressable
													onPress={() =>
														setQuantity(item.itemId, item.size, item.quantity - 1)
													}
													style={{ paddingHorizontal: 12, paddingVertical: 5 }}
													accessibilityLabel="Decrease quantity"
												>
													<Text>−</Text>
												</Pressable>
												<Text style={{ minWidth: 24, textAlign: "center" }}>
													{item.quantity}
												</Text>
												<Pressable
													onPress={() =>
														setQuantity(item.itemId, item.size, item.quantity + 1)
													}
													style={{ paddingHorizontal: 12, paddingVertical: 5 }}
													accessibilityLabel="Increase quantity"
												>
													<Text>+</Text>
												</Pressable>
											</View>
											<Text style={{ fontWeight: "700" }}>
												{money(item.price * item.quantity)}
											</Text>
										</View>
									</View>
								</View>
							)}
						/>

						{/* Summary */}
						<View
							style={{
								borderTopWidth: 1,
								borderTopColor: colors.line,
								padding: spacing.md,
							}}
						>
							<Row label="Subtotal" value={money(subtotal)} />
							<Row label="Delivery" value={money(DELIVERY)} />
							<Row label="Total" value={money(total)} bold />
							<Button
								title={token ? "PROCEED TO CHECKOUT" : "LOG IN TO CHECK OUT"}
								onPress={onCheckout}
								style={{ marginTop: 12 }}
							/>
						</View>
					</>
				)}
			</View>
		</Screen>
	);
}

function Row({ label, value, bold }) {
	const { colors } = useTheme();
	return (
		<View
			style={{
				flexDirection: "row",
				justifyContent: "space-between",
				paddingVertical: 4,
			}}
		>
			<Text
				style={{
					color: bold ? colors.ink : colors.muted,
					fontWeight: bold ? "700" : "400",
					fontSize: bold ? 16 : 13,
				}}
			>
				{label}
			</Text>
			<Text
				style={{
					color: colors.ink,
					fontWeight: bold ? "700" : "500",
					fontSize: bold ? 16 : 13,
				}}
			>
				{value}
			</Text>
		</View>
	);
}
