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

//switch player
const switchPlayers = function () {
  CurrentScore = 0;
  document.getElementById(`partialscore--${ActivePlayer}`).textContent = 0;
  ActivePlayer = ActivePlayer === 0 ? 1 : 0;
  ActivePlayerBg1.classList.toggle("active-player");
  ActivePlayerBg2.classList.toggle("active-player");
};

// Dice Roll Button
DiceRollBtn.addEventListener("click", function () {
  if (Playing) {
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
  Playing = true;
});

HoldDiceBtn.addEventListener("click", function () {
  if (Playing) {
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
  popup.innerHTML = `<h2>Player ${playerNumber} Wins! 🎉</h2>`;

  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  // Trigger confetti
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
  });

  // Remove popup after 3 seconds
  setTimeout(() => {
    overlay.remove();
    popup.remove();
  }, 3000);
}

// In your existing game logic where you determine the winner:
if (PlayerSwitch[ActivePlayer] >= 100) {
  showWinningAnimation(ActivePlayer + 1);
  // ... rest of your winning logic
}
