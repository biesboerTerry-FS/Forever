import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, money } from "../theme";

export default function ProductCard({ product, onPress, width, variant = "grid" }) {
	const { colors } = useTheme();
	const image = product.image?.[0];
	const label = `${product.name}, ${money(product.price)}`;

	if (variant === "row") {
		return (
			<Pressable
				onPress={onPress}
				accessibilityRole="button"
				accessibilityLabel={label}
				testID="product-row"
				hitSlop={4}
				style={({ pressed }) => ({
					flexDirection: "row",
					alignItems: "center",
					gap: 12,
					paddingVertical: 10,
					borderBottomWidth: 1,
					borderBottomColor: colors.line,
					opacity: pressed ? 0.7 : 1,
				})}
			>
				<View
					style={{
						width: 64,
						height: 80,
						borderRadius: 8,
						overflow: "hidden",
						backgroundColor: colors.soft,
					}}
				>
					{image ? (
						<Image
							source={{ uri: image }}
							style={{ width: "100%", height: "100%" }}
							resizeMode="cover"
							accessibilityLabel={product.name}
						/>
					) : null}
				</View>
				<View style={{ flex: 1, minWidth: 0 }}>
					<Text numberOfLines={2} style={{ fontSize: 14, fontWeight: "600", color: colors.ink }}>
						{product.name}
					</Text>
					<Text numberOfLines={1} style={{ fontSize: 12, color: colors.muted, marginTop: 3 }}>
						{[product.subCategory, product.category].filter(Boolean).join(" · ") || "Forever"}
					</Text>
					<Text style={{ fontSize: 13, fontWeight: "700", color: colors.ink, marginTop: 5 }}>
						{money(product.price)}
					</Text>
				</View>
				<Ionicons name="chevron-forward" size={18} color={colors.muted} />
			</Pressable>
		);
	}

	return (
		<Pressable
			onPress={onPress}
			style={{ width, marginBottom: 22 }}
			accessibilityRole="button"
			accessibilityLabel={label}
			testID="product-card"
			hitSlop={4}
		>
			<View
				style={{
					backgroundColor: colors.soft,
					borderRadius: 10,
					overflow: "hidden",
				}}
			>
				{image ? (
					<Image
						source={{ uri: image }}
						style={{ width: "100%", aspectRatio: 3 / 4 }}
						resizeMode="cover"
						accessibilityLabel={product.name}
					/>
				) : (
					<View style={{ width: "100%", aspectRatio: 3 / 4 }} />
				)}
			</View>
			<Text numberOfLines={1} style={{ marginTop: 8, fontSize: 13, color: colors.ink }}>
				{product.name}
			</Text>
			<Text style={{ marginTop: 2, fontWeight: "700", color: colors.ink }}>
				{money(product.price)}
			</Text>
		</Pressable>
	);
}
