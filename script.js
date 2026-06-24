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

const counterConfig = {
  apiBase: "https://api.counterapi.dev/v1",
  namespace: "manish-sharma-portfolio-hi-widget",
  visitsCounter: "portfolio-visits",
  clapCounter: "profile-claps",
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

const counterUrl = (name, action = "") => {
  const parts = [counterConfig.namespace, name, action]
    .filter(Boolean)
    .map((part) => encodeURIComponent(part));

  const suffix = action ? "" : "/";
  return `${counterConfig.apiBase}/${parts.join("/")}${suffix}`;
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

const readCounter = async (name) => {
  const response = await requestJson(counterUrl(name));
  const { data } = response;

  if (data?.message === "record not found") {
    return 0;
  }

  if (!response.ok) {
    throw new Error(`Counter returned ${response.status}`);
  }

  return data.count;
};

const incrementCounter = async (name) => {
  const response = await requestJson(counterUrl(name, "up"));

  if (!response.ok) {
    throw new Error(`Counter returned ${response.status}`);
  }

  return response.data.count;
};

const refreshVisitorCounters = async () => {
  if (!visitorWidget) {
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const liveVisitDateKey = "manishPortfolioLiveVisitDate";
  const localVisitDateKey = "manishPortfolioLocalVisitDate";
  const shouldCountLiveVisit = storage.get(liveVisitDateKey) !== today;

  try {
    const [visits, claps] = await Promise.all([
      shouldCountLiveVisit
        ? incrementCounter(counterConfig.visitsCounter)
        : readCounter(counterConfig.visitsCounter),
      readCounter(counterConfig.clapCounter),
    ]);

    if (shouldCountLiveVisit) {
      storage.set(liveVisitDateKey, today);
    }

    setCounterText(visitorTotal, visits);
    setCounterText(clapTotal, claps);
  } catch {
    const shouldCountLocalVisit = storage.get(localVisitDateKey) !== today;
    const visits = localCounter("manishPortfolioLocalVisits", shouldCountLocalVisit);
    const claps = localCounter("manishPortfolioLocalClaps");

    if (shouldCountLocalVisit) {
      storage.set(localVisitDateKey, today);
    }

    setCounterText(visitorTotal, visits);
    setCounterText(clapTotal, claps);
  }
};

visitorClap?.addEventListener("click", async () => {
  try {
    const claps = await incrementCounter(counterConfig.clapCounter);
    setCounterText(clapTotal, claps);
  } catch {
    const claps = localCounter("manishPortfolioLocalClaps", true);
    setCounterText(clapTotal, claps);
  }
});

refreshVisitorCounters();
