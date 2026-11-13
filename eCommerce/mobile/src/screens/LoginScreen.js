import React, { useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import Button from "../components/Button";
import { useShop } from "../context/ShopContext";
import { api } from "../api";
import { colors, spacing } from "../theme";

export default function LoginScreen({ navigation }) {
	const { signIn } = useShop();
	const [mode, setMode] = useState("login");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [busy, setBusy] = useState(false);

	const submit = async () => {
		if (!email.trim() || !password.trim()) {
			Alert.alert("Missing details", "Enter your email and password.");
			return;
		}
		if (mode === "register" && !name.trim()) {
			Alert.alert("Missing details", "Enter your full name.");
			return;
		}
		try {
			setBusy(true);
			const data = await api.post(
				mode === "register" ? "/api/user/register" : "/api/user/login",
				mode === "register" ? { name, email, password } : { email, password }
			);
			if (!data.success) throw new Error(data.message);
			await signIn(data);
			navigation.goBack();
		} catch (error) {
			Alert.alert("Sign in failed", error.message);
		} finally {
			setBusy(false);
		}
	};

	const demoOAuth = async () => {
		try {
			setBusy(true);
			const data = await api.post("/api/user/oauth/demo", {});
			if (!data.success) throw new Error(data.message);
			await signIn(data);
			navigation.goBack();
		} catch (error) {
			Alert.alert("Social sign-in failed", error.message);
		} finally {
			setBusy(false);
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
				<Text style={{ fontSize: 28, fontWeight: "600" }}>
					{mode === "login" ? "Login" : "Sign Up"}
				</Text>
				<Text style={{ color: colors.muted, marginTop: 6, marginBottom: 24 }}>
					{mode === "login"
						? "Welcome back to Forever."
						: "Create an account to shop and track orders."}
				</Text>

				{mode === "register" && (
					<>
						<Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
							Full name
						</Text>
						<TextInput
							value={name}
							onChangeText={setName}
							placeholder="Full Name"
							placeholderTextColor={colors.muted}
							accessibilityLabel="Full name"
							style={inputStyle}
						/>
					</>
				)}

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
					style={inputStyle}
				/>

				<Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
					Password
				</Text>
				<TextInput
					value={password}
					onChangeText={setPassword}
					placeholder="Password"
					placeholderTextColor={colors.muted}
					secureTextEntry
					accessibilityLabel="Password"
					style={inputStyle}
				/>

				{mode === "login" && (
					<Pressable
						onPress={() => navigation.navigate("ForgotPassword")}
						accessibilityRole="button"
						accessibilityLabel="Forgot your password"
						style={{ alignSelf: "flex-start", marginBottom: 4, marginTop: -4 }}
					>
						<Text
							style={{
								color: colors.muted,
								fontSize: 12,
								textDecorationLine: "underline",
							}}
						>
							Forgot your password?
						</Text>
					</Pressable>
				)}

				<Button
					title={busy ? "PLEASE WAIT…" : mode === "login" ? "SIGN IN" : "SIGN UP"}
					onPress={submit}
					disabled={busy}
					style={{ marginTop: 18 }}
				/>

				<Pressable
					onPress={() => setMode(mode === "login" ? "register" : "login")}
					accessibilityRole="button"
					accessibilityLabel={
						mode === "login"
							? "Create account"
							: "Already have an account? Log in"
					}
					style={{ marginTop: 14, alignItems: "center" }}
				>
					<Text style={{ color: colors.muted, fontSize: 13 }}>
						{mode === "login" ? (
							<>
								New here? <Text style={{ color: colors.ink }}>Create Account</Text>
							</>
						) : (
							<>
								Already have an account? <Text style={{ color: colors.ink }}>Login</Text>
							</>
						)}
					</Text>
				</Pressable>

				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						marginVertical: 24,
						gap: 12,
					}}
				>
					<View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
					<Text style={{ color: colors.muted, fontSize: 11 }}>OR</Text>
					<View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
				</View>

				<Button
					title="CONTINUE WITH GOOGLE (DEMO)"
					onPress={demoOAuth}
					variant="secondary"
					disabled={busy}
				/>
				<Text
					style={{
						color: colors.muted,
						fontSize: 11,
						marginTop: 8,
						textAlign: "center",
						lineHeight: 16,
					}}
				>
					This preview uses a shared demo Google account. The web storefront
					and API support real Google OAuth when a client ID is configured.
				</Text>

				<Text style={{ color: colors.muted, fontSize: 11, marginTop: 24, textAlign: "center" }}>
					Demo shopper: demo@forever.test / demo1234
				</Text>
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
