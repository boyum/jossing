import React from "react";

interface PlayerAvatarProps {
	name: string;
	isCurrent?: boolean;
	score?: number;
}

export function PlayerAvatar({ name, isCurrent, score }: PlayerAvatarProps) {
	// Use a cartoon emoji for avatar
	const avatarEmoji = "🧑‍🎤";
	return (
		<div
			className={`flex flex-col items-center justify-center transition-transform duration-300 ${
				isCurrent ? "scale-110 ring-4 ring-blue-400 animate-bounce" : ""
			}`}
			style={{ minWidth: 64 }}
		>
			<div
				className={`w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-pink-400 flex items-center justify-center text-3xl font-bold shadow-lg ${
					isCurrent ? "ring-4 ring-blue-400" : ""
				}`}
			>
				<span>{avatarEmoji}</span>
			</div>
			<div className="mt-1 text-xs font-semibold text-gray-700">
				{name}
			</div>
			{typeof score === "number" && (
				<div className="text-xs text-gray-500">Score: {score}</div>
			)}
		</div>
	);
}
