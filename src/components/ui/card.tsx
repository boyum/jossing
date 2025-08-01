import type { Card } from "@/types/game";
import { getSuitSymbol } from "@/lib/game-utils";

interface CardComponentProps {
	card: Card;
	onClick?: () => void;
	disabled?: boolean;
	size?: "small" | "medium" | "large";
	className?: string;
	isTrump?: boolean;
	isPlayable?: boolean;
}

export function CardComponent({
	card,
	onClick,
	disabled = false,
	size = "medium",
	className = "",
	isTrump = false,
	isPlayable = true,
}: CardComponentProps) {
	const sizeClasses = {
		small: "w-16 h-22 text-sm",
		medium: "w-20 h-28 text-base",
		large: "w-24 h-36 text-lg",
	};

	const isRed = card.suit === "hearts" || card.suit === "diamonds";
	const suitSymbol = getSuitSymbol(card.suit);
	const suitName = card.suit.charAt(0).toUpperCase() + card.suit.slice(1);

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled || !onClick || !isPlayable}
			className={`
        ${sizeClasses[size]}
        rounded-xl border-2 bg-white shadow-md
        flex flex-col items-center justify-between p-2
        transition-all duration-200 transform relative group
        ${isTrump ? "border-yellow-400 ring-2 ring-yellow-300 ring-opacity-50" : "border-gray-400"}
        ${!disabled && onClick && isPlayable ? "hover:scale-105 hover:shadow-xl cursor-pointer hover:border-blue-400" : ""}
        ${disabled || !isPlayable ? "opacity-50 cursor-not-allowed" : ""}
        ${isRed ? "text-red-600" : "text-black"}
        font-bold
        ${className}
      `}
		>
			{/* Top left corner */}
			<div className="absolute top-1 left-1 flex flex-col items-center leading-none">
				<span className="text-xs font-bold">{card.rank}</span>
				<span className="text-sm">{suitSymbol}</span>
			</div>

			{/* Trump indicator */}
			{isTrump && (
				<div className="absolute top-0 right-0 bg-yellow-400 text-yellow-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold transform translate-x-1 -translate-y-1">
					👑
				</div>
			)}

			{/* Center - large suit symbol */}
			<div className="flex-1 flex items-center justify-center">
				<span
					className={`
          ${size === "small" ? "text-2xl" : size === "medium" ? "text-3xl" : "text-4xl"}
        `}
				>
					{suitSymbol}
				</span>
			</div>

			{/* Bottom right corner (rotated) */}
			<div className="absolute bottom-1 right-1 flex flex-col items-center leading-none transform rotate-180">
				<span className="text-xs font-bold">{card.rank}</span>
				<span className="text-sm">{suitSymbol}</span>
			</div>

			{/* Suit name tooltip on hover (optional) */}
			<div
				className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                      bg-gray-800 text-white text-xs px-2 py-1 rounded 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
			>
				{suitName}
			</div>
		</button>
	);
}
