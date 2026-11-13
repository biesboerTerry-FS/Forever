import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme";

export default function Screen({ children, style }) {
	return (
		<SafeAreaView
			edges={["top"]}
			style={[{ flex: 1, backgroundColor: colors.bg }, style]}
		>
			{children}
		</SafeAreaView>
	);
}
