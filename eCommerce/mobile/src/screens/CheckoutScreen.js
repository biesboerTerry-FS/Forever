import React, { useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Linking,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import Button from "../components/Button";
import { useShop } from "../context/ShopContext";
import { api, API_URL } from "../api";
import { toastSuccess, toastError } from "../utils/toast";
import { useTheme, money, spacing } from "../theme";

const DELIVERY = 10;

const PAYMENT_METHODS = [
	{ key: "cod", label: "Cash on delivery", detail: "Pay in cash when your order arrives." },
	{ key: "stripe", label: "Stripe (card)", detail: "Secure card checkout in your browser." },
];

const FIELDS = [
	{ key: "firstName", label: "First name", placeholder: "Ava" },
	{ key: "lastName", label: "Last name", placeholder: "Thompson" },
	{ key: "email", label: "Email", placeholder: "you@example.com", keyboard: "email-address" },
	{ key: "street", label: "Street", placeholder: "123 Main Street" },
	{ key: "city", label: "City", placeholder: "New York" },
	{ key: "state", label: "State", placeholder: "NY" },
	{ key: "zipcode", label: "ZIP code", placeholder: "10001", keyboard: "number-pad" },
	{ key: "country", label: "Country", placeholder: "USA" },
	{ key: "phone", label: "Phone", placeholder: "555 000 0000", keyboard: "phone-pad" },
];

export default function CheckoutScreen({ navigation }) {
	const { colors } = useTheme();
	const { cartLines, subtotal, clearCart, token, user } = useShop();
	const [address, setAddress] = useState({
		firstName: user?.name?.split(" ")[0] || "",
		lastName: user?.name?.split(" ").slice(1).join(" ") || "",
		email: user?.email || "",
		street: "",
		city: "",
		state: "",
		zipcode: "",
		country: "USA",
		phone: "",
	});
	const [method, setMethod] = useState("cod");
	const [placing, setPlacing] = useState(false);

	const total = subtotal + (cartLines.length ? DELIVERY : 0);

	const validate = () => {
		const missing = FIELDS.find((field) => !String(address[field.key] || "").trim());
		if (missing) {
			Alert.alert("Missing details", `Please enter your ${missing.label.toLowerCase()}.`);
			return false;
		}
		if (cartLines.length === 0) {
			Alert.alert("Your bag is empty", "Add something before checking out.");
			return false;
		}
		return true;
	};

	const buildItems = () =>
		cartLines.map((line) => ({
			_id: line.itemId,
			name: line.name,
			price: line.price,
			quantity: line.quantity,
			size: line.size,
			image: line.product?.image || [],
		}));

	const placeCodOrder = async () => {
		const data = await api.post(
			"/api/order/place",
			{ items: buildItems(), amount: total, address },
			token
		);
		if (!data.success) throw new Error(data.message);
		clearCart();
		toastSuccess("Order placed", "Thanks! Your order is confirmed.");
		Alert.alert(
			"Order placed",
			"Thanks! Your order is confirmed and you can track it from My Orders.",
			[{ text: "Track order", onPress: () => navigation.navigate("Orders") }]
		);
	};

	const placeStripeOrder = async () => {
		// Reuse the existing Stripe Checkout Session endpoint. The session's
		// success/cancel URLs are web routes; opening in browser lets the user
		// complete payment and return to the web verification flow.
		const webOrigin =
			process.env.EXPO_PUBLIC_WEB_URL ||
			API_URL.replace(/:4001\b/, ":5178").replace(/\/api\/?$/, "");
		const data = await api.post(
			"/api/order/stripe",
			{ items: buildItems(), amount: total, address },
			token,
			{ origin: webOrigin }
		);
		if (!data.success || !data.session_url) {
			throw new Error(data.message || "Stripe is not available right now.");
		}
		const supported = await Linking.canOpenURL(data.session_url);
		if (!supported) throw new Error("Cannot open Stripe checkout on this device.");
		await Linking.openURL(data.session_url);
		Alert.alert(
			"Continue in browser",
			"Complete your card payment in the browser. Once finished, your order will appear in My Orders.",
			[{ text: "OK", onPress: () => navigation.navigate("Orders") }]
		);
	};

	const placeOrder = async () => {
		if (!validate()) return;
		try {
			setPlacing(true);
			if (method === "stripe") await placeStripeOrder();
			else await placeCodOrder();
		} catch (error) {
			toastError("Could not place order", error.message);
			Alert.alert("Could not place order", error.message);
		} finally {
			setPlacing(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, backgroundColor: colors.bg }}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView
				contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
				keyboardShouldPersistTaps="handled"
			>
				<Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 14 }}>
					Delivery details
				</Text>

				{FIELDS.map((field) => (
					<View key={field.key} style={{ marginBottom: 10 }}>
						<Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
							{field.label}
						</Text>
						<TextInput
							value={address[field.key]}
							onChangeText={(value) =>
								setAddress((prev) => ({ ...prev, [field.key]: value }))
							}
							placeholder={field.placeholder}
							placeholderTextColor={colors.muted}
							keyboardType={field.keyboard}
							autoCapitalize={field.keyboard === "email-address" ? "none" : "words"}
							accessibilityLabel={field.label}
							style={{
								borderWidth: 1,
								borderColor: colors.line,
								paddingHorizontal: 12,
								paddingVertical: 10,
								color: colors.ink,
							}}
						/>
					</View>
				))}

				<Text style={{ fontSize: 16, fontWeight: "600", marginTop: 18, marginBottom: 8 }}>
					Payment
				</Text>
				{PAYMENT_METHODS.map((option) => {
					const active = method === option.key;
					return (
						<Pressable
							key={option.key}
							onPress={() => setMethod(option.key)}
							accessibilityRole="radio"
							accessibilityState={{ selected: active }}
							accessibilityLabel={option.label}
							style={{
								borderWidth: 1,
								borderColor: active ? colors.accent : colors.line,
								padding: 12,
								borderRadius: 4,
								marginBottom: 8,
							}}
						>
							<Text style={{ fontWeight: "600", fontSize: 13 }}>{option.label}</Text>
							<Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
								{option.detail}
							</Text>
						</Pressable>
					);
				})}

				<View style={{ marginTop: 20 }}>
					<Row label="Subtotal" value={money(subtotal)} />
					<Row label="Delivery" value={money(cartLines.length ? DELIVERY : 0)} />
					<Row label="Total" value={money(total)} bold />
				</View>

				<Button
					title={placing ? "PLACING ORDER…" : method === "stripe" ? "CONTINUE TO PAYMENT" : "PLACE ORDER"}
					onPress={placeOrder}
					disabled={placing}
					style={{ marginTop: 18 }}
				/>
				{method === "stripe" ? (
					<Text style={{ color: colors.muted, fontSize: 11, marginTop: 8, lineHeight: 16 }}>
						Card payments open in a secure browser session. For fully in-app native
						payment sheets, integrate Stripe PaymentSheet with a PaymentIntent endpoint.
					</Text>
				) : null}
			</ScrollView>
		</KeyboardAvoidingView>
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
			<Text style={{ color: bold ? colors.ink : colors.muted, fontWeight: bold ? "700" : "400" }}>
				{label}
			</Text>
			<Text style={{ color: colors.ink, fontWeight: bold ? "700" : "500" }}>
				{value}
			</Text>
		</View>
	);
}
