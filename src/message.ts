import type { ToastServiceMethods } from "primevue/toastservice";

function success(
	toast: ToastServiceMethods,
	message: string,
	title?: string | null,
	duration?: number,
) {
	toast.add({
		severity: "success",
		summary: title || "Success",
		detail: message,
		life: duration || 3000,
	});
}

function info(
	toast: ToastServiceMethods,
	message: string,
	title?: string | null,
	duration?: number,
) {
	toast.add({
		severity: "info",
		summary: title || "Info",
		detail: message,
		life: duration || 3000,
	});
}

function warn(
	toast: ToastServiceMethods,
	message: string,
	title?: string | null,
	duration?: number,
) {
	toast.add({
		severity: "warn",
		summary: title || "Warning",
		detail: message,
		life: duration || 3000,
	});
}

function error(
	toast: ToastServiceMethods,
	message: string,
	title?: string | null,
	duration?: number,
) {
	toast.add({
		severity: "error",
		summary: title || "Error",
		detail: message,
		life: duration || 3000,
	});
}

export default {
	success,
	info,
	warn,
	error,
};
