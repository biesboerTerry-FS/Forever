import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Screen from "../components/Screen";
import Button from "../components/Button";
import { useShop } from "../context/ShopContext";
import { api } from "../api";
import { toastSuccess, toastError } from "../utils/toast";
import { useTheme, spacing } from "../theme";

const PROFILE_KEY = "forever-mobile-profile";

const DEMO_CARDS = [
	{ brand: "Visa", last4: "4242", expiry: "08/28" },
	{ brand: "Mastercard", last4: "1881", expiry: "11/27" },
];

const Field = ({ label, value, onChange, testID, keyboardType }) => {
	const { colors } = useTheme();
	return (
		<View style={{ marginBottom: 14 }}>
			<Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>{label}</Text>
			<TextInput
				value={value}
				onChangeText={onChange}
				testID={testID}
				keyboardType={keyboardType}
				autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
				placeholderTextColor={colors.muted}
				style={{
					borderWidth: 1,
					borderColor: colors.line,
					backgroundColor: colors.bg,
					color: colors.ink,
					borderRadius: 8,
					paddingHorizontal: 12,
					paddingVertical: 11,
					fontSize: 14,
				}}
			/>
		</View>
	);
};

export default function EditProfileScreen() {
	const { colors } = useTheme();
	const { user, setUser, token } = useShop();
	const [form, setForm] = useState({
		name: user?.name || "",
		email: user?.email || "",
		phone: user?.phone || "",
		address: user?.address || "",
	});
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		let active = true;
		AsyncStorage.getItem(PROFILE_KEY)
			.then((raw) => {
				if (!active || !raw) return;
				const saved = JSON.parse(raw);
				setForm((current) => ({ ...current, ...saved }));
			})
			.catch(() => {});
		return () => {
			active = false;
		};
	}, []);

	const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

	const save = async () => {
		if (!form.name.trim()) {
			toastError("Name is required");
			return;
		}
		setSaving(true);
		const next = { ...form, name: form.name.trim(), email: form.email.trim() };
		try {
			await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
			setUser({ ...(user || {}), ...next });
			if (token) {
				try {
					await api.patch(
						"/api/user/profile",
						{ name: next.name, email: next.email, phone: next.phone },
						token
					);
				} catch {
					// local profile still saved
				}
			}
			toastSuccess("Profile saved", "Your details were updated.");
		} catch {
			toastError("Could not save", "Please try again.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<Screen>
			<ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}>
				<Text style={{ fontSize: 18, fontWeight: "600", color: colors.ink, marginBottom: 4 }}>
					Edit profile
				</Text>
				<Text style={{ fontSize: 12, color: colors.muted, marginBottom: 20 }}>
					Your details are saved on this device and synced when you are signed in.
				</Text>

				<View testID="edit-profile-form">
					<Field label="Full name" value={form.name} onChange={update("name")} testID="profile-name" />
					<Field
						label="Email"
						value={form.email}
						onChange={update("email")}
						testID="profile-email"
						keyboardType="email-address"
					/>
					<Field label="Phone" value={form.phone} onChange={update("phone")} testID="profile-phone" keyboardType="phone-pad" />
					<Field label="Address" value={form.address} onChange={update("address")} testID="profile-address" />
				</View>

				<Button
					title={saving ? "SAVING…" : "SAVE CHANGES"}
					onPress={save}
					disabled={saving}
					style={{ marginTop: 6 }}
				/>
				{saving ? <ActivityIndicator style={{ marginTop: 12 }} color={colors.ink} /> : null}

				<View style={{ marginTop: 32 }}>
					<Text style={{ fontSize: 16, fontWeight: "600", color: colors.ink, marginBottom: 4 }}>
						Payment methods
					</Text>
					<Text style={{ fontSize: 12, color: colors.muted, marginBottom: 12 }}>
						Demo cards in test mode. Masked metadata only — no card numbers are stored or charged.
					</Text>
					{DEMO_CARDS.map((card) => (
						<View
							key={card.last4}
							testID="demo-payment-method"
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
								padding: 14,
								borderRadius: 10,
								backgroundColor: colors.soft,
								marginBottom: 8,
							}}
						>
							<Text style={{ fontSize: 13, fontWeight: "600", color: colors.ink }}>
								{card.brand} •••• {card.last4}
							</Text>
							<Text style={{ fontSize: 11, color: colors.muted }}>Expires {card.expiry} · DEMO</Text>
						</View>
					))}
				</View>
			</ScrollView>
		</Screen>
	);
}
