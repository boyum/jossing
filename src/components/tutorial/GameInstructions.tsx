'use client';

export default function GameInstructions() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-6">How to Play Jøssing</h3>
      
      {/* Game Overview */}
      <section className="mb-8">
        <h4 className="text-xl font-semibold mb-4 text-blue-700">Game Overview</h4>
        <p className="text-gray-700 mb-4">
          Jøssing is a Norwegian trick-taking card game where the goal is not to win as many tricks as possible, 
          but to bid exactly how many tricks you think you&apos;ll win. Accuracy is rewarded, while being wrong 
          costs you points!
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Players:</strong> 2-6 players<br/>
            <strong>Deck:</strong> Standard 52-card deck<br/>
            <strong>Game Length:</strong> 7 sections (Up game) or 13 sections (Up-and-Down game)
          </p>
        </div>
      </section>

      {/* Game Setup */}
      <section className="mb-8">
        <h4 className="text-xl font-semibold mb-4 text-blue-700">Game Setup</h4>
        <ol className="list-decimal list-inside space-y-3 text-gray-700">
          <li>
            <strong>Choose Game Type:</strong>
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li><strong>Up Game:</strong> Play sections 1, 2, 3, 4, 5, 6, 7 (each player gets that many cards)</li>
              <li><strong>Up-and-Down Game:</strong> Play 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1</li>
            </ul>
          </li>
          <li>
            <strong>Deal Cards:</strong> In section N, each player receives N cards. Remaining cards form the deck.
          </li>
          <li>
            <strong>Determine Trump:</strong> Randomly select one of the four suits (♠♥♦♣) as trump for this section.
            <div className="bg-yellow-50 p-2 rounded mt-2">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Trump suit changes every section and all cards are reshuffled between sections.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* Bidding Phase */}
      <section className="mb-8">
        <h4 className="text-xl font-semibold mb-4 text-blue-700">Bidding Phase</h4>
        <p className="text-gray-700 mb-4">
          Each player must predict exactly how many tricks they will win this section.
        </p>
        <ol className="list-decimal list-inside space-y-3 text-gray-700">
          <li>
            <strong>Simultaneous Bidding:</strong> All players write down their bids at the same time and reveal them simultaneously.
          </li>
          <li>
            <strong>Bid Range:</strong> You can bid from 0 to the number of cards in your hand.
          </li>
          <li>
            <strong>No Strategic Advantage:</strong> Since everyone bids at once, no player can adjust their bid based on others&apos; choices.
            <div className="bg-blue-50 p-2 rounded mt-2">
              <p className="text-sm text-blue-800">
                <strong>Result:</strong> This often leads to situations where the group collectively underbids or overbids, 
                but that&apos;s part of the challenge and fun of Jøssing!
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* Playing Phase */}
      <section className="mb-8">
        <h4 className="text-xl font-semibold mb-4 text-blue-700">Playing Tricks</h4>
        <p className="text-gray-700 mb-4">
          Now players take turns playing cards to win tricks, following standard trick-taking rules.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-semibold mb-3 text-gray-800">Card Playing Rules</h5>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li><strong>Lead:</strong> The player to the left of the dealer leads the first trick</li>
              <li><strong>Follow Suit:</strong> You must play a card of the same suit as the lead card if you have one</li>
              <li><strong>No Suit:</strong> If you don&apos;t have the lead suit, you may play any card</li>
              <li><strong>Trump Power:</strong> Trump cards beat all non-trump cards, regardless of rank</li>
              <li><strong>Winning:</strong> Highest card of the lead suit wins, unless a trump is played</li>
              <li><strong>Next Lead:</strong> Winner of each trick leads the next trick</li>
            </ol>
          </div>
          
          <div>
            <h5 className="font-semibold mb-3 text-gray-800">Card Hierarchy</h5>
            <div className="space-y-2 text-sm">
              <div className="bg-yellow-50 p-2 rounded">
                <p className="font-medium text-yellow-800">Trump Suit:</p>
                <p className="text-yellow-700">A &gt; K &gt; Q &gt; J &gt; 10 &gt; 9 &gt; 8 &gt; 7 &gt; 6 &gt; 5 &gt; 4 &gt; 3 &gt; 2</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-medium text-gray-800">All Other Suits:</p>
                <p className="text-gray-700">A &gt; K &gt; Q &gt; J &gt; 10 &gt; 9 &gt; 8 &gt; 7 &gt; 6 &gt; 5 &gt; 4 &gt; 3 &gt; 2</p>
              </div>
            </div>
            <p className="text-xs text-red-600 mt-2">
              Remember: Any trump card beats any non-trump card!
            </p>
          </div>
        </div>
      </section>

      {/* Scoring */}
      <section className="mb-8">
        <h4 className="text-xl font-semibold mb-4 text-blue-700">Scoring System</h4>
        <p className="text-gray-700 mb-4">
          Points are awarded only for exact bids (except for zero bids which have special rules). 
          If you bid incorrectly, you get zero points for that section.
        </p>
        
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <h5 className="font-semibold text-green-800 mb-2">Scoring Formula</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span><strong>Exact Bid:</strong></span>
              <span className="font-mono">10 + bid</span>
            </div>
            <div className="flex justify-between">
              <span><strong>Wrong Bid (Over/Under):</strong></span>
              <span className="font-mono">0 points</span>
            </div>
          </div>
          <p className="text-xs text-green-700 mt-2">
            <strong>Note:</strong> Zero bids follow the same rule - if you bid 0 and win 0 tricks, you get 10 + 0 = 10 points.
          </p>
        </div>

        <div className="space-y-3">
          <h5 className="font-semibold text-gray-800">Scoring Examples</h5>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white border border-gray-200 p-3 rounded">
              <p className="font-medium text-green-700">Perfect Bid: Bid 3, Won 3</p>
              <p>Exact bid: 10 + 3 = 13 points</p>
              <p className="font-bold text-green-600">Total: 13 points</p>
            </div>
            
            <div className="bg-white border border-gray-200 p-3 rounded">
              <p className="font-medium text-red-700">Overbid: Bid 4, Won 2</p>
              <p>Wrong bid (4 ≠ 2)</p>
              <p className="font-bold text-red-600">Total: 0 points</p>
            </div>
            
            <div className="bg-white border border-gray-200 p-3 rounded">
              <p className="font-medium text-green-700">Zero Success: Bid 0, Won 0</p>
              <p>Exact bid: 10 + 0 = 10 points</p>
              <p className="font-bold text-green-600">Total: 10 points</p>
            </div>
            
            <div className="bg-white border border-gray-200 p-3 rounded">
              <p className="font-medium text-red-700">Underbid: Bid 2, Won 4</p>
              <p>Wrong bid (2 ≠ 4)</p>
              <p className="font-bold text-red-600">Total: 0 points</p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Tips */}
      <section className="mb-8">
        <h4 className="text-xl font-semibold mb-4 text-blue-700">Strategy Tips</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-semibold mb-3 text-gray-800">Bidding Strategy</h5>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>Count your trump cards - they are very powerful</li>
              <li>Aces and Kings in non-trump suits usually win tricks</li>
              <li>Small cards (2-6) rarely win unless they are trump</li>
              <li>Since bidding is simultaneous, focus only on your hand</li>
              <li>You can&apos;t adjust based on others&apos; bids - trust your analysis</li>
              <li>Zero bids are safer now - you only need 10 points if successful</li>
              <li>Remember: exact bids get you 10 + your bid points!</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-3 text-gray-800">Playing Strategy</h5>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>Lead with your strongest suit to control tricks</li>
              <li>Save trump cards for when you really need them</li>
              <li>Keep track of which trump cards have been played</li>
              <li>Try to deduce other players&apos; hands from their plays</li>
              <li>Sometimes it&apos;s better to lose a trick than win one</li>
              <li>Watch for opportunities to force others off their bids</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Winning */}
      <section className="mb-8">
        <h4 className="text-xl font-semibold mb-4 text-blue-700">Winning the Game</h4>
        <p className="text-gray-700 mb-4">
          After all sections are complete, add up each player&apos;s total points from all sections. 
          The player with the highest total score wins!
        </p>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-800">
            <strong>Pro Tip:</strong> Consistency is key in Jøssing. Higher bids give more points (10 + bid), 
            but only if you&apos;re exactly right. It&apos;s often better to make safe, accurate bids 
            than to go for high-risk plays that might give you zero points.
          </p>
        </div>
      </section>

      {/* Quick Reference */}
      <section>
        <h4 className="text-xl font-semibold mb-4 text-blue-700">Quick Reference</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h6 className="font-semibold text-gray-800 mb-2">Section Flow</h6>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Deal cards</li>
                <li>Set trump suit</li>
                <li>Bid tricks</li>
                <li>Play tricks</li>
                <li>Score points</li>
                <li>Next section</li>
              </ol>
            </div>
            
            <div>
              <h6 className="font-semibold text-gray-800 mb-2">Card Rules</h6>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Follow suit if possible</li>
                <li>Trump beats non-trump</li>
                <li>High card wins trick</li>
                <li>Winner leads next</li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-semibold text-gray-800 mb-2">Scoring</h6>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Exact bid: 10 + bid</li>
                <li>Wrong bid: 0 points</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
