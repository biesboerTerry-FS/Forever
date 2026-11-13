// Lightweight Expo Push API helper.
// https://docs.expo.dev/push-notifications/sending-notifications/
export const sendExpoPushNotifications = async (messages) => {
	const valid = (messages || []).filter(
		(msg) => typeof msg?.to === "string" && msg.to.startsWith("ExponentPushToken")
	);
	if (valid.length === 0) return [];

	try {
		const response = await fetch("https://exp.host/--/api/v2/push/send", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Accept-encoding": "gzip, deflate",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(valid),
		});
		if (!response.ok) {
			console.error("Expo push failed:", response.status, await response.text());
			return [];
		}
		const data = await response.json();
		return data?.data || [];
	} catch (error) {
		console.error("Expo push failed:", error.message);
		return [];
	}
};
