import Link from 'next/link';
import { CardComponent } from '@/components/ui/card';
import { Suit, Rank } from '@/types/game';

export default function HomePage() {
  // Sample cards for visual appeal
  const sampleCards = [
    { suit: Suit.HEARTS, rank: Rank.ACE, value: 14 },
    { suit: Suit.SPADES, rank: Rank.KING, value: 13 },
    { suit: Suit.DIAMONDS, rank: Rank.QUEEN, value: 12 },
    { suit: Suit.CLUBS, rank: Rank.JACK, value: 11 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              🃏 <span className="text-blue-600">Jøssing</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4 font-medium">
              The Ultimate Trick-Taking Challenge
            </p>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              Master the art of precision bidding in this thrilling Norwegian card game where 
              <strong className="text-gray-700"> accuracy beats ambition</strong>!
            </p>
            
            {/* Sample Cards Display */}
            <div className="flex justify-center space-x-3 mb-8">
              {sampleCards.map((card, index) => (
                <div 
                  key={`${card.suit}-${card.rank}`}
                  className={`transform transition-all duration-300 hover:scale-105 ${
                    index === 1 ? 'translate-y-2' : index === 2 ? '-translate-y-1' : ''
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🎓 Learn to Play
              </Link>
              <Link 
                href="/play"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
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
              Experience the perfect blend of strategy, psychology, and precision in every hand
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pure Strategy</h3>
              <p className="text-gray-600">No luck - just skill, calculation, and nerves of steel</p>
            </div>

            <div className="text-center group">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Rounds</h3>
              <p className="text-gray-600">Games progress from 1 card to 10 cards per hand</p>
            </div>

            <div className="text-center group">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">High Stakes</h3>
              <p className="text-gray-600">Hit your bid exactly or get nothing - no participation points!</p>
            </div>

            <div className="text-center group">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Social Fun</h3>
              <p className="text-gray-600">Perfect for 3-6 players who love a mental challenge</p>
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
              Unlike other card games, <strong>all players bid simultaneously</strong>! 
              No strategic advantages, no reading the table - just you, your cards, and your ability to predict the future.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Analyze Your Hand</h3>
                <p className="text-gray-600">
                  Count trump cards, assess high-value suits, and calculate your winning potential
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">Bid Simultaneously</h3>
                <p className="text-gray-600">
                  Everyone writes their bid at the same time - no watching others, no adjustments
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Win Exactly</h3>
                <p className="text-gray-600">
                  Hit your bid exactly for 10 + bid points, or get zero. No middle ground!
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">Exact Bid</h3>
              <p className="text-green-700 text-lg font-medium">10 + your bid points</p>
              <p className="text-sm text-green-600 mt-2">
                Bid 3, win 3 tricks = 13 points!
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">Any Other Result</h3>
              <p className="text-red-700 text-lg font-medium">0 points</p>
              <p className="text-sm text-red-600 mt-2">
                Bid 3, win 2 or 4 tricks = nothing!
              </p>
            </div>
          </div>

          <div className="mt-8 text-gray-600">
            <p className="text-lg">
              The question isn&apos;t whether you can win a trick - it&apos;s whether you can predict exactly how many you&apos;ll win.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Test Your Precision?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Whether you&apos;re a card game veteran or complete beginner, Jøssing will challenge your mind and keep you coming back for more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/how-to-play"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📚 Master the Rules
            </Link>
            <Link 
              href="/play"
              className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🎯 Start Your Challenge
            </Link>
          </div>

          <div className="mt-6">
            <p className="text-blue-100 text-lg font-medium">
              Are you precise enough to master Jøssing?
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            Built with ❤️ for card game enthusiasts everywhere
          </p>
        </div>
      </footer>
    </div>
  );
}
