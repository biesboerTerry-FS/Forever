import React from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { useTheme, spacing } from "../theme";

const STOREFRONT = "https://forever-frontend-gamma-wheat.vercel.app";

const COMPANY = [
	{ label: "Home", route: "Home" },
	{ label: "About Us", path: "/about" },
	{ label: "Delivery & Shipping", path: "/delivery" },
	{ label: "Privacy Policy", path: "/privacy" },
	{ label: "Employee Portal", path: "/employee" },
];

const SERVICE = [
	{ label: "Contact Us", path: "/contact" },
	{ label: "Returns & Exchanges", path: "/returns" },
	{ label: "Terms of Service", path: "/terms" },
	{ label: "Shop All", route: "Shop" },
	{ label: "Sitemap", path: "/sitemap.xml" },
];

// Mirrors the storefront footer so mobile shoppers see the same destinations.
export default function Footer({ navigation }) {
	const { colors } = useTheme();

	const open = (item) => {
		if (item.route && navigation) {
			navigation.navigate(item.route);
			return;
		}
		Linking.openURL(`${STOREFRONT}${item.path}`).catch(() => {});
	};

	return (
		<View testID="mobile-footer" style={{ borderTopWidth: 1, borderTopColor: colors.line, marginTop: 24, paddingTop: 20 }}>
			<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 24 }}>
				<View style={{ width: "46%", minWidth: 130 }}>
					<Text style={{ fontSize: 12, fontWeight: "700", letterSpacing: 1, color: colors.ink, marginBottom: 10 }}>
						COMPANY
					</Text>
					{COMPANY.map((item) => (
						<Pressable key={item.label} onPress={() => open(item)} testID={`footer-${item.label.toLowerCase().replace(/[^a-z]+/g, "-")}`} style={{ paddingVertical: 4 }}>
							<Text style={{ fontSize: 12, color: colors.muted }}>{item.label}</Text>
						</Pressable>
					))}
				</View>
				<View style={{ width: "46%", minWidth: 130 }}>
					<Text style={{ fontSize: 12, fontWeight: "700", letterSpacing: 1, color: colors.ink, marginBottom: 10 }}>
						CUSTOMER SERVICE
					</Text>
					{SERVICE.map((item) => (
						<Pressable key={item.label} onPress={() => open(item)} testID={`footer-${item.label.toLowerCase().replace(/[^a-z]+/g, "-")}`} style={{ paddingVertical: 4 }}>
							<Text style={{ fontSize: 12, color: colors.muted }}>{item.label}</Text>
						</Pressable>
					))}
				</View>
			</View>
			<View style={{ marginTop: 20 }}>
				<Text style={{ fontSize: 12, fontWeight: "700", letterSpacing: 1, color: colors.ink, marginBottom: 8 }}>
					GET IN TOUCH
				</Text>
				<Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18 }}>
					Phone: +1 314 723 1421{`\n`}
					Email: contact@forever.com{`\n`}
					54709 Williams Station, Suite 350, Washington, USA{`\n`}
					Mon–Fri, 9:00 AM – 6:00 PM
				</Text>
			</View>
			<Text style={{ fontSize: 10, color: colors.muted, textAlign: "center", marginTop: spacing.lg }}>
				Copyright © 2026 Forever. All rights reserved.
			</Text>
		</View>
	);
}
