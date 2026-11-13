import React from "react";

// Catches render errors so a single broken component shows a helpful screen
// instead of a blank white page.
class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error, info) {
		console.error("App error:", error, info);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-6 text-center text-gray-800 dark:text-gray-100">
					<h1 className="text-2xl font-medium">Something went wrong</h1>
					<p className="max-w-md text-sm text-gray-600 dark:text-gray-400">
						Sorry about that. Reload the page to try again — your cart and
						account are safe.
					</p>
					<div className="flex gap-3">
						<button
							type="button"
							onClick={() => window.location.reload()}
							className="px-6 py-2 text-sm text-white dark:text-gray-900 bg-black dark:bg-white"
						>
							Reload
						</button>
						<a
							href="/"
							className="px-6 py-2 text-sm border border-gray-300 dark:border-gray-700"
						>
							Go home
						</a>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
