import React, { useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import Button from "../components/Button";
import { api } from "../api";
import { colors, spacing } from "../theme";

export default function ResetPasswordScreen({ navigation, route }) {
	const initialToken = route?.params?.token || "";
	const [token, setToken] = useState(initialToken);
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const submit = async () => {
		if (!token.trim()) {
			Alert.alert("Missing reset token", "Open the reset link from your email or paste the token here.");
			return;
		}
		if (password.length < 8) {
			Alert.alert("Password too short", "Password must contain at least 8 characters.");
			return;
		}
		if (password !== confirm) {
			Alert.alert("Passwords do not match", "Please enter the same password twice.");
			return;
		}
		setSubmitting(true);
		try {
			const data = await api.post("/api/user/reset-password", { token, password });
			if (data.success) {
				Alert.alert("Password updated", data.message, [
					{ text: "Sign in", onPress: () => navigation.navigate("Login") },
				]);
			} else {
				Alert.alert("Could not reset password", data.message);
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
				<Text style={{ fontSize: 28, fontWeight: "600" }}>New password</Text>
				<Text style={{ color: colors.muted, marginTop: 8, marginBottom: 24 }}>
					Choose a new password for your account. Reset links expire after one hour.
				</Text>

				<Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
					Reset token
				</Text>
				<TextInput
					value={token}
					onChangeText={setToken}
					placeholder="Paste token from your reset link"
					placeholderTextColor={colors.muted}
					autoCapitalize="none"
					accessibilityLabel="Reset token"
					style={inputStyle}
				/>

				<Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
					New password
				</Text>
				<TextInput
					value={password}
					onChangeText={setPassword}
					placeholder="New password"
					placeholderTextColor={colors.muted}
					secureTextEntry
					accessibilityLabel="New password"
					style={inputStyle}
				/>

				<Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
					Confirm new password
				</Text>
				<TextInput
					value={confirm}
					onChangeText={setConfirm}
					placeholder="Confirm new password"
					placeholderTextColor={colors.muted}
					secureTextEntry
					accessibilityLabel="Confirm new password"
					style={inputStyle}
				/>

				<Button
					title={submitting ? "UPDATING…" : "UPDATE PASSWORD"}
					onPress={submit}
					disabled={submitting}
					style={{ marginTop: 6 }}
				/>
				<View style={{ height: 20 }} />
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const inputStyle = {
	borderWidth: 1,
	borderColor: colors.line,
	paddingHorizontal: 12,
	paddingVertical: 11,
	marginBottom: 12,
	color: colors.ink,
};
