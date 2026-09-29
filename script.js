"use strict";

document.documentElement.classList.add("js");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");
const closeMenu = () => {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.innerHTML = 'Menu <span aria-hidden="true">＋</span>';
  navigation.classList.remove("is-open");
};
menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.innerHTML = `${open ? "Close" : "Menu"} <span aria-hidden="true">${open ? "−" : "＋"}</span>`;
  navigation.classList.toggle("is-open", open);
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuToggle.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuToggle.focus();
  }
});
const mobileQuery = window.matchMedia("(max-width: 620px)");
const syncMenu = () => {
  menuToggle.hidden = !mobileQuery.matches;
  closeMenu();
};
mobileQuery.addEventListener("change", syncMenu);
syncMenu();

const filters = document.querySelector(".project-filters");
const projects = [...document.querySelectorAll(".project-card")];
filters.hidden = false;
filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  filters
    .querySelectorAll("button")
    .forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
  let count = 0;
  projects.forEach((project) => {
    project.hidden =
      button.dataset.filter !== "all" &&
      project.dataset.category !== button.dataset.filter;
    if (!project.hidden) count++;
  });
  document.querySelector("#filter-status").textContent =
    `${count} ${count === 1 ? "project" : "projects"} shown.`;
});

const galleries = {
  manishcode: {
    title: "Manish Code",
    images: [
      ["images/manish-code-demo.jpg", "Planning a todo list, reading calc.py and fixing it with str_replace."],
      ["images/manish-code-safety.jpg", "The permission policy blocking a request to delete a .env file."],
    ],
  },
  openmemoryui: {
    title: "OpenMemoryUI",
    images: [
      ["images/openmemoryui-demo.jpg", "The demo after three messages: all four memory stores filled, with retrieval scores."],
      ["images/openmemoryui-launch.jpg", "Transparent agentic memory, ready to launch."],
    ],
  },
  tabbouncer: {
    title: "Tab Bouncer",
    images: [
      ["images/tab-bouncer-og.png", "Twelve tabs checked for a Lisbon trip: five rabbit holes, nine tabs to close."],
      ["images/tab-bouncer-ask.jpg", "Tell it what you're working on."],
      ["images/tab-bouncer-results.jpg", "Every tab rated and sorted, ready to close."],
    ],
  },
  openmcpui: {
    title: "OpenMCP UI",
    images: [
      ["images/openmcpui-live.jpg", "Say what you need. MCP handles the handoff."],
      ["images/openmcpui-og.png", "You ask, the client chooses a tool, the server runs it."],
    ],
  },
  videorag: {
    title: "Video RAG",
    images: [
      ["images/videorag-frames.jpg", "The frames and timestamps retrieved as evidence for an answer."],
      ["images/videorag-answer.jpg", "The answer, with visual and textual evidence."],
    ],
  },
};
const galleryDialog = document.querySelector(".gallery-dialog");
const galleryImage = document.querySelector("#gallery-image");
const previous = document.querySelector("[data-gallery-prev]");
const next = document.querySelector("[data-gallery-next]");
let activeGallery;
let imageIndex = 0;
let galleryTrigger;
const showImage = () => {
  const [src, caption] = activeGallery.images[imageIndex];
  galleryImage.src = src;
  galleryImage.alt = `${activeGallery.title}: ${caption}`;
  document.querySelector("#gallery-caption").textContent = caption;
  document.querySelector("#gallery-count").textContent =
    `${imageIndex + 1} / ${activeGallery.images.length}`;
  previous.hidden = next.hidden = activeGallery.images.length < 2;
};
document.querySelectorAll("[data-gallery]").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    if (typeof galleryDialog.showModal !== "function") return;
    event.preventDefault();
    activeGallery = galleries[trigger.dataset.gallery];
    imageIndex = 0;
    galleryTrigger = trigger;
    document.querySelector("#gallery-title").textContent = activeGallery.title;
    showImage();
    galleryDialog.showModal();
    document.body.classList.add("modal-open");
    document.querySelector(".gallery-close").focus();
  });
});
const moveImage = (direction) => {
  imageIndex =
    (imageIndex + direction + activeGallery.images.length) %
    activeGallery.images.length;
  showImage();
};
previous.addEventListener("click", () => moveImage(-1));
next.addEventListener("click", () => moveImage(1));
document
  .querySelector(".gallery-close")
  .addEventListener("click", () => galleryDialog.close());
galleryDialog.addEventListener("click", (event) => {
  const rect = galleryDialog.getBoundingClientRect();
  if (
    event.target === galleryDialog &&
    (event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom)
  )
    galleryDialog.close();
});
galleryDialog.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    const controls = [...galleryDialog.querySelectorAll("button:not([hidden])")];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    moveImage(event.key === "ArrowLeft" ? -1 : 1);
  }
});
galleryDialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  galleryTrigger?.focus({ preventScroll: true });
});

const copyButton = document.querySelector(".copy-email");
copyButton.hidden = false;
copyButton.addEventListener("click", async () => {
  const status = document.querySelector(".copy-status");
  try {
    await navigator.clipboard.writeText("manish.tinkering@gmail.com");
    copyButton.textContent = "Email copied ✓";
    status.textContent = "Email address copied to clipboard.";
    window.setTimeout(() => {
      copyButton.innerHTML =
        'Copy email address <span aria-hidden="true">⧉</span>';
    }, 2400);
  } catch {
    status.classList.remove("sr-only");
    status.textContent =
      "Select and copy the address above, or click it to open your email app.";
  }
});

const visitorWidget = document.querySelector("[data-visitor-widget]");
const visitorTotal = document.querySelector("#visitor-total");
const visitorClap = document.querySelector("#visitor-clap");
const clapTotal = document.querySelector("#clap-total");
const clapLabel = visitorClap?.querySelector(".clap-label");

const counterConfig = {
  apiBase: "https://counterapi.com/api",
  namespace: "manish-luci.netlify.app",
  visitsCounter: {
    action: "view",
    key: "profile-restored-2026",
    baseline: 800,
  },
  clapCounter: {
    action: "vote",
    key: "profile-claps-restored-2026",
    baseline: 655,
  },
};

const formatCount = (value) =>
  Number.isFinite(Number(value)) ? Number(value).toLocaleString("en-IN") : "--";

const setCounterText = (element, value) => {
  if (element) {
    element.textContent = formatCount(value);
  }
};

const storage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
};

const localCounter = (key, shouldIncrement = false) => {
  const current = Number(storage.get(key) || 0);
  const next = shouldIncrement ? current + 1 : current;
  storage.set(key, String(next));
  return next;
};

const clapLimit = 5;
const clapsGivenKey = "manishPortfolioClapsGivenV1";
let clapsGiven = Math.min(
  clapLimit,
  Math.max(0, Number(storage.get(clapsGivenKey) || 0))
);
let clapRequestPending = false;

const updateClapButton = () => {
  if (!visitorClap) {
    return;
  }

  const remaining = clapLimit - clapsGiven;
  const limitReached = remaining === 0;

  visitorClap.disabled = clapRequestPending || limitReached;
  visitorClap.classList.toggle("limit-reached", limitReached);
  visitorClap.title = limitReached
    ? "You have used all 5 claps"
    : `You can clap ${remaining} more ${remaining === 1 ? "time" : "times"}`;
  visitorClap.setAttribute(
    "aria-label",
    limitReached
      ? "Maximum of 5 claps reached"
      : `Clap for Manish's profile. ${remaining} remaining`
  );

  if (clapLabel) {
    clapLabel.textContent = limitReached ? "Maxed" : "Clap";
  }
};

const counterUrl = (counter, readOnly = false) => {
  const parts = [counterConfig.namespace, counter.action, counter.key].map(
    (part) => encodeURIComponent(part)
  );
  const query = readOnly ? "?readOnly=true" : "";

  return `${counterConfig.apiBase}/${parts.join("/")}${query}`;
};

const requestJson = (url) => {
  if (typeof fetch === "function") {
    return fetch(url, { cache: "no-store" }).then(async (response) => ({
      data: await response.json(),
      ok: response.ok,
      status: response.status,
    }));
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Accept", "application/json");
    request.onload = () => {
      try {
        resolve({
          data: JSON.parse(request.responseText),
          ok: request.status >= 200 && request.status < 300,
          status: request.status,
        });
      } catch (error) {
        reject(error);
      }
    };
    request.onerror = () => reject(new Error("Counter request failed"));
    request.send();
  });
};

const readCounter = async (counter) => {
  const response = await requestJson(counterUrl(counter, true));
  if (!response.ok) {
    throw new Error(`Counter returned ${response.status}`);
  }

  return Number(response.data.value) + counter.baseline;
};

const incrementCounter = async (counter) => {
  const response = await requestJson(counterUrl(counter));

  if (!response.ok) {
    throw new Error(`Counter returned ${response.status}`);
  }

  return Number(response.data.value) + counter.baseline;
};

const refreshVisitorCounters = async () => {
  if (!visitorWidget) {
    return;
  }

  updateClapButton();

  try {
    const isLocalPreview = ["localhost", "127.0.0.1"].includes(location.hostname);
    const [visits, claps] = await Promise.all([
      isLocalPreview
        ? readCounter(counterConfig.visitsCounter)
        : incrementCounter(counterConfig.visitsCounter),
      readCounter(counterConfig.clapCounter),
    ]);

    setCounterText(visitorTotal, visits);
    setCounterText(clapTotal, claps);
  } catch {
    const offlineViews = localCounter("manishPortfolioOfflineViews", true);
    const offlineClaps = localCounter("manishPortfolioOfflineClaps");

    setCounterText(
      visitorTotal,
      counterConfig.visitsCounter.baseline + offlineViews
    );
    setCounterText(
      clapTotal,
      counterConfig.clapCounter.baseline + offlineClaps
    );
  }
};

visitorClap?.addEventListener("click", async () => {
  if (clapRequestPending || clapsGiven >= clapLimit) {
    return;
  }

  clapRequestPending = true;
  updateClapButton();

  try {
    const claps = await incrementCounter(counterConfig.clapCounter);
    clapsGiven += 1;
    storage.set(clapsGivenKey, String(clapsGiven));
    setCounterText(clapTotal, claps);
  } catch {
    visitorClap.title = "Clap could not be recorded. Please try again.";
  } finally {
    clapRequestPending = false;
    updateClapButton();
  }
});

refreshVisitorCounters();
