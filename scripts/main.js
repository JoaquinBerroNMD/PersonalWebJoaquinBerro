const SELECTORS = {
  floatingNav: "[data-floating-nav]",
  yearTarget: "[data-year]",
  scrollTrigger: "[data-scroll-to]",
  carousel: "[data-carousel]",
  contactForm: "#contact-form",
  formStatus: "[data-form-status]",
};

const SCROLL_OFFSET = 80;
const EMAILJS_STATUS_RESET_DELAY = 7000;

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  bindSmoothScroll();
  initFloatingNav();
  initTestimonialsCarousel();
  initContactFormEmail();
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

function initContactFormEmail() {
  const form = document.querySelector(SELECTORS.contactForm);
  if (!form || typeof window.emailjs === "undefined") return;

  const serviceId = (form.dataset.emailjsService || "").trim();
  const templateId = (form.dataset.emailjsTemplate || "").trim();
  const publicKey =
    (form.dataset.emailjsPublicKey || window.EMAILJS_PUBLIC_KEY || "").trim();

  const hasConfig =
    serviceId && templateId && publicKey && !serviceId.includes("xxxxx");

  if (!hasConfig) {
    return;
  }

  window.emailjs.init(publicKey);

  const statusEl = form.querySelector(SELECTORS.formStatus);
  const submitButton = form.querySelector("button[type='submit']");

  const setStatus = (message, state) => {
    if (!statusEl) return;
    statusEl.textContent = message;
    if (state) {
      statusEl.dataset.state = state;
    } else {
      delete statusEl.dataset.state;
    }
  };

  const resetStatusLater = () => {
    if (!statusEl) return;
    window.setTimeout(() => {
      statusEl.textContent = "";
      delete statusEl.dataset.state;
    }, EMAILJS_STATUS_RESET_DELAY);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.dataset.loading = "true";
    }

    setStatus("Enviando propuesta...", "pending");

    window.emailjs
      .sendForm(serviceId, templateId, form)
      .then(() => {
        setStatus("¡Gracias! Te responderé a la brevedad.", "success");
        form.reset();
        resetStatusLater();
      })
      .catch(() => {
        setStatus(
          "No se pudo enviar. Intenta de nuevo o escríbeme a hola@joaquin.dev.",
          "error"
        );
        resetStatusLater();
      })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
          delete submitButton.dataset.loading;
        }
      });
  });
}
