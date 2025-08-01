// hooks/useGamePolling.ts
// Polling-based real-time updates for Vercel/serverless compatibility
// Default interval: 2000ms (2 seconds) for responsive game state synchronization
import { useState, useEffect, useCallback } from "react";
import type { GameState } from "@/types/game";

interface UseGamePollingOptions {
	sessionId: string;
	playerId: string;
	enabled?: boolean;
	pollingInterval?: number; // milliseconds
}

interface GamePollingResult {
	gameState: GameState | null;
	error: string | null;
	isLoading: boolean;
	refetch: () => Promise<void>;
}

export function useGamePolling({
	sessionId,
	playerId,
	enabled = true,
	pollingInterval = 2000, // 2 seconds
}: UseGamePollingOptions): GamePollingResult {
	const [gameState, setGameState] = useState<GameState | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchGameState = useCallback(async () => {
		if (!sessionId || !playerId) return;

		try {
			const response = await fetch(
				`/api/game/${sessionId}?playerId=${playerId}`,
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			setGameState(data);
			setError(null);
		} catch (err) {
			console.error("Failed to fetch game state:", err);
			setError(
				err instanceof Error ? err.message : "Failed to fetch game state",
			);
		} finally {
			setIsLoading(false);
		}
	}, [sessionId, playerId]);

	useEffect(() => {
		if (!enabled || !sessionId || !playerId) {
			setIsLoading(false);
			return;
		}

		// Initial fetch
		fetchGameState();

		// Set up polling
		const interval = setInterval(fetchGameState, pollingInterval);

		return () => clearInterval(interval);
	}, [enabled, sessionId, playerId, pollingInterval, fetchGameState]);

	return {
		gameState,
		error,
		isLoading,
		refetch: fetchGameState,
	};
}
