const navigation = document.querySelector("#library-nav");
const menuToggle = document.querySelector(".menu-toggle");
const roomSections = [...document.querySelectorAll("[data-room]")];
const roomLinks = [...document.querySelectorAll("[data-room-link]")];
const writingText = document.querySelector("#writing-text");
const writingPrompt = document.querySelector("#writing-prompt");
const memoryGrid = document.querySelector("#memory-grid");
const roomDirectory = document.querySelector("#room-directory");
const gameMessage = document.querySelector("#game-message");
const difficulty = document.querySelector("#difficulty");
const moveCount = document.querySelector("#move-count");
const pairCount = document.querySelector("#pair-count");
const pairTotal = document.querySelector("#pair-total");
const completionNote = document.querySelector("#completion-note");

document.querySelector(".library-hero .brass-button").addEventListener("click", (event) => {
  event.preventDefault();
  history.pushState(null, "", "#room-directory");
  roomDirectory.focus({ preventScroll: true });
  roomDirectory.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start"
  });
});

let activeRoom = "library";
let cards = [];
let selectedCards = [];
let matchedPairs = 0;
let moves = 0;
let resolving = false;
let mismatchTimer = null;
const cardElements = new Map();

const cardSymbols = [
  { name: "silver key" },
  { name: "raven" },
  { name: "red rose" },
  { name: "crescent moon" },
  { name: "antique book" },
  { name: "bat" },
  { name: "candle" },
  { name: "gothic castle" }
];

const pairCounts = { easy: 4, medium: 6, challenge: 8 };

const cardIllustrations = {
  "silver key": [
    { tag: "circle", attrs: { cx: "24", cy: "24", r: "11" } },
    { tag: "circle", attrs: { cx: "24", cy: "24", r: "4" } },
    { tag: "path", attrs: { d: "M32 32 53 53M44 44l-6 6m12-12-6 6" } }
  ],
  raven: [
    { tag: "path", attrs: { d: "M11 39c7-3 9-14 19-17 8-2 14 2 17 8l10 3-11 5c-2 8-10 11-18 7l-4 9-6-2 3-10c-4 1-8 0-10-3Z" }, fill: "currentColor", stroke: "none" },
    { tag: "path", attrs: { d: "M28 27c6-1 11 2 14 6-5-1-8 1-11 4" } },
    { tag: "circle", attrs: { cx: "40", cy: "28", r: "1.5" }, fill: "currentColor", stroke: "none" }
  ],
  "red rose": [
    { tag: "path", attrs: { d: "M32 31v25M32 43c-7-8-14-6-15-5 4 7 9 9 15 7m0-4c7-8 14-6 15-5-4 7-9 9-15 7" } },
    { tag: "path", attrs: { d: "M31 31c-12-7-7-17 1-13 6-12 17-5 10 2 10 3 6 14-2 12-3 7-12 5-9-1Z" }, fill: "currentColor" },
    { tag: "path", attrs: { d: "M31 31c2-5 5-8 10-11" }, stroke: "#ead9b9" }
  ],
  "crescent moon": [
    { tag: "path", attrs: { d: "M43 8a24 24 0 1 0 13 43A26 26 0 0 1 43 8Z" }, fill: "currentColor", stroke: "none" },
    { tag: "circle", attrs: { cx: "17", cy: "17", r: "1.5" }, fill: "currentColor", stroke: "none" }
  ],
  "antique book": [
    { tag: "path", attrs: { d: "M8 15c9-4 17-2 24 3v34c-7-5-15-7-24-3V15Zm48 0c-9-4-17-2-24 3v34c7-5 15-7 24-3V15Z" } },
    { tag: "path", attrs: { d: "M13 21c5-2 10-1 14 1m-14 5c5-2 10-1 14 1m-14 5c5-2 10-1 14 1m17-12c5-2 10-1 14 1m-14 5c5-2 10-1 14 1m-14 5c5-2 10-1 14 1" } }
  ],
  bat: [
    { tag: "path", attrs: { d: "M32 25c-8-7-16-12-23-11l4 14-8-4 4 16c2 10 11 13 17 5l6-3 6 3c6 8 15 5 17-5l4-16-8 4 4-14c-7-1-15 4-23 11Z" }, fill: "currentColor", stroke: "none" },
    { tag: "path", attrs: { d: "M27 29c-3 5-4 10-2 15m12-15c3 5 4 10 2 15" }, stroke: "#ead9b9" }
  ],
  candle: [
    { tag: "path", attrs: { d: "M21 25h22v30H21zM18 55h28M32 25c-7-7 1-10 0-17 9 8 8 13 0 17Z" } },
    { tag: "path", attrs: { d: "M25 33v15m14-15v15" }, stroke: "#a77a49" }
  ],
  "gothic castle": [
    { tag: "path", attrs: { d: "M8 54V28h10V15l9 8v-9l5-7 5 7v9l9-8v13h10v26H8Z" } },
    { tag: "path", attrs: { d: "M28 54V40a4 4 0 0 1 8 0v14M13 35h5m-5 7h5m28-7h5m-5 7h5M28 24h8" } }
  ]
};

function createCardIllustration(name) {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  svg.setAttribute("viewBox", "0 0 64 64");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  cardIllustrations[name].forEach((shape) => {
    const element = document.createElementNS(namespace, shape.tag);
    Object.entries(shape.attrs).forEach(([attribute, value]) => element.setAttribute(attribute, value));
    element.setAttribute("fill", shape.fill || "none");
    element.setAttribute("stroke", shape.stroke || "currentColor");
    element.setAttribute("stroke-width", "2.6");
    element.setAttribute("stroke-linecap", "round");
    element.setAttribute("stroke-linejoin", "round");
    svg.append(element);
  });
  return svg;
}

function openRoom(roomName) {
  const destination = roomSections.find((section) => section.dataset.room === roomName);
  if (!destination) throw new Error(`Unknown library room: ${roomName}`);

  if (activeRoom === "letters" && roomName !== "letters") {
    writingText.value = "";
    writingPrompt.selectedIndex = 0;
  }

  activeRoom = roomName;
  roomSections.forEach((section) => {
    section.hidden = section !== destination;
  });
  document.querySelectorAll("#library-nav [data-room-link]").forEach((button) => {
    if (button.dataset.roomLink === roomName) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  navigation.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  const heading = destination.querySelector("h1");
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
}

roomLinks.forEach((button) => {
  button.addEventListener("click", () => openRoom(button.dataset.roomLink));
});

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  navigation.classList.toggle("is-open", !isOpen);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("is-open")) {
    navigation.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.focus();
  }
});

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function renderCards() {
  memoryGrid.replaceChildren();
  cardElements.clear();
  cards.forEach((card, index) => {
    const button = document.createElement("button");
    const isRevealed = card.revealed || card.matched;
    button.type = "button";
    button.className = "memory-card";
    button.dataset.cardId = card.id;
    button.setAttribute("aria-pressed", String(isRevealed));
    button.setAttribute("aria-label", isRevealed ? `Card ${index + 1}: ${card.name}` : `Card ${index + 1}, face down`);
    if (card.revealed) button.classList.add("is-revealed");
    if (card.matched) button.classList.add("is-matched");
    if (card.matched) button.disabled = true;

    const back = document.createElement("span");
    back.className = "card-back";
    back.setAttribute("aria-hidden", "true");
    back.textContent = "✦";
    const face = document.createElement("span");
    face.className = "card-face";
    face.setAttribute("aria-hidden", "true");
    face.append(createCardIllustration(card.name));
    button.append(back, face);
    button.addEventListener("click", () => revealCard(card.id));
    memoryGrid.append(button);
    cardElements.set(card.id, button);
  });
}

function updateCardView(card) {
  const button = cardElements.get(card.id);
  const index = cards.indexOf(card);
  const isRevealed = card.revealed || card.matched;
  button.classList.toggle("is-revealed", card.revealed);
  button.classList.toggle("is-matched", card.matched);
  button.setAttribute("aria-pressed", String(isRevealed));
  button.setAttribute("aria-label", isRevealed ? `Card ${index + 1}: ${card.name}` : `Card ${index + 1}, face down`);
  button.disabled = card.matched;
}

function startGame() {
  if (mismatchTimer !== null) {
    window.clearTimeout(mismatchTimer);
    mismatchTimer = null;
  }
  const count = pairCounts[difficulty.value];
  cards = shuffle(cardSymbols.slice(0, count).flatMap((card, pair) => [
    { ...card, id: `${pair}-a`, pair, revealed: false, matched: false },
    { ...card, id: `${pair}-b`, pair, revealed: false, matched: false }
  ]));
  selectedCards = [];
  matchedPairs = 0;
  moves = 0;
  resolving = false;
  pairCount.textContent = "0";
  pairTotal.textContent = String(count);
  moveCount.textContent = "0";
  gameMessage.textContent = "Choose a card to begin. There is no clock here.";
  completionNote.hidden = true;
  renderCards();
}

function revealCard(cardId) {
  if (resolving) return;
  const card = cards.find((item) => item.id === cardId);
  if (!card || card.revealed || card.matched) return;

  card.revealed = true;
  selectedCards.push(card);
  updateCardView(card);
  if (selectedCards.length < 2) {
    gameMessage.textContent = "A first symbol, turned towards the light.";
    return;
  }

  moves += 1;
  moveCount.textContent = String(moves);
  const [first, second] = selectedCards;
  if (first.pair === second.pair) {
    const shouldMoveFocus = memoryGrid.contains(document.activeElement);
    first.matched = true;
    second.matched = true;
    updateCardView(first);
    updateCardView(second);
    matchedPairs += 1;
    pairCount.textContent = String(matchedPairs);
    selectedCards = [];
    if (matchedPairs === pairCounts[difficulty.value]) {
      gameMessage.textContent = "Every pair has found its way home.";
      completionNote.hidden = false;
      document.querySelector("#play-again").focus({ preventScroll: true });
    } else {
      gameMessage.textContent = "A pair found. The pattern grows clearer.";
      if (shouldMoveFocus) memoryGrid.querySelector(".memory-card:not(:disabled)")?.focus({ preventScroll: true });
    }
    return;
  }

  resolving = true;
  gameMessage.textContent = "Two different stories. They will turn back in a moment.";
  mismatchTimer = window.setTimeout(() => {
    first.revealed = false;
    second.revealed = false;
    selectedCards = [];
    resolving = false;
    mismatchTimer = null;
    updateCardView(first);
    updateCardView(second);
    gameMessage.textContent = "The cards are ready when you are.";
  }, 850);
}

document.querySelector("#restart-game").addEventListener("click", startGame);
document.querySelector("#play-again").addEventListener("click", startGame);
difficulty.addEventListener("change", startGame);
startGame();

const moonDescriptions = {
  new: "A dark moon, keeping its silver to itself for a little while.",
  "waxing-crescent": "A fine bright edge gathers in the western dark.",
  "first-quarter": "Half in light, half in shadow: a sky in balance.",
  "waxing-gibbous": "More light than shadow now; the full moon draws near.",
  full: "The whole moon rests in the dark, pale and unhurried.",
  "waning-gibbous": "The bright face begins to soften at its eastern edge.",
  "last-quarter": "Half-lit again, now the shadow leads the way.",
  "waning-crescent": "A last slender curve before the sky begins anew."
};

document.querySelectorAll(".phase-picker [data-phase]").forEach((button) => {
  button.addEventListener("click", () => {
    const phase = button.dataset.phase;
    const moon = document.querySelector("#observatory-moon");
    moon.dataset.phase = phase;
    moon.setAttribute("aria-label", `${button.querySelector("span:last-child").textContent.replace(/\s+/g, " ")} moon`);
    document.querySelector("#phase-description").textContent = moonDescriptions[phase];
    document.querySelectorAll(".phase-picker [data-phase]").forEach((choice) => {
      choice.setAttribute("aria-pressed", String(choice === button));
    });
  });
});

const artifacts = {
  key: {
    kind: "A newly imagined tale",
    name: "The key without a lock",
    description: "At midnight, the silver key grows warm in the hand. It opens no door in the library—only the little brass box beside the window, where someone left a pressed blue flower.",
    source: "An original story, made for this cabinet."
  },
  feather: {
    kind: "Folklore · Scotland",
    name: "A feather for the ferry",
    description: "Scottish and Orkney storytelling includes selkies: seal-people said to shed their skins and take human form. In many tellings, a lost sealskin is the hinge on which a whole tale turns.",
    source: "A varied folk tradition, not a single fixed account. This is folklore, not a historical claim."
  },
  rose: {
    kind: "Folklore · Ireland",
    name: "The rose at the old mound",
    description: "Irish tradition speaks of the aos sí—otherworldly beings associated in many accounts with sídhe, or ancient mounds. Stories differ from place to place; this rose is only a storyteller's imagined offering.",
    source: "A brief note on Irish folklore; local tellings and meanings vary."
  },
  book: {
    kind: "A newly imagined tale",
    name: "The book that shelved itself",
    description: "Every evening the librarian returned this book to its place. Every morning it had moved one shelf nearer the window. On the seventh day, the window stood open, and the book was gone.",
    source: "An original story, made for this cabinet."
  },
  mirror: {
    kind: "A small riddle",
    name: "The clouded mirror",
    description: "I borrow your face but keep none of it. I grow dim when the room grows warm. What am I?",
    source: "Answer: a looking-glass on a winter night."
  },
  candle: {
    kind: "Vampire fiction · a small fact",
    name: "The candle at the window",
    description: "Bram Stoker's novel Dracula was first published in 1897. The vampire in the book is a work of fiction, shaped by the literary imagination of its time.",
    source: "Publication date: 1897. This note concerns a novel, not folklore or history."
  },
  pendant: {
    kind: "A newly imagined tale",
    name: "The moon's little keepsake",
    description: "The pendant never shows the same sky twice. Turn it beneath candlelight and, for one brief breath, a faraway hill appears in its silver.",
    source: "An original story, made for this cabinet."
  },
  parchment: {
    kind: "A small riddle",
    name: "The sealed parchment",
    description: "I have cities but no doors, rivers but no rain, and borders no traveller can cross. What am I?",
    source: "Answer: a map."
  }
};

document.querySelectorAll(".artifact").forEach((button) => {
  button.addEventListener("click", () => {
    const artifact = artifacts[button.dataset.artifact];
    document.querySelectorAll(".artifact").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    document.querySelector("#artifact-kind").textContent = artifact.kind;
    document.querySelector("#artifact-name").textContent = artifact.name;
    document.querySelector("#artifact-description").textContent = artifact.description;
    document.querySelector("#artifact-source").textContent = artifact.source;
  });
});

document.querySelector("#clear-writing").addEventListener("click", () => {
  writingText.value = "";
  writingText.focus();
});
