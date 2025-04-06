// import confetti from "canvas-confetti";

const ActivePlayerBg1 = document.querySelector(".player--0");
const ActivePlayerBg2 = document.querySelector(".player--1");

let player1Score = document.querySelector("#scoreofplayer0");
let player2Score = document.querySelector("#scoreofplayer1");

let NewGameBtn = document.querySelector(".newGameButton");
let DiceRollBtn = document.querySelector(".DiceRoll");
let HoldDiceBtn = document.querySelector(".HoldDice");

let CurrentScorePlayer1 = document.querySelector("#partialscore--0");

let CurrentScorePlayer2 = document.querySelector("#partialscore--1");

let bgremove = document.querySelector(".left0 ,right1");

let Dice = document.querySelector(".diceImage");

const RulesSHow = document.querySelector(".rules-box");
let PopupX = document.querySelector("#closeButton");
let showButton = document.querySelector(".tips");
const overlays = document.querySelector(".overlay");
// --------------------
const PlayerSwitch = [0, 0];
let ActivePlayer = 0;
let CurrentScore = 0;
let Playing = true;

let isComputerPlayer = true;
let isComputerTurn = false;

//switch player
const switchPlayers = function () {
  CurrentScore = 0;
  document.getElementById(`partialscore--${ActivePlayer}`).textContent = 0;
  ActivePlayer = ActivePlayer === 0 ? 1 : 0;
  ActivePlayerBg1.classList.toggle("active-player");
  ActivePlayerBg2.classList.toggle("active-player");

  // Add computer player logic
  if (isComputerPlayer && ActivePlayer === 1 && Playing) {
    isComputerTurn = true;
    setTimeout(computerPlay, 1000);
  }
};

// Dice Roll Button
DiceRollBtn.addEventListener("click", function () {
  if (Playing && !isComputerTurn) {
    Dice.classList.remove("hidden");
    let DiceRollValue = Math.floor(Math.random() * 6) + 1;
    console.log(DiceRollValue);

    Dice.src = `dice-${DiceRollValue}.png`;
    if (DiceRollValue !== 1) {
      CurrentScore = CurrentScore + DiceRollValue;
      document.getElementById(`partialscore--${ActivePlayer}`).textContent =
        CurrentScore;
    } else {
      switchPlayers();
    }
  }
});

NewGameBtn.addEventListener("click", function () {
  player1Score.textContent = 0;
  player2Score.textContent = 0;
  Dice.classList.add("hidden");
  CurrentScorePlayer1.textContent = 0;
  CurrentScorePlayer2.textContent = 0;

  document
    .querySelector(`.player--${ActivePlayer}`)
    .classList.remove("player-winner1");

  PlayerSwitch[0] = 0;
  PlayerSwitch[1] = 0;
  ActivePlayer = 0;
  CurrentScore = 0;

  ActivePlayerBg2.classList.remove("active-player");
  ActivePlayerBg1.classList.remove("active-player");
  ActivePlayerBg1.classList.add("active-player");
  isComputerTurn = false;
  Playing = true;

  // Update player labels
  document.querySelector("#player-0").textContent = "Player";
  document.querySelector("#player-1").textContent = "Computer";
});

HoldDiceBtn.addEventListener("click", function () {
  if (Playing && !isComputerTurn) {
    PlayerSwitch[ActivePlayer] += CurrentScore;
    document.getElementById(`scoreofplayer${ActivePlayer}`).textContent =
      PlayerSwitch[ActivePlayer];
    if (PlayerSwitch[ActivePlayer] >= 50) {
      Playing = false;
      // document
      //   .querySelector(`.left${ActivePlayer}, .right${ActivePlayer}`)
      //   .classList.add("player-winner1");

      document
        .querySelector(`.player--${ActivePlayer}`)
        .classList.add("player-winner1");

      // document.querySelector(`.player--${ActivePlayer}`).style.backgroundColor =
      //   "#2f2f2f";
      ActivePlayerBg1.classList.remove("active-player");
      ActivePlayerBg2.classList.remove("active-player");

      showWinningAnimation(ActivePlayer + 1);
    } else {
      switchPlayers();
    }
  }
});

showButton.addEventListener("click", function () {
  RulesSHow.classList.remove("hide");
  overlays.style.display = "block";
});

PopupX.addEventListener("click", function () {
  RulesSHow.classList.add("hide");
  overlays.style.display = "";
});

document.addEventListener("keydown", function (e) {
  console.log(e.key);
  if (e.key === "Escape") {
    overlays.style.display = "";
    RulesSHow.classList.add("hide");
  }
});

function closeRulesBox() {
  overlays.style.display = "";
  RulesSHow.classList.add("hide");
}
overlays.addEventListener("click", closeRulesBox);

function showWinningAnimation(playerNumber) {
  // Create overlay and popup
  const overlay = document.createElement("div");
  overlay.className = "winner-overlay";

  const popup = document.createElement("div");
  popup.className = "winner-popup";
  if (playerNumber === 1) {
    popup.innerHTML = `<h2>Player 1 Wins! 🎉</h2>`;
  } else {
    popup.innerHTML = `<h2>AI Wins! 🤖🎉</h2>`;
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

  // Automatically reset game after 5 seconds
  setTimeout(() => {
    // Remove popup and overlay
    overlay.remove();
    popup.remove();

    // Reset game (reuse existing NewGameBtn click logic)
    NewGameBtn.click();
  }, 5000);
}

// Add computer player function
function computerPlay() {
  if (!Playing || !isComputerTurn) return;

  function calculateRiskFactor() {
    const computerScore = PlayerSwitch[1];
    const playerScore = PlayerSwitch[0];
    const scoreDiff = playerScore - computerScore;
    const pointsToWin = 50 - computerScore;

    // Dynamic strategy based on game state
    if (playerScore >= 45) return 30; // Very aggressive if player is about to win
    if (pointsToWin <= 15) return 10; // Conservative when close to winning
    if (scoreDiff > 15) return 25; // Aggressive when falling behind
    if (computerScore > playerScore) {
      // Adaptive when leading
      return Math.min(20, pointsToWin); // Don't overreach
    }
    return 20; // Default balanced approach
  }

  function shouldContinueRolling() {
    const computerScore = PlayerSwitch[1];
    const playerScore = PlayerSwitch[0];
    const winningMove = computerScore + CurrentScore >= 50;
    const scoreDiff = playerScore - computerScore;

    // Force holding in these cases
    if (winningMove) return false; // Hold if we can win
    if (CurrentScore >= 20) return false; // Cap at 20 points per turn
    if (computerScore + CurrentScore >= 45) return false; // Hold when close to winning

    // Risk assessment - more conservative
    if (CurrentScore <= 5) return true; // Always roll at least twice

    // Standard risk cases
    const baseThreshold = 12; // Base target score
    const adjustedTarget = baseThreshold + (scoreDiff > 10 ? 4 : 0); // More aggressive if behind

    // Conservative when ahead, aggressive when behind
    if (computerScore > playerScore && CurrentScore >= 10) return false;
    if (scoreDiff > 15 && CurrentScore < 15) return true;

    return CurrentScore < adjustedTarget;
  }

  function rollDice() {
    if (!Playing) return;

    Dice.classList.remove("hidden");
    const DiceRollValue = Math.floor(Math.random() * 6) + 1;
    Dice.src = `dice-${DiceRollValue}.png`;

    if (DiceRollValue !== 1) {
      CurrentScore += DiceRollValue;
      document.getElementById(`partialscore--${ActivePlayer}`).textContent =
        CurrentScore;

      // Decision making
      if (shouldContinueRolling()) {
        setTimeout(rollDice, 800); // Faster rolls for better gameplay
      } else {
        setTimeout(() => {
          // Hold points
          PlayerSwitch[ActivePlayer] += CurrentScore;
          document.getElementById(`scoreofplayer${ActivePlayer}`).textContent =
            PlayerSwitch[ActivePlayer];

          if (PlayerSwitch[ActivePlayer] >= 50) {
            Playing = false;
            document
              .querySelector(`.player--${ActivePlayer}`)
              .classList.add("player-winner1");
            ActivePlayerBg1.classList.remove("active-player");
            ActivePlayerBg2.classList.remove("active-player");
            showWinningAnimation(ActivePlayer + 1);
          } else {
            switchPlayers();
          }
          isComputerTurn = false;
        }, 1000);
      }
    } else {
      setTimeout(() => {
        switchPlayers();
        isComputerTurn = false;
      }, 1000);
    }
  }

  setTimeout(rollDice, 1000);
}

// In your existing game logic where you determine the winner:
if (PlayerSwitch[ActivePlayer] >= 50) {
  Playing = false;
  showWinningAnimation(ActivePlayer + 1);
  // ... rest of your winning logic
}
