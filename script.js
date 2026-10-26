const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll(".world-card").forEach((card) => {
  card.addEventListener("click", () => {
    const isOpen = card.getAttribute("aria-expanded") === "true";
    card.setAttribute("aria-expanded", String(!isOpen));
  });
});

const destinationMessages = {
  forest: "A path of silver leaves winds between the trees. Somewhere ahead, a little lantern is waiting.",
  library: "A warm pool of lamplight, a quiet chair, and shelves full of worlds with no hurry to be read.",
  kingdom: "The rooftops are silver with moonlight, and every window holds a different kind of story."
};

document.querySelectorAll("[data-destination]").forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-destination]").forEach((choice) => choice.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");
    document.querySelector("#destination-response").textContent = destinationMessages[button.dataset.destination];
  });
});

const comfortMessages = {
  distraction: "A tiny invitation: pick a colour you can see, then imagine what kind of story it belongs in.",
  comfort: "“There is no deadline for becoming the person you're growing into.” You can leave that thought here for a while.",
  slow: "If you'd like, let the next moment be just one moment. Nothing else needs deciding right now.",
  unsure: "Not knowing is a real answer. You don't have to turn it into a plan."
};

document.querySelectorAll("[data-comfort]").forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-comfort]").forEach((choice) => choice.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");
    document.querySelector("#comfort-response").textContent = comfortMessages[button.dataset.comfort];
  });
});

const groundingButton = document.querySelector("#grounding-button");
groundingButton.addEventListener("click", () => {
  const response = document.querySelector("#grounding-response");
  response.textContent = response.textContent
    ? ""
    : "Notice one colour, one shape, and one sound—only if that feels comfortable.";
  groundingButton.textContent = response.textContent ? "That's enough for now" : "A small grounding moment";
});

document.querySelectorAll(".small-thing").forEach((button) => {
  button.setAttribute("aria-expanded", "false");
  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
  });
});

const envelopeButton = document.querySelector("#envelope-button");
const hiddenNote = document.querySelector("#hidden-note");
envelopeButton.addEventListener("click", () => {
  const isOpen = envelopeButton.getAttribute("aria-expanded") === "true";
  envelopeButton.setAttribute("aria-expanded", String(!isOpen));
  hiddenNote.hidden = isOpen;
  envelopeButton.querySelector(".envelope-label").textContent = isOpen ? "A note for you" : "Your note is open";
});
