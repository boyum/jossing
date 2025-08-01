"use client";

import { useState, useEffect, Suspense } from "react";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import tutorial components
const GameInstructions = dynamic(
	() => import("@/components/tutorial/GameInstructions"),
	{ ssr: false },
);
const CardPlaySimulator = dynamic(
	() => import("@/components/tutorial/CardPlaySimulator"),
	{ ssr: false },
);
const BiddingTrainer = dynamic(
	() => import("@/components/tutorial/BiddingTrainer"),
	{ ssr: false },
);
const ScoreCalculator = dynamic(
	() => import("@/components/tutorial/ScoreCalculator"),
	{ ssr: false },
);
const TrumpSuitDemo = dynamic(
	() => import("@/components/tutorial/TrumpSuitDemo"),
	{ ssr: false },
);
const GameFlowWalkthrough = dynamic(
	() => import("@/components/tutorial/GameFlowWalkthrough"),
	{ ssr: false },
);
const QuickReference = dynamic(
	() => import("@/components/tutorial/QuickReference"),
	{ ssr: false },
);

interface TutorialSection {
	id: string;
	title: string;
	description: string;
	component: React.ComponentType;
	route: string;
}

const tutorialSections: TutorialSection[] = [
	{
		id: "instructions",
		title: "Game Instructions",
		description: "Complete written rules and guide",
		component: GameInstructions,
		route: "instructions",
	},
	{
		id: "basics",
		title: "Card Game Basics",
		description: "Learn about cards, suits, and trump basics",
		component: TrumpSuitDemo,
		route: "basics",
	},
	{
		id: "bidding",
		title: "Bidding Phase",
		description: "Practice making strategic bids",
		component: BiddingTrainer,
		route: "bidding",
	},
	{
		id: "playing",
		title: "Playing Cards",
		description: "Learn when you can play which cards",
		component: CardPlaySimulator,
		route: "playing",
	},
	{
		id: "scoring",
		title: "Scoring System",
		description: "Understand how points are calculated",
		component: ScoreCalculator,
		route: "scoring",
	},
	{
		id: "gameflow",
		title: "Game Flow",
		description: "See how a complete game progresses",
		component: GameFlowWalkthrough,
		route: "gameflow",
	},
	{
		id: "reference",
		title: "Quick Reference",
		description: "Rules summary and cheat sheet",
		component: QuickReference,
		route: "reference",
	},
];

export default function HowToPlayPage() {
	return (
		<Suspense>
			<HowToPlay />
		</Suspense>
	);
}

function HowToPlay() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [currentSection, setCurrentSection] = useState(0);

	// Get section from URL parameter
	useEffect(() => {
		const sectionParam = searchParams.get("section");
		if (sectionParam) {
			const sectionIndex = tutorialSections.findIndex(
				(section) => section.route === sectionParam,
			);
			if (sectionIndex !== -1) {
				setCurrentSection(sectionIndex);
			}
		}
	}, [searchParams]);

	// Update URL when section changes
	const navigateToSection = (index: number) => {
		setCurrentSection(index);
		const section = tutorialSections[index];
		router.push(`/how-to-play?section=${section.route}`, { scroll: false });
	};

	const CurrentComponent = tutorialSections[currentSection].component;

	const nextSection = () => {
		const next = Math.min(currentSection + 1, tutorialSections.length - 1);
		navigateToSection(next);
	};

	const prevSection = () => {
		const prev = Math.max(currentSection - 1, 0);
		navigateToSection(prev);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
			{/* Header */}
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center space-x-4">
							<Link
								href="/"
								className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
							>
								<Home className="w-5 h-5" />
								<span>Home</span>
							</Link>
							<span className="text-gray-300">|</span>
							<h1 className="text-xl font-bold text-gray-900">
								How to Play Jøssing
							</h1>
						</div>
						<div className="text-sm text-gray-500">
							{currentSection + 1} of {tutorialSections.length}
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Navigation */}
				<div className="mb-8">
					<div className="flex flex-wrap gap-2 mb-6">
						{tutorialSections.map((section, index) => (
							<button
								key={section.id}
								type="button"
								onClick={() => navigateToSection(index)}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
									currentSection === index
										? "bg-blue-500 text-white"
										: "bg-white text-gray-700 hover:bg-gray-100 border"
								}`}
							>
								{section.title}
							</button>
						))}
					</div>

					{/* Progress bar */}
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-500 h-2 rounded-full transition-all duration-300"
							style={{
								width: `${
									((currentSection + 1) / tutorialSections.length) * 100
								}%`,
							}}
						/>
					</div>
				</div>

				{/* Current Section */}
				<div className="bg-white rounded-xl shadow-lg p-6 mb-8">
					<div className="mb-6">
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							{tutorialSections[currentSection].title}
						</h2>
						<p className="text-gray-600">
							{tutorialSections[currentSection].description}
						</p>
					</div>

					{/* Tutorial Component */}
					<div className="tutorial-content">
						<CurrentComponent />
					</div>
				</div>

				{/* Navigation Buttons */}
				<div className="flex justify-between items-center">
					<button
						type="button"
						onClick={prevSection}
						disabled={currentSection === 0}
						className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
							currentSection === 0
								? "bg-gray-100 text-gray-400 cursor-not-allowed"
								: "bg-gray-200 text-gray-700 hover:bg-gray-300"
						}`}
					>
						<ArrowLeft className="w-4 h-4" />
						<span>Previous</span>
					</button>

					<div className="flex items-center space-x-4">
						<Link
							href="/"
							className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
						>
							Start Playing
						</Link>
					</div>

					<button
						type="button"
						onClick={nextSection}
						disabled={currentSection === tutorialSections.length - 1}
						className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
							currentSection === tutorialSections.length - 1
								? "bg-gray-100 text-gray-400 cursor-not-allowed"
								: "bg-blue-500 text-white hover:bg-blue-600"
						}`}
					>
						<span>Next</span>
						<ArrowRight className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
