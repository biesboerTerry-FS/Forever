import React, { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
	useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "../components/StarRating";
import Button from "../components/Button";
import { useShop } from "../context/ShopContext";
import { api } from "../api";
import { colors, money, spacing } from "../theme";

export default function ProductScreen({ route, navigation }) {
	const { id } = route.params;
	const { width } = useWindowDimensions();
	const {
		products,
		addToCart,
		toggleWishlist,
		isWishlisted,
		token,
	} = useShop();
	const product = products.find((item) => String(item._id) === String(id));

	const [size, setSize] = useState("");
	const [activeImage, setActiveImage] = useState(0);
	const [busy, setBusy] = useState(false);

	const [reviews, setReviews] = useState([]);
	const [reviewSummary, setReviewSummary] = useState({
		average: 0,
		count: 0,
		breakdown: [],
	});
	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState("");

	const loadReviews = async () => {
		try {
			const data = await api.get(`/api/review/${id}`);
			if (data.success) {
				setReviews(data.reviews);
				setReviewSummary({
					average: data.average,
					count: data.count,
					breakdown: data.breakdown,
				});
			}
		} catch (error) {
			console.warn(error.message);
		}
	};

	useEffect(() => {
		if (product) navigation.setOptions({ title: product.name });
	}, [navigation, product]);

	useEffect(() => {
		loadReviews();
	}, [id]);

	const saved = product && isWishlisted(product._id);

	const onAddToCart = async () => {
		try {
			setBusy(true);
			await addToCart(product._id, size);
			Alert.alert("Added to cart", `${product.name} is in your bag.`, [
				{ text: "Keep shopping", style: "cancel" },
				{ text: "View cart", onPress: () => navigation.navigate("Cart") },
			]);
		} catch (error) {
			Alert.alert("Can't add to cart", error.message);
		} finally {
			setBusy(false);
		}
	};

	const onToggleWishlist = async () => {
		try {
			const result = await toggleWishlist(product._id);
			Alert.alert(
				result.added ? "Saved" : "Removed",
				result.added
					? "Added to your wishlist."
					: "Removed from your wishlist."
			);
		} catch (error) {
			Alert.alert("Wishlist", error.message, [
				{ text: "Cancel", style: "cancel" },
				{ text: "Log in", onPress: () => navigation.navigate("Login") },
			]);
		}
	};

	const submitReview = async () => {
		if (!token) {
			Alert.alert("Sign in required", "Please log in to write a review.", [
				{ text: "Cancel", style: "cancel" },
				{ text: "Log in", onPress: () => navigation.navigate("Login") },
			]);
			return;
		}
		if (!comment.trim()) {
			Alert.alert("Add a comment", "Please write a few words about the product.");
			return;
		}
		try {
			const data = await api.post(
				"/api/review",
				{ productId: id, rating, comment, title: "" },
				token
			);
			if (data.success) {
				setComment("");
				setRating(5);
				await loadReviews();
				Alert.alert("Thank you", "Your review has been posted.");
			} else {
				Alert.alert("Could not post review", data.message);
			}
		} catch (error) {
			Alert.alert("Could not post review", error.message);
		}
	};

	const imageWidth = useMemo(() => width - spacing.md * 2, [width]);

	if (!product) {
		return (
			<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
				<ActivityIndicator />
			</View>
		);
	}

	return (
		<ScrollView
			style={{ backgroundColor: colors.bg }}
			contentContainerStyle={{ paddingBottom: 40 }}
		>
			{/* Gallery */}
			<ScrollView
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onMomentumScrollEnd={(event) =>
					setActiveImage(
						Math.round(event.nativeEvent.contentOffset.x / imageWidth)
					)
				}
			>
				{product.image.map((uri, index) => (
					<Image
						key={uri}
						source={{ uri }}
						style={{ width: imageWidth, height: imageWidth * 1.15 }}
						resizeMode="cover"
						accessibilityLabel={`${product.name} image ${index + 1}`}
					/>
				))}
			</ScrollView>
			{product.image.length > 1 && (
				<View
					style={{
						flexDirection: "row",
						justifyContent: "center",
						marginTop: 10,
					}}
					importantForAccessibility="no-hide-descendants"
					accessibilityElementsHidden
				>
					{product.image.map((uri, index) => (
						<View
							key={uri}
							style={{
								width: 6,
								height: 6,
								borderRadius: 3,
								marginHorizontal: 3,
								backgroundColor:
									index === activeImage ? colors.accent : colors.line,
							}}
						/>
					))}
				</View>
			)}

			<View style={{ padding: spacing.md }}>
				<View
					style={{
						flexDirection: "row",
						alignItems: "flex-start",
						justifyContent: "space-between",
					}}
				>
					<Text
						style={{
							fontSize: 20,
							fontWeight: "600",
							flex: 1,
							marginRight: 12,
						}}
					>
						{product.name}
					</Text>
					<Pressable
						onPress={onToggleWishlist}
						accessibilityRole="button"
						accessibilityLabel={saved ? "Remove from wishlist" : "Save to wishlist"}
						style={{
							width: 40,
							height: 40,
							borderRadius: 20,
							borderWidth: 1,
							borderColor: colors.line,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Ionicons
							name={saved ? "heart" : "heart-outline"}
							size={20}
							color={saved ? colors.danger : colors.ink}
						/>
					</Pressable>
				</View>

				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						marginTop: 8,
						gap: 8,
					}}
				>
					<StarRating value={reviewSummary.average} />
					<Text style={{ color: colors.muted, fontSize: 12 }}>
						{reviewSummary.count === 0
							? "No reviews yet"
							: `${reviewSummary.average} · ${reviewSummary.count} review${
									reviewSummary.count === 1 ? "" : "s"
							  }`}
					</Text>
				</View>

				<Text style={{ fontSize: 24, fontWeight: "700", marginTop: 14 }}>
					{money(product.price)}
				</Text>
				<Text style={{ color: colors.muted, lineHeight: 20, marginTop: 12 }}>
					{product.description}
				</Text>

				<Text style={{ marginTop: 20, marginBottom: 10, fontWeight: "600" }}>
					Select size
				</Text>
				<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
					{product.sizes.map((option) => {
						const active = option === size;
						return (
							<Pressable
								key={option}
								onPress={() => setSize(option)}
								accessibilityRole="radio"
								accessibilityState={{ selected: active }}
								accessibilityLabel={`Size ${option}`}
								style={{
									borderWidth: 1,
									borderColor: active ? "#f97316" : colors.line,
									backgroundColor: colors.soft,
									paddingHorizontal: 18,
									paddingVertical: 9,
								}}
							>
								<Text>{option}</Text>
							</Pressable>
						);
					})}
				</View>

				<Button
					title={busy ? "ADDING…" : "ADD TO CART"}
					onPress={onAddToCart}
					disabled={busy}
					style={{ marginTop: 22 }}
				/>

				<View style={{ marginTop: 20, gap: 4 }}>
					<Text style={{ color: colors.muted, fontSize: 12 }}>
						100% original product.
					</Text>
					<Text style={{ color: colors.muted, fontSize: 12 }}>
						Cash on delivery available.
					</Text>
					<Text style={{ color: colors.muted, fontSize: 12 }}>
						Free returns and exchanges within 7 days.
					</Text>
				</View>

				{/* Reviews */}
				<View style={{ marginTop: 32 }}>
					<Text style={{ fontSize: 17, fontWeight: "600" }}>
						Customer reviews
					</Text>

					{reviewSummary.count > 0 && (
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								marginTop: 10,
								gap: 12,
							}}
						>
							<Text style={{ fontSize: 34, fontWeight: "700" }}>
								{reviewSummary.average}
							</Text>
							<View>
								<StarRating value={reviewSummary.average} size={16} />
								<Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
									Based on {reviewSummary.count} review
									{reviewSummary.count === 1 ? "" : "s"}
								</Text>
							</View>
						</View>
					)}

					{reviews.map((review) => (
						<View
							key={review._id}
							style={{
								borderTopWidth: 1,
								borderTopColor: colors.line,
								paddingVertical: 12,
							}}
						>
							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<Text style={{ fontWeight: "600" }}>
									{review.title || "Verified purchase"}
								</Text>
								<Text style={{ color: colors.muted, fontSize: 11 }}>
									{new Date(review.date).toLocaleDateString()}
								</Text>
							</View>
							<View style={{ marginTop: 3 }}>
								<StarRating value={review.rating} size={12} />
							</View>
							<Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
								{review.name}
							</Text>
							<Text style={{ marginTop: 6, lineHeight: 19 }}>{review.comment}</Text>
						</View>
					))}

					{/* Add review */}
					<View style={{ marginTop: 18 }}>
						<Text style={{ fontWeight: "600", marginBottom: 8 }}>
							Write a review
						</Text>
						<View style={{ flexDirection: "row", gap: 4, marginBottom: 10 }}>
							{[1, 2, 3, 4, 5].map((star) => (
								<Pressable
									key={star}
									onPress={() => setRating(star)}
									accessibilityLabel={`${star} star`}
								>
									<Ionicons
										name={star <= rating ? "star" : "star-outline"}
										size={28}
										color="#f59e0b"
									/>
								</Pressable>
							))}
						</View>
						<TextInput
							value={comment}
							onChangeText={setComment}
							placeholder="What did you like or dislike?"
							placeholderTextColor={colors.muted}
							multiline
							accessibilityLabel="Your review"
							style={{
								borderWidth: 1,
								borderColor: colors.line,
								padding: 12,
								minHeight: 90,
								textAlignVertical: "top",
								color: colors.ink,
							}}
						/>
						<Button
							title="SUBMIT REVIEW"
							onPress={submitReview}
							variant="secondary"
							style={{ marginTop: 10 }}
						/>
					</View>
				</View>
			</View>
		</ScrollView>
	);
}
