import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "../theme";

export default function Button({
	title,
	onPress,
	variant = "primary",
	disabled = false,
	style,
}) {
	const { colors } = useTheme();
	const primary = variant === "primary";
	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityState={{ disabled }}
			accessibilityLabel={title}
			hitSlop={8}
			style={[
				{
					backgroundColor: primary ? colors.accent : colors.bg,
					borderColor: colors.accent,
					borderWidth: primary ? 0 : 1,
					paddingVertical: 13,
					borderRadius: 4,
					alignItems: "center",
					opacity: disabled ? 0.45 : 1,
				},
				style,
			]}
		>
			<Text
				style={{
					color: primary ? colors.onAccent : colors.ink,
					fontWeight: "600",
					fontSize: 13,
					letterSpacing: 0.4,
				}}
			>
				{title}
			</Text>
		</Pressable>
	);
}
