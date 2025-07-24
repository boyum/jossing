import Link from 'next/link';

export default function PlayPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
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
              className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              🎓 Learn How to Play
            </Link>
            <Link 
              href="/"
              className="block bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              🏠 Back to Home
            </Link>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">🚀 Coming Features:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
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
