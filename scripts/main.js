const SELECTORS = {
  floatingNav: "[data-floating-nav]",
  yearTarget: "[data-year]",
  scrollTrigger: "[data-scroll-to]",
  carousel: "[data-carousel]",
};

const SCROLL_OFFSET = 80;

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  bindSmoothScroll();
  initFloatingNav();
  initTestimonialsCarousel();
});

function setCurrentYear() {
  const target = document.querySelector(SELECTORS.yearTarget);
  if (target) {
    target.textContent = new Date().getFullYear();
  }
}

function bindSmoothScroll() {
  const triggers = document.querySelectorAll(SELECTORS.scrollTrigger);
  if (!triggers.length) return;

  triggers.forEach((button) => {
    button.addEventListener("click", (event) => {
      const sectionId = button.getAttribute("data-scroll-to");
      const section = document.getElementById(sectionId);

      if (!section) return;

      event.preventDefault();
      const elementTop = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementTop - SCROLL_OFFSET,
        behavior: "smooth",
      });
    });
  });
}

function initFloatingNav() {
  const nav = document.querySelector(SELECTORS.floatingNav);
  if (!nav) return;

  const buttons = Array.from(
    nav.querySelectorAll(`${SELECTORS.scrollTrigger}`)
  );

  const sections = buttons
    .map((button) => document.getElementById(button.dataset.scrollTo))
    .filter(Boolean);

  const toggleNavVisibility = () => {
    if (window.scrollY > 320) {
      nav.classList.add("is-visible");
    } else {
      nav.classList.remove("is-visible");
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const targetId = entry.target.getAttribute("id");
        const button = buttons.find((btn) => btn.dataset.scrollTo === targetId);
        if (!button) return;

        if (entry.isIntersecting) {
          buttons.forEach((btn) => btn.classList.remove("is-active"));
          button.classList.add("is-active");
        }
      });
    },
    {
      rootMargin: "-40% 0px -50% 0px",
      threshold: 0.1,
    }
  );

  sections.forEach((section) => observer.observe(section));

  toggleNavVisibility();
  window.addEventListener("scroll", toggleNavVisibility);
}

function initTestimonialsCarousel() {
  const carousel = document.querySelector(SELECTORS.carousel);
  if (!carousel) return;

  const track = carousel.querySelector(".carousel__track");
  const slides = Array.from(track.querySelectorAll(".carousel__slide"));
  const prevButton = carousel.querySelector(".carousel__control--prev");
  const nextButton = carousel.querySelector(".carousel__control--next");

  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (activeIndex === -1) activeIndex = 0;

  const updateSlides = (nextIndex) => {
    slides[activeIndex].classList.remove("is-active");
    slides[nextIndex].classList.add("is-active");
    track.scrollTo({
      left: slides[nextIndex].offsetLeft,
      behavior: "smooth",
    });
    activeIndex = nextIndex;
  };

  const goToPrev = () => {
    const nextIndex = activeIndex === 0 ? slides.length - 1 : activeIndex - 1;
    updateSlides(nextIndex);
  };

  const goToNext = () => {
    const nextIndex = activeIndex === slides.length - 1 ? 0 : activeIndex + 1;
    updateSlides(nextIndex);
  };

  let autoplayTimer = window.setInterval(goToNext, 6500);

  const resetAutoplay = () => {
    window.clearInterval(autoplayTimer);
    autoplayTimer = window.setInterval(goToNext, 6500);
  };

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      goToPrev();
      resetAutoplay();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      goToNext();
      resetAutoplay();
    });
  }

  carousel.addEventListener("mouseenter", () => window.clearInterval(autoplayTimer));
  carousel.addEventListener("mouseleave", resetAutoplay);

  window.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearInterval(autoplayTimer);
    } else {
      resetAutoplay();
    }
  });
}
