import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { api } from "./api";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
});

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

		const projectId =
			Constants?.expoConfig?.extra?.eas?.projectId ||
			Constants?.easConfig?.projectId;
		const tokenData = projectId
			? await Notifications.getExpoPushTokenAsync({ projectId })
			: await Notifications.getExpoPushTokenAsync();
		const pushToken = tokenData?.data;
		if (!pushToken) return null;

		await api.post("/api/user/push-token", { pushToken }, authToken);
		return pushToken;
	} catch (error) {
		console.warn("Push registration failed:", error.message);
		return null;
	}
}
