// Script JavaScript para funcionalidad interactiva
const storageKey = "theme-preference";
// Clave para almacenar la preferencia de tema en localStorage
const toggle = document.querySelector("#theme-toggle");
// Selecciona el botón de cambio de tema

const getColorPreference = () => {
  // Función para obtener la preferencia de color del usuario
  if (localStorage.getItem(storageKey)) {
    // Si hay una preferencia guardada, la retorna
    return localStorage.getItem(storageKey);
  }
  // Si no, usa la preferencia del sistema (oscuro o claro)
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const reflectPreference = () => {
  // Función para aplicar la preferencia de tema al documento
  const theme = getColorPreference();
  document.documentElement.setAttribute("data-theme", theme);
  // Establece el atributo data-theme en el elemento html
};

// Cargar preferencia inicial
reflectPreference();
// Aplica la preferencia al cargar la página

toggle.addEventListener("click", () => {
  // Event listener para el botón de cambio de tema
  const currentTheme = getColorPreference();
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  // Alterna entre oscuro y claro
  localStorage.setItem(storageKey, nextTheme);
  // Guarda la nueva preferencia
  reflectPreference();
  // Aplica el cambio
});

// Sincronizar con cambios del sistema
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches: isDark }) => {
    // Escucha cambios en la preferencia del sistema
    localStorage.setItem(storageKey, isDark ? "dark" : "light");
    // Actualiza localStorage
    reflectPreference();
    // Aplica el cambio
  });

// --- Animaciones de Scroll (Intersection Observer) ---
// Sistema de animaciones que se activan cuando los elementos entran en el viewport

// Función para crear el observer de intersección
const createScrollObserver = () => {
  // Configuración del Intersection Observer
  const observerOptions = {
    threshold: 0.1, // El 10% del elemento debe estar visible
    rootMargin: "0px 0px -50px 0px", // Activar 50px antes de que el elemento entre completamente
  };

  // Crear el observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Si el elemento está intersectando (visible), agregar clase 'visible'
        entry.target.classList.add("visible");
        // Una vez animado, dejar de observarlo para optimizar performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  return observer;
};

// Función para inicializar las animaciones
const initScrollAnimations = () => {
  const observer = createScrollObserver();

  // Seleccionar elementos a animar
  const sections = document.querySelectorAll("section");
  const projectCards = document.querySelectorAll(".project-card");
  const skillCategories = document.querySelectorAll(".skill-category");
  const heroContent = document.querySelector(".hero-content");
  const heroImage = document.querySelector(".hero-image");

  // Agregar clases de animación a los elementos
  if (heroContent) {
    heroContent.classList.add("fade-in");
  }

  if (heroImage) {
    heroImage.classList.add("slide-in-right");
  }

  // Agregar animaciones a las secciones
  sections.forEach((section, index) => {
    section.classList.add("fade-in");
    // Agregar delays escalonados para efecto de cascada
    if (index === 0) section.classList.add("delay-1");
    else if (index === 1) section.classList.add("delay-2");
    else section.classList.add("delay-3");
  });

  // Agregar animaciones a las tarjetas de proyectos
  projectCards.forEach((card, index) => {
    card.classList.add("scale-in");
    // Delays para animar las tarjetas en secuencia
    card.classList.add(`delay-${(index % 3) + 1}`);
  });

  // Agregar animaciones a las categorías de habilidades
  skillCategories.forEach((category, index) => {
    category.classList.add("slide-in-left");
    category.classList.add(`delay-${index + 1}`);
  });

  // Observar todos los elementos con clase fade-in
  const animatedElements = document.querySelectorAll(
    ".fade-in, .slide-in-left, .slide-in-right, .scale-in",
  );
  animatedElements.forEach((element) => {
    observer.observe(element);
  });
};

// Inicializar animaciones cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", initScrollAnimations);
