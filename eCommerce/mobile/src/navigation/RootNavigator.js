import React from "react";
import { Pressable } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "../screens/HomeScreen";
import CollectionScreen from "../screens/CollectionScreen";
import CartScreen from "../screens/CartScreen";
import WishlistScreen from "../screens/WishlistScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ProductScreen from "../screens/ProductScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrdersScreen from "../screens/OrdersScreen";
import LoginScreen from "../screens/LoginScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import { useShop } from "../context/ShopContext";
import { colors } from "../theme";

const Stack = createNativeStackNavigator();

const linking = {
	prefixes: ["forever://", "https://forever.app"],
	config: {
		screens: {
			Tabs: "",
			ResetPassword: "reset-password",
			ForgotPassword: "forgot-password",
			Login: "login",
			Orders: "orders",
			Product: "product/:id",
		},
	},
};
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
	Home: ["home", "home-outline"],
	Shop: ["grid", "grid-outline"],
	Cart: ["bag", "bag-outline"],
	Wishlist: ["heart", "heart-outline"],
	Profile: ["person", "person-outline"],
};

function Tabs() {
	const { cartCount } = useShop();
	const insets = useSafeAreaInsets();

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarActiveTintColor: colors.ink,
				tabBarInactiveTintColor: colors.muted,
				tabBarStyle: {
					borderTopColor: colors.line,
					backgroundColor: colors.bg,
					// Lift the tab bar above the iPhone home indicator / bottom safe area.
					paddingBottom: Math.max(6, insets.bottom),
					paddingTop: 6,
					height: 52 + Math.max(6, insets.bottom),
					minHeight: 52 + Math.max(6, insets.bottom),
				},
				tabBarLabelStyle: { fontSize: 10 },
				tabBarIcon: ({ color, size, focused }) => {
					const pair = TAB_ICONS[route.name] || TAB_ICONS.Home;
					return (
						<Ionicons
							name={focused ? pair[0] : pair[1]}
							size={size}
							color={color}
						/>
					);
				},
			})}
		>
			<Tab.Screen name="Home" component={HomeScreen} />
			<Tab.Screen name="Shop" component={CollectionScreen} />
			<Tab.Screen
				name="Cart"
				component={CartScreen}
				options={{ tabBarBadge: cartCount > 0 ? cartCount : undefined }}
			/>
			<Tab.Screen name="Wishlist" component={WishlistScreen} />
			<Tab.Screen name="Profile" component={ProfileScreen} />
		</Tab.Navigator>
	);
}

function HeaderBack({ navigation }) {
	if (!navigation.canGoBack()) return null;
	return (
		<Pressable
			onPress={() => navigation.goBack()}
			accessibilityRole="button"
			accessibilityLabel="Go back"
			style={({ pressed }) => ({
				opacity: pressed ? 0.6 : 1,
				padding: 8,
				marginLeft: -8,
			})}
		>
			<Ionicons name="chevron-back" size={28} color={colors.ink} />
		</Pressable>
	);
}

export default function RootNavigator({ navigationRef }) {
	return (
		<NavigationContainer ref={navigationRef} linking={linking}>
			<Stack.Navigator
				screenOptions={({ navigation }) => ({
					headerTintColor: colors.ink,
					headerTitleStyle: { fontSize: 16 },
					headerStyle: { backgroundColor: colors.bg },
					contentStyle: { backgroundColor: colors.bg },
					headerLeft: () => <HeaderBack navigation={navigation} />,
				})}
			>
				<Stack.Screen
					name="Tabs"
					component={Tabs}
					options={{ headerShown: false }}
				/>
				<Stack.Screen name="Product" component={ProductScreen} />
				<Stack.Screen
					name="Checkout"
					component={CheckoutScreen}
					options={{ title: "Checkout" }}
				/>
				<Stack.Screen
					name="Orders"
					component={OrdersScreen}
					options={{ title: "My Orders" }}
				/>
				<Stack.Screen
					name="Login"
					component={LoginScreen}
					options={{ title: "Account" }}
				/>
				<Stack.Screen
					name="ForgotPassword"
					component={ForgotPasswordScreen}
					options={{ title: "Reset password" }}
				/>
				<Stack.Screen
					name="ResetPassword"
					component={ResetPasswordScreen}
					options={{ title: "New password" }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}
