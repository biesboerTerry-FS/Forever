import React, { useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
} from "react-native";
import Button from "../components/Button";
import { api } from "../api";
import { colors, spacing } from "../theme";

export default function ForgotPasswordScreen({ navigation }) {
	const [email, setEmail] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [sent, setSent] = useState(false);

	const submit = async () => {
		if (!email.trim()) {
			Alert.alert("Missing email", "Enter the email address for your account.");
			return;
		}
		setSubmitting(true);
		try {
			const data = await api.post("/api/user/forgot-password", { email });
			if (data.success) {
				setSent(true);
				Alert.alert("Check your email", data.message);
			} else {
				Alert.alert("Could not send link", data.message);
			}
		} catch (error) {
			Alert.alert("Something went wrong", error.message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, backgroundColor: colors.bg }}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView
				contentContainerStyle={{ padding: spacing.lg, paddingTop: 40 }}
				keyboardShouldPersistTaps="handled"
			>
				<Text style={{ fontSize: 28, fontWeight: "600" }}>Reset password</Text>
				{sent ? (
					<>
						<Text style={{ color: colors.muted, marginTop: 12, lineHeight: 20 }}>
							If an account exists for{" "}
							<Text style={{ color: colors.ink, fontWeight: "600" }}>{email}</Text>, a
							reset link is on its way. The link expires in one hour.
						</Text>
						<Pressable
							onPress={() => setSent(false)}
							accessibilityRole="button"
							accessibilityLabel="Try again"
							style={{ marginTop: 16 }}
						>
							<Text style={{ textDecorationLine: "underline" }}>
								Use a different email
							</Text>
						</Pressable>
					</>
				) : (
					<>
						<Text style={{ color: colors.muted, marginTop: 8, marginBottom: 24 }}>
							Enter the email address for your account and we&apos;ll send you a link
							to choose a new password.
						</Text>
						<Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
							Email
						</Text>
						<TextInput
							value={email}
							onChangeText={setEmail}
							placeholder="Email"
							placeholderTextColor={colors.muted}
							autoCapitalize="none"
							keyboardType="email-address"
							accessibilityLabel="Email"
							style={{
								borderWidth: 1,
								borderColor: colors.line,
								paddingHorizontal: 12,
								paddingVertical: 11,
								marginBottom: 12,
								color: colors.ink,
							}}
						/>
						<Button
							title={submitting ? "SENDING…" : "SEND RESET LINK"}
							onPress={submit}
							disabled={submitting}
							style={{ marginTop: 6 }}
						/>
					</>
				)}
				<Pressable
					onPress={() => navigation.navigate("Login")}
					accessibilityRole="button"
					accessibilityLabel="Back to sign in"
					style={{ marginTop: 20, alignItems: "center" }}
				>
					<Text style={{ color: colors.muted, textDecorationLine: "underline" }}>
						Back to sign in
					</Text>
				</Pressable>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
