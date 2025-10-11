const SELECTORS = {
  floatingNav: "[data-floating-nav]",
  yearTarget: "[data-year]",
  scrollTrigger: "[data-scroll-to]",
  carousel: "[data-carousel]",
  contactForm: "#contact-form",
  formStatus: "[data-form-status]",
  revealTargets: "[data-reveal]",
  promptOptimizerForm: "[data-prompt-optimizer-form]",
  promptOriginal: "[data-prompt-original]",
  promptGoal: "[data-prompt-goal]",
  promptAudience: "[data-prompt-audience]",
  promptTone: "[data-prompt-tone]",
  promptResults: "[data-prompt-optimizer-results]",
  promptScore: "[data-prompt-score]",
  promptSummary: "[data-prompt-summary]",
  promptStrengths: "[data-prompt-strengths]",
  promptGaps: "[data-prompt-gaps]",
  promptSuggestions: "[data-prompt-suggestions]",
  promptOutput: "[data-optimized-prompt]",
  promptCopyButton: "[data-prompt-copy]",
  promptCopyFeedback: "[data-prompt-copy-feedback]",
  promptFeedback: "[data-prompt-feedback]",
};

document.documentElement.classList.add("js");

const SCROLL_OFFSET = 80;
const EMAILJS_STATUS_RESET_DELAY = 7000;

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  bindSmoothScroll();
  initFloatingNav();
  initTestimonialsCarousel();
  initScrollReveal();
  initContactFormEmail();
  initPromptOptimizer();
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

function initScrollReveal() {
  const elements = document.querySelectorAll(SELECTORS.revealTargets);
  if (!elements.length) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const target = entry.target;

        if (entry.isIntersecting) {
          window.requestAnimationFrame(() => {
            target.classList.add("is-visible");
          });

          if (target.dataset.revealOnce === "true") {
            observer.unobserve(target);
          }
          return;
        }

        if (target.dataset.revealRepeat !== "false") {
          window.requestAnimationFrame(() => {
            target.classList.remove("is-visible");
          });
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -12% 0px",
    }
  );

  elements.forEach((element) => {
    const delay = Number(element.dataset.revealDelay);
    if (!Number.isNaN(delay) && delay >= 0) {
      element.style.setProperty("--reveal-delay", `${delay}ms`);
    }
    observer.observe(element);
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

    const trimFieldValues = () => {
      const fields = form.querySelectorAll("input, textarea");
      fields.forEach((field) => {
        const isTextInput =
          field.tagName === "TEXTAREA" ||
          ["text", "email", "search", "tel", "url", "password", "hidden"].includes(
            field.type
          );

        if (isTextInput && typeof field.value === "string") {
          field.value = field.value.trim();
        }
      });
    };

    trimFieldValues();

    const isValid =
      typeof form.reportValidity === "function"
        ? form.reportValidity()
        : form.checkValidity();

    if (!isValid) {
      setStatus("Completa todos los campos requeridos.", "error");
      resetStatusLater();
      return;
    }

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

const PROMPT_COMPONENTS = [
  {
    id: "role",
    label: "Rol definido",
    suggestion:
      "Asegura que la IA asuma un rol concreto (por ejemplo: 'Actúa como estratega de marketing senior').",
    detector: (text) =>
      /(act[úu]a como|eres un[ao]?|asume el rol|you are|act as|imagina que eres)/i.test(text),
  },
  {
    id: "goal",
    label: "Objetivo explícito",
    suggestion:
      "Describe qué resultado necesitas con verbos accionables (analiza, diseña, redacta, evalúa, etc.).",
    detector: (text, ctx) =>
      Boolean(ctx.goal) ||
      /(objetivo|meta|quiero|necesito|genera|crea|produce|elabora|diseña|explica)/i.test(ctx.original),
  },
  {
    id: "audience",
    label: "Audiencia definida",
    suggestion:
      "Incluye a quién va dirigida la respuesta para ajustar el lenguaje y el nivel de detalle.",
    detector: (text, ctx) =>
      Boolean(ctx.audience) || /(para (un|una|el|la)|dirigido a|p[úu]blico|audiencia)/i.test(text),
  },
  {
    id: "tone",
    label: "Tono y estilo",
    suggestion:
      "Especifica el tono deseado (ej. profesional, persuasivo, cercano) y el formato esperado.",
    detector: (text, ctx) =>
      Boolean(ctx.tone) || /(tono|estilo|voz|formato|tabla|lista|pasos|bullet|estructura)/i.test(text),
  },
  {
    id: "constraints",
    label: "Criterios y restricciones",
    suggestion:
      "Añade límites claros: longitud máxima, métricas a cubrir, fuentes requeridas o supuestos a evitar.",
    detector: (text) =>
      /(no (uses|incluyas)|limita|m[áa]ximo|al menos|incluye|usa datos|usa ejemplos|deadline|fecha)/i.test(text),
  },
  {
    id: "examples",
    label: "Ejemplos o referencias",
    suggestion:
      "Comparte ejemplos, referencias o estructuras previas que la IA pueda seguir o mejorar.",
    detector: (text) => /(ejemplo|referencia|plantilla|modelo|sample)/i.test(text),
  },
];

function initPromptOptimizer() {
  const form = document.querySelector(SELECTORS.promptOptimizerForm);
  if (!form) return;

  const fields = {
    original: form.querySelector(SELECTORS.promptOriginal),
    goal: form.querySelector(SELECTORS.promptGoal),
    audience: form.querySelector(SELECTORS.promptAudience),
    tone: form.querySelector(SELECTORS.promptTone),
  };

  const results = document.querySelector(SELECTORS.promptResults);
  const scoreEl = results?.querySelector(SELECTORS.promptScore);
  const summaryEl = results?.querySelector(SELECTORS.promptSummary);
  const strengthsEl = results?.querySelector(SELECTORS.promptStrengths);
  const gapsEl = results?.querySelector(SELECTORS.promptGaps);
  const suggestionsEl = results?.querySelector(SELECTORS.promptSuggestions);
  const outputEl = results?.querySelector(SELECTORS.promptOutput);
  const copyButton = results?.querySelector(SELECTORS.promptCopyButton);
  const copyFeedback = results?.querySelector(SELECTORS.promptCopyFeedback);
  const feedbackEl = form.querySelector(SELECTORS.promptFeedback);

  if (!results || !fields.original) return;

  const resetFeedback = () => {
    if (feedbackEl) {
      feedbackEl.textContent = "";
      delete feedbackEl.dataset.state;
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    resetFeedback();

    const data = {
      original: fields.original.value.trim(),
      goal: fields.goal?.value.trim() || "",
      audience: fields.audience?.value.trim() || "",
      tone: fields.tone?.value.trim() || "",
    };

    if (!data.original) {
      if (feedbackEl) {
        feedbackEl.textContent = "Escribe un prompt para poder optimizarlo.";
        feedbackEl.dataset.state = "error";
      }
      return;
    }

    const analysis = analyzePrompt(data);

    if (copyFeedback) {
      copyFeedback.textContent = "";
      delete copyFeedback.dataset.state;
    }
    if (copyButton) {
      delete copyButton.dataset.state;
    }

    if (scoreEl) {
      scoreEl.textContent = `${analysis.score}`;
      scoreEl.dataset.level = analysis.level;
    }

    if (summaryEl) {
      summaryEl.textContent = analysis.summary;
    }

    if (strengthsEl) {
      strengthsEl.innerHTML = "";
      analysis.strengths.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        strengthsEl.appendChild(li);
      });
      if (strengthsEl.parentElement) {
        strengthsEl.parentElement.toggleAttribute(
          "hidden",
          analysis.strengths.length === 0
        );
      }
    }

    if (gapsEl) {
      gapsEl.innerHTML = "";
      analysis.gaps.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        gapsEl.appendChild(li);
      });
      if (gapsEl.parentElement) {
        gapsEl.parentElement.toggleAttribute(
          "hidden",
          analysis.gaps.length === 0
        );
      }
    }

    if (suggestionsEl) {
      suggestionsEl.innerHTML = "";
      analysis.suggestions.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        suggestionsEl.appendChild(li);
      });
    }

    if (outputEl) {
      outputEl.value = analysis.optimizedPrompt;
    }

    results.hidden = false;
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  if (copyButton && outputEl) {
    copyButton.addEventListener("click", () => {
      const text = outputEl.value;
      if (!text) return;

      const onSuccess = () => {
        copyButton.dataset.state = "copied";
        if (copyFeedback) {
          copyFeedback.textContent = "Prompt copiado";
          copyFeedback.dataset.state = "success";
        }
        window.setTimeout(() => {
          copyButton.dataset.state = "";
          if (copyFeedback) {
            copyFeedback.textContent = "";
            delete copyFeedback.dataset.state;
          }
        }, 2500);
      };

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(onSuccess).catch(() => {});
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          onSuccess();
        } catch (error) {
          if (copyFeedback) {
            copyFeedback.textContent = "No se pudo copiar automáticamente.";
            copyFeedback.dataset.state = "error";
          }
        } finally {
          document.body.removeChild(textarea);
        }
      }
    });
  }

  form.addEventListener("input", () => {
    resetFeedback();
  });
}

function analyzePrompt(data) {
  const combinedText = [data.original, data.goal, data.audience, data.tone]
    .filter(Boolean)
    .join(" \n");

  const wordCount = data.original.split(/\s+/).filter(Boolean).length;

  const strengths = [];
  const gaps = [];

  PROMPT_COMPONENTS.forEach((component) => {
    const hasComponent = component.detector(combinedText, {
      ...data,
      original: data.original,
    });
    if (hasComponent) {
      strengths.push(component.label);
    } else {
      gaps.push(component.suggestion);
    }
  });

  let score = 55 + strengths.length * 6 - gaps.length * 4;

  if (wordCount >= 40 && wordCount <= 180) {
    score += 12;
  } else if (wordCount < 25) {
    gaps.push(
      "Amplía el contexto con detalles relevantes (usuario final, canal, métricas)."
    );
    score -= 8;
  } else if (wordCount > 220) {
    gaps.push(
      "Reduce repeticiones: prompts demasiado extensos pierden claridad."
    );
    score -= 6;
  }

  const hasSteps = /\d+\.|paso|primero|segundo|enumer(a|e)/i.test(data.original);
  if (!hasSteps) {
    gaps.push(
      "Organiza la petición en pasos o viñetas para guiar a la IA paso a paso."
    );
    score -= 4;
  } else {
    strengths.push("Secuencia de acciones detectada");
    score += 4;
  }

  score = Math.max(5, Math.min(100, Math.round(score)));
  const clarityLevel = score >= 85 ? "alto" : score >= 60 ? "medio" : "bajo";

  const dedupedStrengths = dedupe(strengths);
  const dedupedGaps = dedupe(gaps);

  const summary = buildSummary({
    strengths: dedupedStrengths,
    gaps: dedupedGaps,
    score,
  });

  const optimizedPrompt = buildOptimizedPrompt(data, dedupedStrengths);

  const suggestions = buildSuggestionsList(dedupedGaps);

  return {
    score,
    level: clarityLevel,
    strengths: dedupedStrengths,
    gaps: dedupedGaps,
    suggestions,
    summary,
    optimizedPrompt,
  };
}

function buildSummary({ strengths, gaps, score }) {
  const strengthsCount = dedupe(strengths).length;
  const gapsCount = dedupe(gaps).length;
  const levelLabel = score >= 85 ? "excelente" : score >= 60 ? "sólido" : "mejorable";

  return `Claridad ${levelLabel}. ${strengthsCount} fortaleza(s) y ${gapsCount} oportunidad(es) detectadas.`;
}

function buildSuggestionsList(gaps) {
  const deduped = dedupe(gaps);
  if (!deduped.length) {
    return [
      "Tu prompt ya es robusto. Considera añadir ejemplos concretos para obtener respuestas aún más precisas.",
    ];
  }
  return deduped.slice(0, 5);
}

function dedupe(items) {
  return [...new Set(items.filter(Boolean))];
}

function buildOptimizedPrompt(data, strengths) {
  const role = extractRole(data.original) || inferRoleFromGoal(data.goal);
  const goal =
    data.goal ||
    inferGoalFromPrompt(data.original) ||
    "Genera una respuesta exhaustiva y accionable.";
  const goalLine = ensureTrailingPeriod(capitalizeFirst(goal));
  const audienceLine = data.audience
    ? ensureTrailingPeriod(`Audiencia objetivo: ${capitalizeFirst(data.audience)}`)
    : "";
  const toneLine = data.tone
    ? ensureTrailingPeriod(`Tono y estilo: ${capitalizeFirst(data.tone)}`)
    : "Tono y estilo: Mantén un tono profesional y claro.";

  const instructions = buildInstructionSteps(data.original);
  const hasExamples = strengths.includes("Ejemplos o referencias");

  const criteria = [
    "Responde con secciones tituladas y viñetas cuando aporten claridad.",
    "Incluye justificaciones o supuestos clave para cada recomendación.",
    "Verifica coherencia y consistencia al finalizar la respuesta.",
  ];

  if (!hasExamples) {
    criteria.push("Propón al menos un ejemplo concreto que aterrice la solución.");
  }

  let optimized = `${role}\n\n`;
  optimized += `Objetivo principal: ${goalLine}\n`;
  if (audienceLine) optimized += `${audienceLine}\n`;
  optimized += `${toneLine}\n\n`;
  optimized += `Instrucciones detalladas:\n`;

  if (instructions.length) {
    optimized += instructions
      .map((step, index) => `${index + 1}. ${capitalizeFirst(step)}`)
      .join("\n");
  } else {
    optimized += `1. Analiza el contexto proporcionado.\n2. Desarrolla la respuesta paso a paso.\n3. Destaca riesgos, oportunidades y próximos pasos.`;
  }

  optimized += `\n\nCriterios de calidad:\n`;
  optimized += criteria.map((item) => `- ${item}`).join("\n");

  optimized += `\n\nComprobación final:\n- Resume en 2 frases los puntos clave.\n- Sugiere una acción concreta para continuar.`;

  return optimized;
}

function extractRole(text) {
  const match = text.match(
    /(act[úu]a como|asume el rol de|imagina que eres|you are|act as)\s+([^\.\n]+)/i
  );
  if (match) {
    return `Actúa como ${capitalizeFirst(match[2].trim())}.`;
  }
  const eresMatch = text.match(/eres (un[ao]? [^\.\n]+)/i);
  if (eresMatch) {
    return `Actúa como ${capitalizeFirst(eresMatch[1].trim())}.`;
  }
  return "Actúa como un especialista senior en el tema solicitado.";
}

function inferRoleFromGoal(goal) {
  if (!goal) return "Actúa como un especialista senior en estrategia y comunicación.";
  const focus = goal.split(/[,\.]/)[0].trim();
  if (!focus) {
    return "Actúa como un especialista senior en estrategia y comunicación.";
  }
  return `Actúa como un especialista senior en ${focus.toLowerCase()}.`;
}

function inferGoalFromPrompt(prompt) {
  if (!prompt) return "";
  const sanitized = prompt
    .replace(/^(necesito|quiero|podr[ií]as|por favor)/i, "")
    .trim();
  const sentence = sanitized.split(/\.|\n/)[0].trim();
  return sentence || "";
}

function buildInstructionSteps(prompt) {
  if (!prompt) return [];
  const lines = prompt
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return lines;
  }

  const sentences = prompt
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚ0-9¡¿])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length > 1) {
    return sentences;
  }

  const commaSeparated = prompt
    .split(/,|;|\sy\s/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (commaSeparated.length > 1) {
    return commaSeparated;
  }

  return lines;
}

function ensureTrailingPeriod(text) {
  if (!text) return "";
  const trimmed = text.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function capitalizeFirst(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
