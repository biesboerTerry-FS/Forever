import React from "react";
import {
	FlatList,
	Pressable,
	Text,
	View,
	useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import ProductCard from "../components/ProductCard";
import Button from "../components/Button";
import { useShop } from "../context/ShopContext";
import { colors, spacing } from "../theme";

export default function WishlistScreen({ navigation }) {
	const { products, wishlist, toggleWishlist } = useShop();
	const { width } = useWindowDimensions();
	const cardWidth = (width - spacing.md * 2 - spacing.md) / 2;

	const items = products.filter((product) =>
		wishlist.includes(String(product._id))
	);

	return (
		<Screen>
			<View style={{ paddingHorizontal: spacing.md, paddingTop: 8, marginBottom: 8 }}>
				<Text style={{ fontSize: 20, fontWeight: "600" }}>My wishlist</Text>
				{items.length > 0 && (
					<Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
						{items.length} saved {items.length === 1 ? "item" : "items"}
					</Text>
				)}
			</View>

			{items.length === 0 ? (
				<View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
					<Ionicons name="heart-outline" size={44} color={colors.line} />
					<Text style={{ fontSize: 16, fontWeight: "600", marginTop: 12 }}>
						Your wishlist is empty
					</Text>
					<Text style={{ color: colors.muted, marginTop: 6, textAlign: "center" }}>
						Tap the heart on any product to save it here for later.
					</Text>
					<Button
						title="BROWSE THE COLLECTION"
						onPress={() => navigation.navigate("Shop")}
						style={{ marginTop: 18, paddingHorizontal: 20 }}
					/>
				</View>
			) : (
				<FlatList
					data={items}
					keyExtractor={(item) => item._id}
					numColumns={2}
					columnWrapperStyle={{ justifyContent: "space-between" }}
					contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 32 }}
					renderItem={({ item }) => (
						<View style={{ position: "relative" }}>
							<ProductCard
								product={item}
								width={cardWidth}
								onPress={() => navigation.navigate("Product", { id: item._id })}
							/>
							<Pressable
								onPress={() => toggleWishlist(item._id)}
								accessibilityRole="button"
								accessibilityLabel={`Remove ${item.name} from wishlist`}
								style={{
									position: "absolute",
									right: 8,
									top: 8,
									width: 30,
									height: 30,
									borderRadius: 15,
									backgroundColor: "#fff",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Ionicons name="heart" size={16} color={colors.danger} />
							</Pressable>
						</View>
					)}
				/>
			)}
		</Screen>
	);
}
