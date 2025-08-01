"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
	const pathname = usePathname();

	const isActive = (path: string) => pathname === path;

	return (
		<nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-glaucous">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link href="/" className="flex items-center space-x-2">
						<span className="text-2xl">🃏</span>
						<span className="text-xl font-bold text-royal-blue">Jøssing</span>
					</Link>

					{/* Navigation Links */}
					<div className="hidden md:flex space-x-8">
						<Link
							href="/"
							className={`px-3 py-2 rounded-md text-sm font-medium transition-all hover:opacity-90 ${
								isActive("/")
									? "bg-primary text-white"
									: "text-gray-700 hover:bg-primary"
							}`}
						>
							Home
						</Link>
						<Link
							href="/how-to-play"
							className={`px-3 py-2 rounded-md text-sm font-medium transition-all hover:opacity-90 ${
								isActive("/how-to-play")
									? "bg-secondary text-white"
									: "text-gray-700 hover:bg-secondary"
							}`}
						>
							How to Play
						</Link>
						<Link
							href="/play"
							className={`px-3 py-2 rounded-md text-sm font-medium transition-all hover:opacity-90 ${
								isActive("/play")
									? "bg-accent text-white"
									: "text-gray-700 hover:bg-accent"
							}`}
						>
							Play Game
						</Link>
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden">
						<button
							type="button"
							className="text-gray-700 hover:text-blue-600"
							aria-label="Open mobile menu"
						>
							<svg
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</nav>
	);
}
