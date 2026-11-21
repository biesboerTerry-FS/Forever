import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, useColorScheme } from "react-native";

export const lightColors = {
	bg: "#ffffff",
	ink: "#111827",
	muted: "#6b7280",
	line: "#e5e7eb",
	soft: "#f3f4f6",
	accent: "#111111",
	onAccent: "#ffffff",
	success: "#15803d",
	danger: "#dc2626",
};

export const darkColors = {
	bg: "#0b1020",
	ink: "#f9fafb",
	muted: "#9ca3af",
	line: "#374151",
	soft: "#1f2937",
	accent: "#f9fafb",
	onAccent: "#111827",
	success: "#4ade80",
	danger: "#f87171",
};

// Kept for any module-scope styles; components should use useTheme() so they
// re-render when the palette changes.
export const colors = lightColors;

export const money = (value) => `$${Number(value || 0).toFixed(2)}`;

export const spacing = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
};

const THEME_KEY = "forever-mobile-theme";
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
	const systemScheme = useColorScheme();
	const [dark, setDark] = useState(systemScheme === "dark");

	useEffect(() => {
		let active = true;
		const load = async () => {
			try {
				const stored = await AsyncStorage.getItem(THEME_KEY);
				if (!active) return;
				if (stored === "dark") setDark(true);
				else if (stored === "light") setDark(false);
			} catch {
				// keep the system preference as the fallback
			}
		};
		load();
		const subscription = Appearance.addChangeListener(({ colorScheme }) => {
			// Only follow the OS when the user hasn't chosen a theme on this device.
			AsyncStorage.getItem(THEME_KEY)
				.then((stored) => {
					if (active && !stored && colorScheme) setDark(colorScheme === "dark");
				})
				.catch(() => {});
		});
		return () => {
			active = false;
			subscription?.remove?.();
		};
	}, []);

	const toggleTheme = useCallback(() => {
		setDark((current) => {
			const next = !current;
			AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light").catch(() => {});
			return next;
		});
	}, []);

	const value = useMemo(
		() => ({ dark, toggleTheme, colors: dark ? darkColors : lightColors }),
		[dark, toggleTheme]
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) throw new Error("useTheme must be used inside ThemeProvider");
	return context;
};
