import Toast from "react-native-toast-message";

export const showToast = ({ type = "success", title, message }) => {
	Toast.show({
		type,
		text1: title,
		text2: message,
		position: "top",
		visibilityTime: 2500,
		autoHide: true,
		topOffset: 50,
	});
};

export const toastSuccess = (title, message) => showToast({ type: "success", title, message });
export const toastError = (title, message) => showToast({ type: "error", title, message });
export const toastInfo = (title, message) => showToast({ type: "info", title, message });
