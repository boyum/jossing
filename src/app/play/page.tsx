import Link from 'next/link';

export default function PlayPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-jossing-play">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-6xl mb-6">🎮</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Game Coming Soon!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            The multiplayer Jøssing game is currently in development. 
            For now, explore our comprehensive tutorials to master the rules and strategy!
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/how-to-play"
              className="block bg-secondary hover:opacity-90 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all"
            >
              🎓 Learn How to Play
            </Link>
            <Link 
              href="/"
              className="block bg-muted hover:opacity-90 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all"
            >
              🏠 Back to Home
            </Link>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg border-2 border-jossing-primary">
            <h3 className="font-semibold text-jossing-primary mb-2">🚀 Coming Features:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Real-time multiplayer games</li>
              <li>• AI opponents for practice</li>
              <li>• Tournament modes</li>
              <li>• Statistics and achievements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
