import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { colors, money } from "../theme";

export default function ProductCard({ product, onPress, width }) {
	return (
		<Pressable
			onPress={onPress}
			style={{ width, marginBottom: 22 }}
			accessibilityRole="button"
			accessibilityLabel={`${product.name}, ${money(product.price)}`}
			hitSlop={4}
		>
			<View
				style={{
					backgroundColor: colors.soft,
					borderRadius: 10,
					overflow: "hidden",
				}}
			>
				{product.image?.[0] ? (
					<Image
						source={{ uri: product.image[0] }}
						style={{ width: "100%", aspectRatio: 3 / 4 }}
						resizeMode="cover"
						accessibilityLabel={product.name}
					/>
				) : (
					<View style={{ width: "100%", aspectRatio: 3 / 4 }} />
				)}
			</View>
			<Text
				numberOfLines={1}
				style={{ marginTop: 8, fontSize: 13, color: colors.ink }}
			>
				{product.name}
			</Text>
			<Text style={{ marginTop: 2, fontWeight: "700", color: colors.ink }}>
				{money(product.price)}
			</Text>
		</Pressable>
	);
}
