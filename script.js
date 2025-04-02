
// Portfolio JavaScript
// Example: Smooth scrolling for navigation links (optional)
document.querySelectorAll('nav ul li a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      // Calculate position, considering the fixed header height
      const headerOffset = document.querySelector("header").offsetHeight;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  });
});

// Add more interactivity here later if needed
console.log("Portfolio script loaded.");