"use client";

interface ConnectionStatusProps {
	isConnected: boolean;
	isReconnecting: boolean;
}

export function ConnectionStatus({
	isConnected,
	isReconnecting,
}: ConnectionStatusProps) {
	const getStatusText = () => {
		if (isReconnecting) return "Updating...";
		return isConnected ? "Connected" : "Disconnected";
	};

	const getStatusStyle = () => {
		if (isReconnecting) {
			return "bg-yellow-100 border-yellow-400 text-yellow-800";
		}
		return isConnected
			? "bg-green-100 border-green-400 text-green-800"
			: "bg-red-100 border-red-400 text-red-800";
	};

	const getIndicatorStyle = () => {
		if (isReconnecting) return "bg-yellow-500 animate-pulse";
		return isConnected ? "bg-green-500" : "bg-red-500";
	};

	return (
		<div className="fixed top-4 right-4 z-50">
			<div
				className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all border ${getStatusStyle()}`}
			>
				<div className="flex items-center space-x-2">
					<div className={`w-2 h-2 rounded-full ${getIndicatorStyle()}`} />
					<span>{getStatusText()}</span>
				</div>
			</div>
		</div>
	);
}
