'use client';

import { useState } from 'react';

interface ReferenceSection {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
}

export default function QuickReference() {
  const [activeSection, setActiveSection] = useState('scoring');

  const sections: ReferenceSection[] = [
    {
      id: 'scoring',
      title: 'Scoring Rules',
      icon: '🎯',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-3 rounded">
            <h4 className="font-medium text-green-800 mb-2">Classic Jøssing Scoring</h4>
            <ul className="text-sm space-y-1">
              <li><strong>Exact bid:</strong> 10 + bid points</li>
              <li><strong>Any other result:</strong> 0 points</li>
              <li><strong>Simple rule:</strong> Hit your bid exactly or get nothing!</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-3 rounded">
            <h4 className="font-medium text-blue-800 mb-2">Examples</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Bid 3, Won 3:</span>
                <span className="font-mono">10 + 3 = 13 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Bid 2, Won 4:</span>
                <span className="font-mono">0 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Bid 4, Won 2:</span>
                <span className="font-mono">0 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Bid 0, Won 0:</span>
                <span className="font-mono">10 + 0 = 10 pts</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'trick-taking',
      title: 'Trick Rules',
      icon: '🃏',
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 p-3 rounded">
            <h4 className="font-medium text-yellow-800 mb-2">Playing Cards</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Must follow the lead suit if you can</li>
              <li>If you cannot follow suit, play any card</li>
              <li>Trump cards beat all non-trump cards</li>
              <li>Highest card of the lead suit wins (if no trump)</li>
              <li>Highest trump card wins (if trump played)</li>
            </ol>
          </div>
          
          <div className="bg-red-50 p-3 rounded">
            <h4 className="font-medium text-red-800 mb-2">Card Hierarchy (High to Low)</h4>
            <div className="text-sm">
              <div><strong>Trump Suit:</strong> A, K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2</div>
              <div><strong>Other Suits:</strong> A, K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2</div>
              <div className="mt-2 text-xs text-red-600">
                Remember: Any trump card beats any non-trump card!
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'bidding',
      title: 'Bidding Rules',
      icon: '🤔',
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-3 rounded">
            <h4 className="font-medium text-purple-800 mb-2">Bidding Process</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>All players write down their bids simultaneously</li>
              <li>Bids are revealed at the same time</li>
              <li>Bid must be 0 to number of cards in hand</li>
              <li>No player gets strategic advantage from bidding order</li>
            </ol>
          </div>
          
          <div className="bg-orange-50 p-3 rounded">
            <h4 className="font-medium text-orange-800 mb-2">Bidding Strategy Tips</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Count your trump cards - they are powerful</li>
              <li>Look for high cards in other suits</li>
              <li>Bid based only on your hand - you can&apos;t see others&apos; bids</li>
              <li>Zero bids are risky but can pay off</li>
              <li>Remember: being exact is more important than winning lots of tricks</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'game-flow',
      title: 'Game Structure',
      icon: '🎮',
      content: (
        <div className="space-y-4">
          <div className="bg-indigo-50 p-3 rounded">
            <h4 className="font-medium text-indigo-800 mb-2">Game Sections</h4>
            <div className="text-sm space-y-2">
              <div><strong>Up Game:</strong> Sections 1, 2, 3, 4, 5, 6, 7</div>
              <div><strong>Up-and-Down:</strong> 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1</div>
              <div className="text-xs text-indigo-600 mt-2">
                Each section number = cards per player
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-gray-800 mb-2">Section Flow</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li><strong>Deal:</strong> Give each player section number of cards</li>
              <li><strong>Trump:</strong> Randomly select trump suit</li>
              <li><strong>Bid:</strong> Players predict their tricks</li>
              <li><strong>Play:</strong> Play all tricks</li>
              <li><strong>Score:</strong> Award points based on accuracy</li>
              <li><strong>Next:</strong> Move to next section</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'tips',
      title: 'Pro Tips',
      icon: '💡',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-3 rounded">
            <h4 className="font-medium text-green-800 mb-2">Bidding Wisdom</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Trump cards are your friends - count them carefully</li>
              <li>Aces and Kings in non-trump suits usually win tricks</li>
              <li>Small cards rarely win unless they are trump</li>
              <li>Watch other players&apos; bids to adjust your strategy</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-3 rounded">
            <h4 className="font-medium text-blue-800 mb-2">Playing Smart</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Lead with your strongest suit to control the trick</li>
              <li>Save trump cards for when you really need them</li>
              <li>Remember what trump cards have been played</li>
              <li>Try to deduce other players&apos; hands from their plays</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded">
            <h4 className="font-medium text-yellow-800 mb-2">Common Mistakes</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Overbidding with mediocre hands</li>
              <li>Forgetting that exact bids get bonus points</li>
              <li>Playing trump too early or too late</li>
              <li>Not paying attention to the dealer restriction</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const activeContent = sections.find(section => section.id === activeSection);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Quick Reference</h3>
      <p className="text-gray-600 mb-6">
        Everything you need to know about Jøssing at a glance!
      </p>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t border-b-2 transition-colors ${
              activeSection === section.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span>{section.icon}</span>
            <span className="text-sm font-medium">{section.title}</span>
          </button>
        ))}
      </div>

      {/* Active section content */}
      <div className="min-h-[300px]">
        {activeContent && (
          <div>
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">{activeContent.icon}</span>
              <h4 className="text-lg font-bold">{activeContent.title}</h4>
            </div>
            {activeContent.content}
          </div>
        )}
      </div>

      {/* Download/Print hint */}
      <div className="mt-6 p-3 bg-gray-50 rounded text-center">
        <p className="text-sm text-gray-600">
          💡 Bookmark this page for quick reference during games!
        </p>
      </div>
    </div>
  );
}
