import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme";

export default function Screen({ children, style }) {
	const { colors } = useTheme();
	return (
		<SafeAreaView
			edges={["top"]}
			style={[{ flex: 1, backgroundColor: colors.bg }, style]}
		>
			{children}
		</SafeAreaView>
	);
}
