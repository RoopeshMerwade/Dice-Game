// Game Elements
const ActivePlayerBg1 = document.querySelector(".player--0");
const ActivePlayerBg2 = document.querySelector(".player--1");
const player1Score = document.querySelector("#scoreofplayer0");
const player2Score = document.querySelector("#scoreofplayer1");
const NewGameBtn = document.querySelector(".newGameButton");
const DiceRollBtn = document.querySelector(".DiceRoll");
const HoldDiceBtn = document.querySelector(".HoldDice");
const CurrentScorePlayer1 = document.querySelector("#partialscore--0");
const CurrentScorePlayer2 = document.querySelector("#partialscore--1");
const Dice = document.querySelector(".diceImage");
const RulesSHow = document.querySelector(".rules-box");
const PopupX = document.querySelector("#closeButton");
const showButton = document.querySelector(".tips");
const overlays = document.querySelector(".overlay");

// Create difficulty buttons dynamically
const difficultyContainer = document.createElement("div");
difficultyContainer.className = "difficulty-container";
difficultyContainer.innerHTML = `
  <h3>AI Difficulty</h3>
  <div class="difficulty-buttons">
    <button class="difficulty-btn active" data-difficulty="easy">Easy</button>
    <button class="difficulty-btn" data-difficulty="medium">Medium</button>
    <button class="difficulty-btn" data-difficulty="hard">Hard</button>
  </div>
`;

// Add styles for difficulty buttons
const style = document.createElement("style");
style.textContent = `
  .difficulty-container {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 100;
  }

  .difficulty-container h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #333;
    text-align: center;
  }

  .difficulty-buttons {
    display: flex;
    gap: 5px;
    flex-direction: column;
  }

  .difficulty-btn {
    padding: 8px 12px;
    border: 2px solid #ddd;
    background: white;
    color: #333;
    border-radius: 5px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    transition: all 0.2s ease;
    min-width: 70px;
  }

  .difficulty-btn:hover {
    background: #f0f0f0;
    transform: translateY(-1px);
  }

  .difficulty-btn.active {
    background: #4CAF50;
    color: white;
    border-color: #45a049;
  }

  .difficulty-btn.easy.active {
    background: #4CAF50;
    border-color: #45a049;
  }

  .difficulty-btn.medium.active {
    background: #FF9800;
    border-color: #F57C00;
  }

  .difficulty-btn.hard.active {
    background: #f44336;
    border-color: #d32f2f;
  }

  @media (max-width: 768px) {
    .difficulty-container {
      top: 10px;
      right: 10px;
      padding: 10px;
    }
    
    .difficulty-buttons {
      flex-direction: row;
    }
    
    .difficulty-btn {
      padding: 6px 8px;
      font-size: 10px;
      min-width: 50px;
    }
  }
`;

document.head.appendChild(style);
document.body.appendChild(difficultyContainer);

// Game State
class GameState {
  constructor() {
    this.playerScores = [0, 0];
    this.activePlayer = 0;
    this.currentScore = 0;
    this.isPlaying = true;
    this.isComputerTurn = false;
    this.difficulty = 'medium';
    this.gameStats = {
      gamesPlayed: 0,
      playerWins: 0,
      aiWins: 0,
      totalRolls: 0,
      highestSingleTurn: 0
    };
  }

  reset() {
    this.playerScores = [0, 0];
    this.activePlayer = 0;
    this.currentScore = 0;
    this.isPlaying = true;
    this.isComputerTurn = false;
  }

  switchPlayer() {
    this.currentScore = 0;
    document.getElementById(`partialscore--${this.activePlayer}`).textContent = 0;
    this.activePlayer = this.activePlayer === 0 ? 1 : 0;
    ActivePlayerBg1.classList.toggle("active-player");
    ActivePlayerBg2.classList.toggle("active-player");

    if (this.activePlayer === 1 && this.isPlaying) {
      this.isComputerTurn = true;
      setTimeout(() => computerAI.play(), 1000);
    }
  }

  addScore(points) {
    this.currentScore += points;
    this.gameStats.totalRolls++;
    if (this.currentScore > this.gameStats.highestSingleTurn) {
      this.gameStats.highestSingleTurn = this.currentScore;
    }
    document.getElementById(`partialscore--${this.activePlayer}`).textContent = this.currentScore;
  }

  holdScore() {
    this.playerScores[this.activePlayer] += this.currentScore;
    document.getElementById(`scoreofplayer${this.activePlayer}`).textContent = this.playerScores[this.activePlayer];
    
    if (this.playerScores[this.activePlayer] >= 50) {
      this.endGame();
    } else {
      this.switchPlayer();
    }
  }

  endGame() {
    this.isPlaying = false;
    this.gameStats.gamesPlayed++;
    
    if (this.activePlayer === 0) {
      this.gameStats.playerWins++;
    } else {
      this.gameStats.aiWins++;
    }

    document.querySelector(`.player--${this.activePlayer}`).classList.add("player-winner1");
    ActivePlayerBg1.classList.remove("active-player");
    ActivePlayerBg2.classList.remove("active-player");
    
    showWinningAnimation(this.activePlayer + 1);
  }
}

// AI Strategy Classes
class AIStrategy {
  constructor(name, riskLevel) {
    this.name = name;
    this.riskLevel = riskLevel;
  }

  shouldContinueRolling(gameState) {
    return false; // Override in subclasses
  }
}

class EasyAI extends AIStrategy {
  constructor() {
    super('Easy', 0.3);
  }

  shouldContinueRolling(gameState) {
    const { currentScore, playerScores } = gameState;
    const aiScore = playerScores[1];
    
    // Very conservative - holds early
    if (currentScore >= 8) return false;
    if (aiScore + currentScore >= 50) return false;
    
    return currentScore < 6;
  }
}

class MediumAI extends AIStrategy {
  constructor() {
    super('Medium', 0.5);
  }

  shouldContinueRolling(gameState) {
    const { currentScore, playerScores } = gameState;
    const aiScore = playerScores[1];
    const playerScore = playerScores[0];
    const scoreDiff = playerScore - aiScore;
    
    // Win immediately if possible
    if (aiScore + currentScore >= 50) return false;
    
    // Conservative when ahead
    if (aiScore > playerScore && currentScore >= 10) return false;
    
    // More aggressive when behind
    if (scoreDiff > 10) {
      return currentScore < 18;
    }
    
    // Endgame strategy
    if (playerScore >= 40) {
      return currentScore < 15;
    }
    
    return currentScore < 12;
  }
}

class HardAI extends AIStrategy {
  constructor() {
    super('Hard', 0.7);
  }

  shouldContinueRolling(gameState) {
    const { currentScore, playerScores } = gameState;
    const aiScore = playerScores[1];
    const playerScore = playerScores[0];
    const scoreDiff = playerScore - aiScore;
    const pointsToWin = 50 - aiScore;
    
    // Win immediately if possible
    if (aiScore + currentScore >= 50) return false;
    
    // Dynamic risk assessment
    let targetScore = 15;
    
    // Adjust based on game state
    if (playerScore >= 45) targetScore = 20; // Very aggressive
    else if (playerScore >= 35) targetScore = 18; // Aggressive
    else if (scoreDiff > 15) targetScore = 20; // Catch up mode
    else if (aiScore > playerScore) targetScore = 12; // Conservative when ahead
    
    // Cap maximum risk
    if (currentScore >= 25) return false;
    
    // Minimum rolls unless winning
    if (currentScore <= 3 && pointsToWin > 3) return true;
    
    return currentScore < targetScore;
  }
}

// Computer AI Controller
class ComputerAI {
  constructor() {
    this.strategies = {
      easy: new EasyAI(),
      medium: new MediumAI(),
      hard: new HardAI()
    };
    this.currentStrategy = this.strategies.easy; // Start with easy
  }

  setDifficulty(difficulty) {
    this.currentStrategy = this.strategies[difficulty] || this.strategies.easy;
    gameState.difficulty = difficulty;
    
    // Update button styles
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.difficulty === difficulty) {
        btn.classList.add('active');
        btn.classList.add(difficulty);
      }
    });
    
    // Update player label
    document.querySelector("#player-1").textContent = `AI (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`;
    
    console.log(`AI difficulty set to: ${this.currentStrategy.name}`);
  }

  play() {
    if (!gameState.isPlaying || !gameState.isComputerTurn) return;
    
    setTimeout(() => this.rollDice(), 1000);
  }

  rollDice() {
    if (!gameState.isPlaying) return;

    Dice.classList.remove("hidden");
    const diceValue = Math.floor(Math.random() * 6) + 1;
    Dice.src = `dice-${diceValue}.png`;

    if (diceValue !== 1) {
      gameState.addScore(diceValue);
      
      if (this.currentStrategy.shouldContinueRolling(gameState)) {
        setTimeout(() => this.rollDice(), 1200);
      } else {
        setTimeout(() => {
          gameState.holdScore();
          gameState.isComputerTurn = false;
        }, 1500);
      }
    } else {
      setTimeout(() => {
        gameState.switchPlayer();
        gameState.isComputerTurn = false;
      }, 1500);
    }
  }
}

// Initialize game components
const gameState = new GameState();
const computerAI = new ComputerAI();

// Event Handlers
DiceRollBtn.addEventListener("click", function() {
  if (gameState.isPlaying && !gameState.isComputerTurn) {
    Dice.classList.remove("hidden");
    const diceValue = Math.floor(Math.random() * 6) + 1;
    console.log(`Player rolled: ${diceValue}`);

    Dice.src = `dice-${diceValue}.png`;
    
    if (diceValue !== 1) {
      gameState.addScore(diceValue);
    } else {
      gameState.switchPlayer();
    }
  }
});

HoldDiceBtn.addEventListener("click", function() {
  if (gameState.isPlaying && !gameState.isComputerTurn) {
    gameState.holdScore();
  }
});

NewGameBtn.addEventListener("click", function() {
  // Reset UI
  player1Score.textContent = 0;
  player2Score.textContent = 0;
  CurrentScorePlayer1.textContent = 0;
  CurrentScorePlayer2.textContent = 0;
  Dice.classList.add("hidden");
  
  // Remove winner styling
  document.querySelector(`.player--${gameState.activePlayer}`)?.classList.remove("player-winner1");
  
  // Reset game state
  gameState.reset();
  
  // Reset player styling
  ActivePlayerBg1.classList.remove("active-player");
  ActivePlayerBg2.classList.remove("active-player");
  ActivePlayerBg1.classList.add("active-player");
  
  // Update labels
  document.querySelector("#player-0").textContent = "Player";
  document.querySelector("#player-1").textContent = `AI (${gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1)})`;
  
  console.log("New game started");
});

// Rules popup handlers
showButton.addEventListener("click", function() {
  RulesSHow.classList.remove("hide");
  overlays.style.display = "block";
});

PopupX.addEventListener("click", function() {
  RulesSHow.classList.add("hide");
  overlays.style.display = "";
});

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    overlays.style.display = "";
    RulesSHow.classList.add("hide");
  }
});

overlays.addEventListener("click", function() {
  overlays.style.display = "";
  RulesSHow.classList.add("hide");
});

// Difficulty selection (keyboard shortcuts)
document.addEventListener("keydown", function(e) {
  if (e.key === "1") computerAI.setDifficulty("easy");
  if (e.key === "2") computerAI.setDifficulty("medium");
  if (e.key === "3") computerAI.setDifficulty("hard");
});

function showWinningAnimation(playerNumber) {
  const overlay = document.createElement("div");
  overlay.className = "winner-overlay";

  const popup = document.createElement("div");
  popup.className = "winner-popup";
  
  const stats = gameState.gameStats;
  const winRate = stats.gamesPlayed > 0 ? ((stats.playerWins / stats.gamesPlayed) * 100).toFixed(1) : 0;
  
  if (playerNumber === 1) {
    popup.innerHTML = `
      <h2>Player Wins! 🎉</h2>
      <p>Win Rate: ${winRate}% (${stats.playerWins}/${stats.gamesPlayed})</p>
    `;
  } else {
    popup.innerHTML = `
      <h2>AI Wins! 🤖</h2>
      <p>AI Win Rate: ${(100 - winRate).toFixed(1)}% (${stats.aiWins}/${stats.gamesPlayed})</p>
    `;
  }

  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  // Trigger confetti
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
  });

  // Auto-reset after 4 seconds
  setTimeout(() => {
    overlay.remove();
    popup.remove();
    NewGameBtn.click();
  }, 4000);
}

// Initialize game
gameState.difficulty = 'easy'; // Set initial difficulty
computerAI.setDifficulty('easy'); // Set AI to easy mode initially
document.querySelector("#player-1").textContent = `AI (Easy)`;
console.log("Dice Game Initialized");
console.log("Use difficulty buttons or press 1/2/3 to change AI difficulty (Easy/Medium/Hard)");
