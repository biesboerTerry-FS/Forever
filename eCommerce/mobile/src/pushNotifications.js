import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { api } from "./api";

const PUSH_TOKEN_KEY = "expoPushToken";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
});

async function getExpoPushToken() {
	const projectId =
		Constants?.expoConfig?.extra?.eas?.projectId ||
		Constants?.easConfig?.projectId;
	const tokenData = projectId
		? await Notifications.getExpoPushTokenAsync({ projectId })
		: await Notifications.getExpoPushTokenAsync();
	return tokenData?.data || null;
}

export async function registerForPushNotificationsAsync(authToken) {
	if (!authToken) return null;
	// Push notifications require a physical device and are not supported on web.
	if (Platform.OS === "web") return null;
	if (!Device.isDevice) return null;

	try {
		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== "granted") return null;

		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync("default", {
				name: "default",
				importance: Notifications.AndroidImportance.DEFAULT,
			});
		}

		const pushToken = await getExpoPushToken();
		if (!pushToken) return null;

		await api.post("/api/user/push-token", { pushToken }, authToken);
		await AsyncStorage.setItem(PUSH_TOKEN_KEY, pushToken);
		return pushToken;
	} catch (error) {
		console.warn("Push registration failed:", error.message);
		return null;
	}
}

export async function unregisterForPushNotificationsAsync(authToken) {
	if (!authToken) return;
	try {
		let pushToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
		if (!pushToken && Platform.OS !== "web" && Device.isDevice) {
			try {
				pushToken = await getExpoPushToken();
			} catch {
				pushToken = null;
			}
		}
		if (pushToken) {
			await api.post("/api/user/push-token/remove", { pushToken }, authToken);
		}
	} catch (error) {
		console.warn("Push unregister failed:", error.message);
	} finally {
		try {
			await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
		} catch {
			// ignore
		}
	}
}
