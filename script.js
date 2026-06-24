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
