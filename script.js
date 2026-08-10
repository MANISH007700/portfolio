const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = Array.from(document.querySelectorAll(".nav-links a"));
const sections = navItems
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const closeMenu = () => {
  document.body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
  navLinks?.classList.remove("open");
};

navToggle?.addEventListener("click", () => {
  const isOpen = navLinks?.classList.toggle("open");
  document.body.classList.toggle("nav-open", Boolean(isOpen));
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));

    if (!target) {
      return;
    }

    event.preventDefault();

    const headerOffset = header?.offsetHeight || 0;
    const targetPosition =
      target.getBoundingClientRect().top + window.scrollY - headerOffset - 12;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });

    closeMenu();
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navItems.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${entry.target.id}`
        );
      });
    });
  },
  {
    rootMargin: "-35% 0px -55% 0px",
    threshold: 0,
  }
);

sections.forEach((section) => observer.observe(section));

const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

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
    const [visits, claps] = await Promise.all([
      incrementCounter(counterConfig.visitsCounter),
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
