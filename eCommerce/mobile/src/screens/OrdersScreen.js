import React, { useCallback, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	Pressable,
	Text,
	View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import Button from "../components/Button";
import { useShop } from "../context/ShopContext";
import { api } from "../api";
import { useTheme, money, spacing } from "../theme";

const STEPS = ["Order Placed", "Packing", "Shipped", "Out For Delivery", "Delivered"];

function Timeline({ status }) {
	const { colors } = useTheme();
	const current = Math.max(0, STEPS.indexOf(status));
	return (
		<View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 12 }}>
			{STEPS.map((step, index) => {
				const done = index <= current;
				return (
					<View
						key={step}
						style={{ flex: index === STEPS.length - 1 ? 0 : 1, alignItems: "center" }}
					>
						<View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
							<View
								style={{
									width: 18,
									height: 18,
									borderRadius: 9,
									backgroundColor: done ? colors.accent : colors.bg,
									borderWidth: 1,
									borderColor: done ? colors.accent : colors.line,
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								{done && <Ionicons name="checkmark" size={11} color={colors.onAccent} />}
							</View>
							{index !== STEPS.length - 1 && (
								<View
									style={{
										flex: 1,
										height: 2,
										backgroundColor:
											index < current ? colors.accent : colors.line,
									}}
								/>
							)}
						</View>
						<Text
							style={{
								fontSize: 8,
								marginTop: 4,
								textAlign: "center",
								color: done ? colors.ink : colors.muted,
							}}
						>
							{step}
						</Text>
					</View>
				);
			})}
		</View>
	);
}

export default function OrdersScreen({ navigation }) {
	const { colors } = useTheme();
	const { token } = useShop();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		if (!token) {
			setLoading(false);
			return;
		}
		try {
			setLoading(true);
			const data = await api.post("/api/order/userorders", {}, token);
			if (data.success) setOrders([...data.orders].reverse());
		} catch (error) {
			console.warn(error.message);
		} finally {
			setLoading(false);
		}
	}, [token]);

	useFocusEffect(
		useCallback(() => {
			load();
		}, [load])
	);

	if (!token) {
		return (
			<Screen>
				<View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
					<Ionicons name="receipt-outline" size={44} color={colors.line} />
					<Text style={{ fontSize: 16, fontWeight: "600", marginTop: 12 }}>
						Log in to see your orders
					</Text>
					<Text style={{ color: colors.muted, marginTop: 6, textAlign: "center" }}>
						Your order history and live delivery status appear here.
					</Text>
					<Button
						title="SIGN IN"
						onPress={() => navigation.navigate("Login")}
						style={{ marginTop: 18, paddingHorizontal: 28 }}
					/>
				</View>
			</Screen>
		);
	}

	return (
		<Screen>
			{loading ? (
				<ActivityIndicator style={{ marginTop: 40 }} />
			) : orders.length === 0 ? (
				<View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
					<Text style={{ fontSize: 16, fontWeight: "600" }}>No orders yet</Text>
					<Text style={{ color: colors.muted, marginTop: 6, textAlign: "center" }}>
						When you place an order you'll be able to track it here.
					</Text>
					<Button
						title="START SHOPPING"
						onPress={() => navigation.navigate("Shop")}
						style={{ marginTop: 18, paddingHorizontal: 24 }}
					/>
				</View>
			) : (
				<FlatList
					data={orders}
					keyExtractor={(order) => order._id}
					contentContainerStyle={{ padding: spacing.md }}
					renderItem={({ item: order }) => (
						<View
							style={{
								borderWidth: 1,
								borderColor: colors.line,
								marginBottom: 16,
							}}
						>
							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									padding: 12,
									backgroundColor: colors.soft,
								}}
							>
								<View>
									<Text style={{ fontWeight: "600", fontSize: 13 }}>
										Order #{order._id.slice(-8).toUpperCase()}
									</Text>
									<Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
										{new Date(order.date).toDateString()}
									</Text>
								</View>
								<View style={{ alignItems: "flex-end" }}>
									<Text style={{ fontWeight: "600" }}>{money(order.amount)}</Text>
									<Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
										{order.payment ? "Paid" : "Payment pending"}
									</Text>
								</View>
							</View>

							<View style={{ paddingHorizontal: 12 }}>
								<Timeline status={order.status} />
							</View>

							{order.items.map((item, index) => (
								<View
									key={`${item._id}-${index}`}
									style={{
										flexDirection: "row",
										gap: 10,
										padding: 12,
										borderTopWidth: 1,
										borderTopColor: colors.line,
									}}
								>
									{item.image?.[0] ? (
										<Image
											source={{ uri: item.image[0] }}
											style={{ width: 44, height: 56, borderRadius: 4 }}
										/>
									) : (
										<View
											style={{
												width: 44,
												height: 56,
												backgroundColor: colors.soft,
												borderRadius: 4,
											}}
										/>
									)}
									<View style={{ flex: 1 }}>
										<Text style={{ fontSize: 13, fontWeight: "500" }} numberOfLines={1}>
											{item.name}
										</Text>
										<Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
											Qty {item.quantity} · Size {item.size}
										</Text>
									</View>
									<Text style={{ fontSize: 13 }}>{money(item.price)}</Text>
								</View>
							))}

							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									alignItems: "center",
									padding: 12,
									borderTopWidth: 1,
									borderTopColor: colors.line,
								}}
							>
								<Text style={{ color: colors.muted, fontSize: 12 }}>
									Status:{" "}
									<Text style={{ color: colors.ink, fontWeight: "600" }}>
										{order.status}
									</Text>
								</Text>
								<Pressable
									onPress={load}
									style={{ padding: 4 }}
									accessibilityRole="button"
									accessibilityLabel="Refresh orders"
								>
									<Text style={{ fontSize: 12, textDecorationLine: "underline" }}>
										Refresh
									</Text>
								</Pressable>
							</View>
						</View>
					)}
				/>
			)}
		</Screen>
	);
}
