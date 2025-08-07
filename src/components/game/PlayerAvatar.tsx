import React from "react";

interface PlayerAvatarProps {
	name: string;
	isCurrent?: boolean;
	score?: number;
}

export function PlayerAvatar({ name, isCurrent, score }: PlayerAvatarProps) {
	return (
		<div
			className={`flex flex-col items-center justify-center transition-transform duration-300 ${
				isCurrent ? "scale-110 ring-4 ring-blue-400" : ""
			}`}
			style={{ minWidth: 64 }}
		>
			<div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-pink-400 flex items-center justify-center text-2xl font-bold shadow-lg">
				{name.charAt(0).toUpperCase()}
			</div>
			<div className="mt-1 text-xs font-semibold text-gray-700">{name}</div>
			{typeof score === "number" && (
				<div className="text-xs text-gray-500">Score: {score}</div>
			)}
		</div>
	);
}
