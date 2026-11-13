import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StarRating({ value = 0, size = 14 }) {
	return (
		<View
			style={{ flexDirection: "row", alignItems: "center" }}
			accessibilityLabel={`Rated ${value.toFixed(1)} out of 5 stars`}
			importantForAccessibility="yes"
		>
			<View
				style={{ flexDirection: "row", alignItems: "center" }}
				importantForAccessibility="no-hide-descendants"
			>
				{[1, 2, 3, 4, 5].map((star) => (
					<Ionicons
						key={star}
						name={star <= Math.round(value) ? "star" : "star-outline"}
						size={size}
						color="#f59e0b"
						style={{ marginRight: 1 }}
						accessibilityElementsHidden
					/>
				))}
			</View>
		</View>
	);
}
