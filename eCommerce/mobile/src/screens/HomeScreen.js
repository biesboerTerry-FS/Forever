import React from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	Text,
	View,
	useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import ProductCard from "../components/ProductCard";
import { useShop } from "../context/ShopContext";
import { colors, spacing } from "../theme";

export default function HomeScreen({ navigation }) {
	const { products, productsLoading, cartCount, user } = useShop();
	const { width } = useWindowDimensions();
	const cardWidth = (width - spacing.md * 2 - spacing.md) / 2;

	const featured = products.slice(0, 12);

	return (
		<Screen>
			<FlatList
				data={featured}
				keyExtractor={(item) => item._id}
				numColumns={2}
				columnWrapperStyle={{ justifyContent: "space-between" }}
				contentContainerStyle={{ padding: spacing.md, paddingBottom: 32 }}
				renderItem={({ item }) => (
					<ProductCard
						product={item}
						width={cardWidth}
						onPress={() => navigation.navigate("Product", { id: item._id })}
					/>
				)}
				ListHeaderComponent={
					<View>
						{/* Top bar */}
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
								marginBottom: spacing.lg,
							}}
						>
							<View>
								<Text style={{ fontSize: 24, fontWeight: "700", letterSpacing: 3 }}>
									FOREVER
								</Text>
								<Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
									{user ? `Welcome back, ${user.name.split(" ")[0]}` : "Timeless essentials"}
								</Text>
							</View>
							<Pressable
								onPress={() => navigation.navigate("Cart")}
								style={{ padding: 6 }}
								accessibilityRole="button"
								accessibilityLabel={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
							>
								<Ionicons name="bag-outline" size={24} color={colors.ink} />
								{cartCount > 0 && (
									<View
										style={{
											position: "absolute",
											right: -2,
											top: -2,
											backgroundColor: colors.accent,
											borderRadius: 9,
											minWidth: 18,
											height: 18,
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Text style={{ color: "#fff", fontSize: 10 }}>{cartCount}</Text>
									</View>
								)}
							</Pressable>
						</View>

						{/* Hero */}
						<View
							style={{
								backgroundColor: colors.soft,
								borderRadius: 14,
								padding: 24,
								marginBottom: spacing.lg,
							}}
						>
							<Text style={{ fontSize: 11, letterSpacing: 2, color: colors.muted }}>
								NEW SEASON
							</Text>
							<Text
								style={{
									fontSize: 28,
									fontWeight: "700",
									color: colors.ink,
									marginTop: 8,
									lineHeight: 34,
								}}
							>
								Wardrobe staples,{"\n"}made to last.
							</Text>
							<Text style={{ color: colors.muted, fontSize: 13, marginTop: 10 }}>
								Thoughtfully made clothing for women, men and kids.
							</Text>
							<Pressable
								onPress={() => navigation.navigate("Shop")}
								style={{
									backgroundColor: colors.accent,
									alignSelf: "flex-start",
									paddingHorizontal: 18,
									paddingVertical: 11,
									borderRadius: 3,
									marginTop: 16,
								}}
								accessibilityRole="button"
								accessibilityLabel="Shop the collection"
							>
								<Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
									SHOP THE COLLECTION
								</Text>
							</Pressable>
						</View>

						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
								marginBottom: 12,
							}}
						>
							<Text style={{ fontSize: 16, fontWeight: "600" }}>Latest arrivals</Text>
							<Pressable
								onPress={() => navigation.navigate("Shop")}
								accessibilityRole="button"
								accessibilityLabel="See all products"
							>
								<Text style={{ fontSize: 12, color: colors.muted }}>See all</Text>
							</Pressable>
						</View>

						{productsLoading && (
							<ActivityIndicator style={{ marginVertical: 24 }} />
						)}
					</View>
				}
			/>
		</Screen>
	);
}
