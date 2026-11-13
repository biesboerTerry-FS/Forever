import React from "react";

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error, info) {
		console.error("Admin error:", error, info);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
					<h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">
						Something went wrong
					</h2>
					<p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
						Reload the page to try again. No data has been changed.
					</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="px-6 py-2 text-sm text-white bg-gray-900 rounded-lg dark:bg-white dark:text-gray-900"
					>
						Reload
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
