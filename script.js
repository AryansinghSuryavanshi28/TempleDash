
const game = document.getElementById("game");
const player = document.getElementById("player");
const objects = document.getElementById("objects");
const scoreText = document.getElementById("score");
const coinsText = document.getElementById("coins");
const message = document.getElementById("message");

let lane = 1;
let score = 0;
let coins = 0;
let running = false;
let jumping = false;
let jumpTimer = null;
let lastTime = 0;
let spawnTimer = 0;
let coinTimer = 0;
let speed = 0.25;
let items = [];

const lanes = [25, 50, 75];

function updatePlayer() {
  player.style.left = lanes[lane] + "%";
}

function moveLeft() {
  if (running) {
    lane = Math.max(0, lane - 1);
    updatePlayer();
  }
}

function moveRight() {
  if (running) {
    lane = Math.min(2, lane + 1);
    updatePlayer();
  }
}

function jump() {
  if (!running || jumping) return;

  jumping = true;
  player.classList.add("jumping");

  clearTimeout(jumpTimer);
  jumpTimer = setTimeout(() => {
    jumping = false;
    player.classList.remove("jumping");
  }, 650);
}

document.addEventListener("keydown", event => {
  if (
    ["ArrowLeft", "ArrowRight", "ArrowUp", " "]
      .includes(event.key)
  ) {
    event.preventDefault();
  }

  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    moveLeft();
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    moveRight();
  }

  if (event.key === "ArrowUp" || event.key === " ") {
    jump();
  }
});

document.getElementById("left-btn").onclick = moveLeft;
document.getElementById("right-btn").onclick = moveRight;
document.getElementById("jump-btn").onclick = jump;

function createItem(type) {
  const element = document.createElement("div");
  element.className = "item";
  element.textContent =
    type === "coin" ? "🪙" :
    type === "rock" ? "🪨" : "🪵";

  objects.appendChild(element);

  items.push({
    element,
    type,
    lane: Math.floor(Math.random() * 3),
    depth: 0,
    collected: false
  });
}

function startGame() {
  clearTimeout(jumpTimer);

  items.forEach(item => item.element.remove());
  items = [];

  lane = 1;
  score = 0;
  coins = 0;
  speed = 0.25;
  spawnTimer = 0.5;
  coinTimer = 1;
  jumping = false;
  running = true;
  lastTime = performance.now();

  player.classList.remove("jumping");
  updatePlayer();

  scoreText.textContent = "0";
  coinsText.textContent = "0";
  message.classList.add("hidden");

  requestAnimationFrame(loop);
}

function gameOver() {
  running = false;
  message.classList.remove("hidden");

  document.getElementById("message-title").textContent =
    "GAME OVER!";

  document.getElementById("message-text").textContent =
    `Score: ${Math.floor(score)} | Coins: ${coins}`;

  document.getElementById("start-btn").textContent =
    "PLAY AGAIN";
}

function loop(time) {
  if (!running) return;

  const dt = Math.min((time - lastTime) / 1000, 0.04);
  lastTime = time;

  score += dt * 100;
  speed = Math.min(0.65, speed + dt * 0.003);

  spawnTimer -= dt;
  coinTimer -= dt;

  if (spawnTimer <= 0) {
    createItem(Math.random() < 0.5 ? "rock" : "log");
    spawnTimer = 0.8 + Math.random() * 0.7;
  }

  if (coinTimer <= 0) {
    createItem("coin");
    coinTimer = 0.8 + Math.random() * 0.7;
  }

  for (const item of items) {
    item.depth += speed * dt;

    const depth = item.depth;
    const x = lanes[item.lane];
    const y = 35 + depth * depth * 65;

    item.element.style.left = x + "%";
    item.element.style.top = y + "%";
    item.element.style.fontSize =
      (20 + depth * 30) + "px";

    if (
      !item.collected &&
      depth >= 0.88 &&
      depth < 1.03 &&
      item.lane === lane
    ) {
      if (item.type === "coin") {
        item.collected = true;
        coins++;
        score += 25;
        item.element.remove();
      } else if (!jumping) {
        gameOver();
        return;
      } else {
        item.collected = true;
        item.element.remove();
      }
    }

    if (depth > 1.1) {
      item.collected = true;
      item.element.remove();
    }
  }

  items = items.filter(item => !item.collected);

  scoreText.textContent = Math.floor(score);
  coinsText.textContent = coins;

  requestAnimationFrame(loop);
}

document.getElementById("start-btn").onclick = startGame;
