import Link from 'next/link';

export default function PlayPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #717EC3 0%, #496DDB 50%, #AE8799 100%)' }}>
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
              className="block text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: '#496DDB' }}
            >
              🎓 Learn How to Play
            </Link>
            <Link 
              href="/"
              className="block text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: '#AE8799' }}
            >
              🏠 Back to Home
            </Link>
          </div>

          <div className="mt-8 p-4 rounded-lg border-2" style={{ backgroundColor: '#F8F9FA', borderColor: '#717EC3' }}>
            <h3 className="font-semibold mb-2" style={{ color: '#717EC3' }}>🚀 Coming Features:</h3>
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
