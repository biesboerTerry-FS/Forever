import React, { useMemo, useState } from "react";
import {
	FlatList,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
	useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import ProductCard from "../components/ProductCard";
import { useShop } from "../context/ShopContext";
import { colors, spacing } from "../theme";

const CATEGORIES = ["All", "Women", "Men", "Kids"];

export default function CollectionScreen({ navigation }) {
	const { products } = useShop();
	const { width } = useWindowDimensions();
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("All");
	const cardWidth = (width - spacing.md * 2 - spacing.md) / 2;

	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();
		return products.filter((item) => {
			if (category !== "All" && item.category !== category) return false;
			if (!term) return true;
			return [item.name, item.category, item.subCategory, item.description]
				.join(" ")
				.toLowerCase()
				.includes(term);
		});
	}, [products, search, category]);

	return (
		<Screen>
			<View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
				<Text style={{ fontSize: 20, fontWeight: "600" }} accessibilityRole="header">
					Shop all
				</Text>

				{/* Search */}
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						borderWidth: 1,
						borderColor: colors.line,
						borderRadius: 22,
						paddingHorizontal: 14,
						marginTop: 12,
					}}
				>
					<Ionicons name="search" size={16} color={colors.muted} />
					<TextInput
						value={search}
						onChangeText={setSearch}
						placeholder="Search products, categories…"
						placeholderTextColor={colors.muted}
						style={{
							flex: 1,
							paddingVertical: 10,
							paddingHorizontal: 8,
							color: colors.ink,
						}}
						accessibilityLabel="Search products"
					/>
					{search.length > 0 && (
						<Pressable onPress={() => setSearch("")} accessibilityLabel="Clear search">
							<Ionicons name="close-circle" size={18} color={colors.muted} />
						</Pressable>
					)}
				</View>

				{/* Category chips */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={{ marginTop: 12, marginBottom: 10 }}
				>
					{CATEGORIES.map((item) => {
						const active = category === item;
						return (
							<Pressable
								key={item}
								onPress={() => setCategory(item)}
								accessibilityRole="radio"
								accessibilityState={{ selected: active }}
								accessibilityLabel={`Filter by ${item}`}
								style={{
									paddingHorizontal: 16,
									paddingVertical: 7,
									borderRadius: 18,
									borderWidth: 1,
									borderColor: active ? colors.accent : colors.line,
									backgroundColor: active ? colors.accent : colors.bg,
									marginRight: 8,
								}}
							>
								<Text
									style={{ color: active ? "#fff" : colors.ink, fontSize: 12 }}
								>
									{item}
								</Text>
							</Pressable>
						);
					})}
				</ScrollView>

				<Text style={{ color: colors.muted, fontSize: 12, marginBottom: 12 }}>
					{filtered.length} {filtered.length === 1 ? "product" : "products"}
					{search.trim() ? ` for “${search.trim()}”` : ""}
				</Text>
			</View>

			<FlatList
				data={filtered}
				keyExtractor={(item) => item._id}
				numColumns={2}
				columnWrapperStyle={{ justifyContent: "space-between" }}
				contentContainerStyle={{
					paddingHorizontal: spacing.md,
					paddingBottom: 32,
				}}
				renderItem={({ item }) => (
					<ProductCard
						product={item}
						width={cardWidth}
						onPress={() => navigation.navigate("Product", { id: item._id })}
					/>
				)}
				ListEmptyComponent={
					<View style={{ alignItems: "center", paddingVertical: 60 }}>
						<Text style={{ fontSize: 16, fontWeight: "600" }}>No products found</Text>
						<Text style={{ color: colors.muted, marginTop: 6, textAlign: "center" }}>
							Try a different search term or category.
						</Text>
					</View>
				}
			/>
		</Screen>
	);
}
