/* ============================================
   WASHOKU WORLD – script.js
   Japanese Food Minigame Website
   ============================================ */

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('washoku-theme') || 'light';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('washoku-theme', next);
});

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) current = s.getAttribute('id');
  });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
});

// ===== SAKURA PETALS =====
const sakuraContainer = document.getElementById('sakuraContainer');

function createSakura() {
  const petal = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  petal.setAttribute('viewBox', '0 0 20 20');
  petal.setAttribute('width', '12');
  petal.setAttribute('height', '12');
  petal.innerHTML = `<path d="M10 1 C10 1 14 5 10 10 C6 5 10 1 10 1Z M10 1 C10 1 15 4 13 9 C8 7 10 1 10 1Z M10 1 C10 1 16 7 12 11 C8 8 10 1 10 1Z M10 10 C10 10 10 16 10 18 C10 16 10 10 10 10Z" fill="rgba(188,0,45,0.5)"/>`;

  const div = document.createElement('div');
  div.className = 'sakura';
  div.appendChild(petal);

  const startX = Math.random() * window.innerWidth;
  const duration = 6 + Math.random() * 8;
  const delay = Math.random() * 10;
  const size = 8 + Math.random() * 14;

  div.style.cssText = `
    left: ${startX}px;
    width: ${size}px;
    height: ${size}px;
    animation-duration: ${duration}s;
    animation-delay: ${delay}s;
  `;

  sakuraContainer.appendChild(div);
  setTimeout(() => div.remove(), (duration + delay) * 1000);
}

// Create sakura petals periodically
setInterval(createSakura, 800);
for (let i = 0; i < 8; i++) createSakura(); // Initial burst

// ===== GAME STATE =====
const gameState = {
  quiz: { completed: false, won: false },
  memory: { completed: false, won: false },
  spot: { completed: false, won: false },
};

// ===== GAME MODAL CONTROL =====
function openGame(type) {
  const modal = document.getElementById(type + 'Modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (type === 'quiz') initQuiz();
  if (type === 'memory') initMemory();
  if (type === 'spot') initSpot();
}

function closeGame(type) {
  const modal = document.getElementById(type + 'Modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';

  if (type === 'memory') stopMemoryTimer();
}

// ===== REWARD SYSTEM =====
function showReward(allComplete) {
  const modal = document.getElementById('rewardModal');
  const title = document.getElementById('rewardTitle');
  const msg = document.getElementById('rewardMsg');
  const icon = document.getElementById('rewardIcon');

  if (allComplete) {
    title.textContent = 'Amazing!';
    msg.textContent = 'You completed all 3 games! Enjoy your FREE candy!';
    icon.textContent = '🎉';
  } else {
    title.textContent = 'Congratulations!';
    msg.textContent = 'You got 1 FREE candy! Keep playing for more rewards!';
    icon.textContent = '🍬';
  }

  modal.classList.add('open');
  spawnConfetti();
}

function closeReward() {
  document.getElementById('rewardModal').classList.remove('open');
}

function spawnConfetti() {
  const container = document.getElementById('rewardConfetti');
  container.innerHTML = '';
  const colors = ['#BC002D', '#ffffff', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'];

  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${1 + Math.random() * 1.5}s;
      animation-delay: ${Math.random() * 0.5}s;
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    container.appendChild(piece);
  }
}

function checkAllGamesComplete() {
  const allWon = Object.values(gameState).every(g => g.won);
  if (allWon) {
    setTimeout(() => showReward(true), 600);
  }
}

function onGameWon(type) {
  gameState[type].won = true;
  gameState[type].completed = true;
  setTimeout(() => showReward(false), 800);
  checkAllGamesComplete();
}

// ===================================
// ===== QUIZ GAME ===================
// ===================================

const quizData = [
  {
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80',
    question: 'What is this Japanese food?',
    options: ['Sashimi', 'Nigiri Sushi', 'Onigiri', 'Maki Roll'],
    answer: 1,
  },
  {
    image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80',
    question: 'What is this colorful sushi platter called?',
    options: ['Chirashi Don', 'Omakase Set', 'Kaiseki', 'Bento'],
    answer: 0,
  },
  {
    image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80',
    question: 'This noodle soup dish is called?',
    options: ['Udon', 'Soba', 'Ramen', 'Pho'],
    answer: 2,
  },
  {
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
    question: 'What is this traditional Japanese dish?',
    options: ['Tempura', 'Tonkatsu', 'Karaage', 'Gyoza'],
    answer: 0,
  },
  {
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    question: 'This round-shaped item is a popular Japanese?',
    options: ['Daifuku', 'Dorayaki', 'Mochi', 'Wagashi'],
    answer: 2,
  },
];

let quizState = {
  current: 0,
  score: 0,
  answered: false,
};

function initQuiz() {
  quizState = { current: 0, score: 0, answered: false };
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const content = document.getElementById('quizContent');
  const q = quizData[quizState.current];
  const total = quizData.length;
  const pct = (quizState.current / total) * 100;

  content.innerHTML = `
    <div class="quiz-header">
      <h2>Guess the Food</h2>
      <div class="quiz-progress">
        <span style="font-size:0.82rem;color:var(--text-3)">Q${quizState.current + 1}/${total}</span>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span class="quiz-score-display">Score: ${quizState.score}</span>
      </div>
    </div>
    <img class="quiz-img" src="${q.image}" alt="Food Question" />
    <p class="quiz-question">${q.question}</p>
    <div class="quiz-options">
      ${q.options.map((opt, i) => `
        <button class="quiz-option" onclick="selectQuizOption(${i})" id="qopt-${i}">
          ${opt}
        </button>
      `).join('')}
    </div>
    <div class="quiz-feedback" id="quizFeedback"></div>
    <button class="btn btn-primary btn-full quiz-next" id="quizNext" onclick="quizNext()">${quizState.current < total - 1 ? 'Next Question →' : 'See Results'}</button>
  `;
}

function selectQuizOption(index) {
  if (quizState.answered) return;
  quizState.answered = true;

  const q = quizData[quizState.current];
  const feedback = document.getElementById('quizFeedback');
  const nextBtn = document.getElementById('quizNext');

  document.querySelectorAll('.quiz-option').forEach(btn => btn.disabled = true);

  if (index === q.answer) {
    document.getElementById('qopt-' + index).classList.add('correct');
    feedback.textContent = '✓ Correct! Well done!';
    feedback.className = 'quiz-feedback correct-fb';
    quizState.score++;
  } else {
    document.getElementById('qopt-' + index).classList.add('wrong');
    document.getElementById('qopt-' + q.answer).classList.add('correct');
    feedback.textContent = `✗ The answer was: ${q.options[q.answer]}`;
    feedback.className = 'quiz-feedback wrong-fb';
  }

  nextBtn.style.display = 'flex';
}

function quizNext() {
  quizState.current++;
  quizState.answered = false;

  if (quizState.current >= quizData.length) {
    renderQuizResult();
  } else {
    renderQuizQuestion();
  }
}

function renderQuizResult() {
  const content = document.getElementById('quizContent');
  const won = quizState.score >= 4;

  content.innerHTML = `
    <div class="quiz-result">
      <div class="result-icon">${won ? '🏆' : '😅'}</div>
      <h2 class="result-title ${won ? 'win' : 'lose'}">${won ? 'You Win!' : 'Almost!'}</h2>
      <p class="result-score">You scored <strong>${quizState.score}/5</strong>${won ? ' — Amazing knowledge!' : ' — Need 4/5 to win. Try again!'}</p>
      <button class="btn btn-primary" onclick="initQuiz()" style="margin:0 auto">Play Again</button>
    </div>
  `;

  if (won && !gameState.quiz.won) {
    onGameWon('quiz');
  }
  gameState.quiz.completed = true;
}

// ===================================
// ===== MEMORY GAME =================
// ===================================

const memoryImages = [
  { id: 1, url: 'https://6a04719546fc04f7c2e1aca4.imgix.net/JapaneseFood/MISO.png?w=2000&h=2000', name: 'Miso' },
  { id: 2, url: 'https://6a04719546fc04f7c2e1aca4.imgix.net/JapaneseFood/download?w=2000&h=2000', name: 'Takoyaki' },
  { id: 3, url: 'https://6a04719546fc04f7c2e1aca4.imgix.net/JapaneseFood/TEMPURA.png?w=2000&h=2000', name: 'Tempura' },
  { id: 4, url: 'https://6a04719546fc04f7c2e1aca4.imgix.net/JapaneseFood/MOCHI.png?w=2000&h=2000', name: 'Mochi' },
  { id: 5, url: 'https://6a04719546fc04f7c2e1aca4.imgix.net/JapaneseFood/OKONOMIYAKI.png?w=2000&h=2000', name: 'Okonomiyaki' },
  { id: 6, url: 'https://6a04719546fc04f7c2e1aca4.imgix.net/JapaneseFood/ONIGIRI.png?w=2000&h=2000', name: 'Onigiri' },
  { id: 7, url: 'https://6a04719546fc04f7c2e1aca4.imgix.net/JapaneseFood/RAMEN.png?w=2000&h=2000', name: 'Ramen' },
  { id: 8, url: 'https://6a04719546fc04f7c2e1aca4.imgix.net/JapaneseFood/SUSHI.png?w=2000&h=2000', name: 'Shushi' },
];

let memoryState = {
  cards: [],
  flipped: [],
  matched: [],
  moves: 0,
  timer: 60,
  timerInterval: null,
  locked: false,
};

function stopMemoryTimer() {
  clearInterval(memoryState.timerInterval);
}

function initMemory() {
  stopMemoryTimer();

  // Create pairs from 8 images → 16 cards
  const pairs = [...memoryImages, ...memoryImages].map((img, i) => ({
    ...img,
    uid: i,
  }));

  // Shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  memoryState = {
    cards: pairs,
    flipped: [],
    matched: [],
    moves: 0,
    timer: 60,
    timerInterval: null,
    locked: false,
  };

  renderMemory();
  startMemoryTimer();
}

function renderMemory() {
  const content = document.getElementById('memoryContent');
  content.innerHTML = `
    <div class="memory-header">
      <h2>Flip Card Memory</h2>
      <div class="memory-stats">
        <div class="mem-stat">
          <div class="mem-stat-val" id="memTimer">60</div>
          <div class="mem-stat-label">Seconds</div>
        </div>
        <div class="mem-stat">
          <div class="mem-stat-val" id="memMoves">0</div>
          <div class="mem-stat-label">Moves</div>
        </div>
        <div class="mem-stat">
          <div class="mem-stat-val" id="memMatched">0/8</div>
          <div class="mem-stat-label">Matched</div>
        </div>
      </div>
    </div>
    <div class="memory-grid" id="memoryGrid">
      ${memoryState.cards.map((card, index) => `
        <div class="mem-card" data-index="${index}" data-id="${card.id}" onclick="flipCard(${index})">
          <div class="mem-card-inner">
            <div class="mem-card-front">
              <svg viewBox="0 0 40 40" fill="white">
                <circle cx="20" cy="20" r="16" fill="none" stroke="white" stroke-width="2" opacity="0.4"/>
                <circle cx="20" cy="20" r="8" fill="none" stroke="white" stroke-width="2" opacity="0.4"/>
                <circle cx="20" cy="20" r="3" fill="white" opacity="0.6"/>
              </svg>
            </div>
            <div class="mem-card-back">
              <img src="${card.url}" alt="${card.name}" loading="lazy" />
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="text-align:center">
      <button class="btn btn-outline" onclick="initMemory()">Restart</button>
    </div>
  `;
}

function startMemoryTimer() {
  memoryState.timerInterval = setInterval(() => {
    memoryState.timer--;
    const timerEl = document.getElementById('memTimer');
    if (timerEl) {
      timerEl.textContent = memoryState.timer;
      timerEl.classList.toggle('urgent', memoryState.timer <= 10);
    }

    if (memoryState.timer <= 0) {
      stopMemoryTimer();
      showMemoryResult(false);
    }
  }, 1000);
}

function flipCard(index) {
  if (memoryState.locked) return;
  if (memoryState.flipped.includes(index)) return;
  if (memoryState.matched.includes(memoryState.cards[index].uid)) return;

  const cardEl = document.querySelector(`.mem-card[data-index="${index}"]`);
  cardEl.classList.add('flipped');
  memoryState.flipped.push(index);

  if (memoryState.flipped.length === 2) {
    memoryState.moves++;
    const movesEl = document.getElementById('memMoves');
    if (movesEl) movesEl.textContent = memoryState.moves;

    memoryState.locked = true;
    checkMemoryMatch();
  }
}

function checkMemoryMatch() {
  const [i1, i2] = memoryState.flipped;
  const card1 = memoryState.cards[i1];
  const card2 = memoryState.cards[i2];

  if (card1.id === card2.id) {
    // Match!
    memoryState.matched.push(card1.uid, card2.uid);

    const el1 = document.querySelector(`.mem-card[data-index="${i1}"]`);
    const el2 = document.querySelector(`.mem-card[data-index="${i2}"]`);
    if (el1) el1.classList.add('matched');
    if (el2) el2.classList.add('matched');

    const matchedEl = document.getElementById('memMatched');
    const matchCount = memoryState.matched.length / 2;
    if (matchedEl) matchedEl.textContent = `${matchCount}/8`;

    memoryState.flipped = [];
    memoryState.locked = false;

    if (matchCount === 8) {
      stopMemoryTimer();
      setTimeout(() => showMemoryResult(true), 400);
    }
  } else {
    // No match — flip back
    setTimeout(() => {
      const el1 = document.querySelector(`.mem-card[data-index="${i1}"]`);
      const el2 = document.querySelector(`.mem-card[data-index="${i2}"]`);
      if (el1) { el1.classList.remove('flipped'); el1.classList.add('shake'); }
      if (el2) { el2.classList.remove('flipped'); el2.classList.add('shake'); }
      setTimeout(() => {
        if (el1) el1.classList.remove('shake');
        if (el2) el2.classList.remove('shake');
      }, 400);
      memoryState.flipped = [];
      memoryState.locked = false;
    }, 900);
  }
}

function showMemoryResult(won) {
  const content = document.getElementById('memoryContent');
  const timeUsed = 60 - memoryState.timer;

  content.innerHTML = `
    <div class="game-result">
      <div class="result-emoji">${won ? '🎉' : '⏰'}</div>
      <h2 class="result-title ${won ? 'win' : 'lose'}" style="font-family:var(--font-display);font-size:2rem;font-weight:900;margin-bottom:8px">${won ? 'You Win!' : 'Time\'s Up!'}</h2>
      <p class="result-score" style="color:var(--text-2);margin-bottom:8px">${won ? `Matched all 8 pairs in ${timeUsed}s with ${memoryState.moves} moves!` : 'You ran out of time. Try again!'}</p>
      ${won ? `<p style="color:var(--text-3);font-size:0.85rem;margin-bottom:20px">Matched: ${memoryState.matched.length / 2}/8 pairs</p>` : `<p style="color:var(--text-3);font-size:0.85rem;margin-bottom:20px">Matched: ${memoryState.matched.length / 2}/8 pairs</p>`}
      <button class="btn btn-primary" onclick="initMemory()">Play Again</button>
    </div>
  `;

  if (won && !gameState.memory.won) {
    onGameWon('memory');
  }
  gameState.memory.completed = true;
}

// ===================================
// ===== SPOT THE DIFFERENCE =========
// ===================================

// Using a canvas-based approach to draw two similar scenes
// with programmable differences

const SPOT_DIFFERENCES = [
  { x: 0.18, y: 0.22, label: 'Missing cherry blossom' },
  { x: 0.72, y: 0.35, label: 'Color of bowl changed' },
  { x: 0.45, y: 0.65, label: 'Extra chopstick' },
  { x: 0.28, y: 0.75, label: 'Missing sesame seeds' },
  { x: 0.62, y: 0.20, label: 'Different plate pattern' },
];

let spotState = {
  found: [],
  wrongClicks: 0,
  maxWrong: 5,
};

function initSpot() {
  spotState = { found: [], wrongClicks: 0 };
  renderSpot();
}

function renderSpot() {
  const content = document.getElementById('spotContent');
  const found = spotState.found.length;
  const total = SPOT_DIFFERENCES.length;
  const pct = (found / total) * 100;

  content.innerHTML = `
    <div class="spot-header">
      <h2>Spot the Difference</h2>
      <p class="spot-progress-text">Found: ${found} / ${total}</p>
      <div class="spot-progress-bar">
        <div class="spot-progress-fill" id="spotProgressFill" style="width:${pct}%"></div>
      </div>
    </div>
    <div class="spot-images">
      <div class="spot-img-wrap" id="spotLeft" onclick="spotClick(event, 'left')">
        <img src="https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=700&q=80" alt="Original" id="spotImgLeft" draggable="false"/>
        <!-- Markers for found differences on left -->
        ${spotState.found.map(i => `
          <div class="spot-marker correct" style="left:${SPOT_DIFFERENCES[i].x * 100}%;top:${SPOT_DIFFERENCES[i].y * 100}%"></div>
        `).join('')}
        <div style="position:absolute;bottom:6px;left:8px;background:rgba(0,0,0,0.5);color:white;font-size:0.7rem;padding:2px 8px;border-radius:4px">Original</div>
      </div>
      <div class="spot-img-wrap" id="spotRight" onclick="spotClick(event, 'right')">
        <img src="https://images.unsplash.com/photo-1553621042-f6e147245754?w=700&q=80" alt="Modified" id="spotImgRight" draggable="false"/>
        <!-- Markers for found differences on right -->
        ${spotState.found.map(i => `
          <div class="spot-marker correct" style="left:${SPOT_DIFFERENCES[i].x * 100}%;top:${SPOT_DIFFERENCES[i].y * 100}%"></div>
        `).join('')}
        <div style="position:absolute;bottom:6px;left:8px;background:rgba(0,0,0,0.5);color:white;font-size:0.7rem;padding:2px 8px;border-radius:4px">Modified</div>
      </div>
    </div>
    <p class="spot-instructions">Click on the differences you spot! Find all ${total} differences to win.</p>
    <p class="spot-wrong-count" id="spotWrongCount">Wrong clicks: ${spotState.wrongClicks} / ${spotState.maxWrong}</p>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:12px">
      <button class="btn btn-outline" onclick="initSpot()" style="font-size:0.85rem;padding:8px 18px">Restart</button>
    </div>
    <!-- Hidden clickzones for differences -->
    <div id="spotZones" style="display:none"></div>
  `;
}

function spotClick(event, side) {
  const wrap = event.currentTarget;
  const rect = wrap.getBoundingClientRect();
  const relX = (event.clientX - rect.left) / rect.width;
  const relY = (event.clientY - rect.top) / rect.height;

  // Check if click is near any undetected difference
  const threshold = 0.1;
  let hit = -1;

  for (let i = 0; i < SPOT_DIFFERENCES.length; i++) {
    if (spotState.found.includes(i)) continue;
    const d = SPOT_DIFFERENCES[i];
    const dist = Math.sqrt(Math.pow(relX - d.x, 2) + Math.pow(relY - d.y, 2));
    if (dist < threshold) {
      hit = i;
      break;
    }
  }

  if (hit >= 0) {
    // Correct!
    spotState.found.push(hit);

    // Add marker to both images
    ['spotLeft', 'spotRight'].forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        const marker = document.createElement('div');
        marker.className = 'spot-marker correct';
        marker.style.cssText = `left:${SPOT_DIFFERENCES[hit].x * 100}%;top:${SPOT_DIFFERENCES[hit].y * 100}%`;
        container.appendChild(marker);
      }
    });

    // Update progress
    const found = spotState.found.length;
    const total = SPOT_DIFFERENCES.length;
    document.querySelector('.spot-progress-text').textContent = `Found: ${found} / ${total}`;
    document.getElementById('spotProgressFill').style.width = (found / total * 100) + '%';

    if (found >= total) {
      setTimeout(() => showSpotResult(true), 500);
    }
  } else {
    // Wrong click
    spotState.wrongClicks++;
    document.getElementById('spotWrongCount').textContent = `Wrong clicks: ${spotState.wrongClicks} / ${spotState.maxWrong}`;

    // Show wrong flash at click position
    const marker = document.createElement('div');
    marker.className = 'spot-wrong-flash';
    marker.style.cssText = `left:${relX * 100}%;top:${relY * 100}%`;
    wrap.appendChild(marker);
    setTimeout(() => marker.remove(), 700);

    if (spotState.wrongClicks >= spotState.maxWrong) {
      setTimeout(() => showSpotResult(false), 500);
    }
  }
}

function showSpotResult(won) {
  const content = document.getElementById('spotContent');

  content.innerHTML = `
    <div class="game-result">
      <div class="result-emoji">${won ? '🔍' : '😵'}</div>
      <h2 class="result-title ${won ? 'win' : 'lose'}" style="font-family:var(--font-display);font-size:2rem;font-weight:900;margin-bottom:8px">${won ? 'All Found!' : 'Too Many Misses!'}</h2>
      <p class="result-score" style="color:var(--text-2);margin-bottom:8px">${won ? `You spotted all ${SPOT_DIFFERENCES.length} differences with ${spotState.wrongClicks} wrong clicks!` : `You had ${spotState.wrongClicks} wrong clicks. Only found ${spotState.found.length}/${SPOT_DIFFERENCES.length}.`}</p>
      <button class="btn btn-primary" onclick="initSpot()" style="margin:16px auto 0">Play Again</button>
    </div>
  `;

  if (won && !gameState.spot.won) {
    onGameWon('spot');
  }
  gameState.spot.completed = true;
}

// ===== SMOOTH SCROLL FOR NAV LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== PAGE LOAD ANIMATION =====
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
