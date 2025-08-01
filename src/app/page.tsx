import Link from "next/link";
import { CardComponent } from "@/components/ui/card";
import type { Rank, Suit } from "@/types/game";

export default function HomePage() {
	// Sample cards for visual appeal
	const sampleCards = [
		{ suit: "hearts", rank: "A" },
		{ suit: "spades", rank: "K" },
		{ suit: "diamonds", rank: "Q" },
		{ suit: "clubs", rank: "J" },
	] as const satisfies readonly {
		suit: Suit;
		rank: Rank;
	}[];

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			{/* Hero Section */}
			<div className="relative overflow-hidden bg-jossing-hero">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
					<div className="text-center">
						<h1 className="text-5xl md:text-7xl font-bold mb-6">🃏 Jøssing</h1>
						<p className="text-xl md:text-2xl mb-4 font-medium">
							The Ultimate Trick-Taking Challenge
						</p>
						<p className="text-lg mb-8 max-w-2xl mx-auto">
							Master the art of precision bidding in this thrilling Norwegian
							card game where
							<strong> accuracy beats ambition</strong>!
						</p>

						{/* Sample Cards Display */}
						<div className="flex justify-center space-x-3 mb-8">
							{sampleCards.map((card, index) => (
								<div
									key={`${card.suit}-${card.rank}`}
									className={`transform transition-all duration-300 hover:scale-105 ${
										index === 1
											? "translate-y-2"
											: index === 2
												? "-translate-y-1"
												: ""
									}`}
									style={{ animationDelay: `${index * 100}ms` }}
								>
									<CardComponent
										card={card}
										size="large"
										className="shadow-lg hover:shadow-xl transition-shadow"
									/>
								</div>
							))}
						</div>

						{/* CTA Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<Link
								href="/how-to-play"
								className="bg-accent hover:opacity-90 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
							>
								🎓 Learn to Play
							</Link>
							<Link
								href="/play"
								className="bg-muted hover:opacity-90 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
							>
								🎮 Start Playing
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Why You&apos;ll Love Jøssing
						</h2>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Experience the perfect blend of strategy, psychology, and
							precision in every hand
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						<div className="text-center group">
							<div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 transition-all group-hover:scale-110">
								<span className="text-2xl text-white">🧠</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								Pure Strategy
							</h3>
							<p className="text-gray-600">
								No luck - just skill, calculation, and nerves of steel
							</p>
						</div>

						<div className="text-center group">
							<div className="bg-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 transition-all group-hover:scale-110">
								<span className="text-2xl text-white">⚡</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								Quick Rounds
							</h3>
							<p className="text-gray-600">
								Games progress from 1 card to 10 cards per hand
							</p>
						</div>

						<div className="text-center group">
							<div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 transition-all group-hover:scale-110">
								<span className="text-2xl text-white">🔥</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								High Stakes
							</h3>
							<p className="text-gray-600">
								Hit your bid exactly or get nothing - no participation points!
							</p>
						</div>

						<div className="text-center group">
							<div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 transition-all group-hover:scale-110">
								<span className="text-2xl text-white">🤝</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								Social Fun
							</h3>
							<p className="text-gray-600">
								Perfect for 2-6 players who love a mental challenge
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* How It Works Section */}
			<div className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							🚀 The Twist That Changes Everything
						</h2>
						<p className="text-lg text-gray-600 max-w-3xl mx-auto">
							Unlike other card games,{" "}
							<strong>all players bid simultaneously</strong>! No strategic
							advantages, no reading the table - just you, your cards, and your
							ability to predict the future.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						<div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border-t-4 border-primary">
							<div className="text-center">
								<div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
									1
								</div>
								<h3 className="text-xl font-semibold mb-3">
									Analyze Your Hand
								</h3>
								<p className="text-gray-600">
									Count trump cards, assess high-value suits, and calculate your
									winning potential
								</p>
							</div>
						</div>

						<div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border-t-4 border-secondary">
							<div className="text-center">
								<div className="bg-secondary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
									2
								</div>
								<h3 className="text-xl font-semibold mb-3">
									Bid Simultaneously
								</h3>
								<p className="text-gray-600">
									Everyone writes their bid at the same time - no watching
									others, no adjustments
								</p>
							</div>
						</div>

						<div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border-t-4 border-accent">
							<div className="text-center">
								<div className="bg-accent text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
									3
								</div>
								<h3 className="text-xl font-semibold mb-3">Win Exactly</h3>
								<p className="text-gray-600">
									Hit your bid exactly for 10 + bid points, or get zero. No
									middle ground!
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Scoring Section */}
			<div className="py-16 bg-white">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl font-bold text-gray-900 mb-8">
						🎯 Elegantly Simple, Brutally Unforgiving
					</h2>

					<div className="grid md:grid-cols-2 gap-8">
						<div className="bg-white rounded-lg p-6 shadow-lg border-2 border-primary">
							<div className="text-4xl mb-4">✅</div>
							<h3 className="text-xl font-semibold text-glaucous mb-2">
								Exact Bid
							</h3>
							<p className="text-lg font-medium text-royal-blue">
								10 + your bid points
							</p>
							<p className="text-sm text-gray-600 mt-2">
								Bid 3, win 3 tricks = 13 points!
							</p>
						</div>

						<div className="bg-white rounded-lg p-6 shadow-lg border-2 border-accent">
							<div className="text-4xl mb-4">❌</div>
							<h3 className="text-xl font-semibold text-indian-red mb-2">
								Any Other Result
							</h3>
							<p className="text-lg font-medium text-mountbatten-pink">
								0 points
							</p>
							<p className="text-sm text-gray-600 mt-2">
								Bid 3, win 2 or 4 tricks = nothing!
							</p>
						</div>
					</div>

					<div className="mt-8 text-gray-600">
						<p className="text-lg">
							The question isn&apos;t whether you can win a trick - it&apos;s
							whether you can predict exactly how many you&apos;ll win.
						</p>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="py-16 bg-jossing-cta">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
						Ready to Test Your Precision?
					</h2>
					<p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
						Whether you&apos;re a card game veteran or complete beginner,
						Jøssing will challenge your mind and keep you coming back for more.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Link
							href="/how-to-play"
							className="bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
						>
							📚 Master the Rules
						</Link>
						<Link
							href="/play"
							className="bg-secondary hover:opacity-90 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-white"
						>
							🎯 Start Your Challenge
						</Link>
					</div>

					<div className="mt-6">
						<p className="text-white text-lg font-medium opacity-90">
							Are you precise enough to master Jøssing?
						</p>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<p className="text-gray-300">
						Built with ❤️ for card game enthusiasts everywhere
					</p>
				</div>
			</footer>
		</div>
	);
}
