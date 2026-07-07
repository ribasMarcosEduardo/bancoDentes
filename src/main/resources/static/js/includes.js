function applyTheme(theme) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
}

function setupThemeToggle() {
    const themeToggle = document.querySelector("#themeToggle");

    if (!themeToggle) return;

    function renderIcon(theme) {
        themeToggle.innerHTML = `
            <i class="icon" data-lucide="${theme === "dark" ? "sun" : "moon"}"></i>
        `;

        lucide.createIcons();
    }

    function setTheme(theme) {
        applyTheme(theme);
        localStorage.setItem("theme", theme);
        renderIcon(theme);
    }

    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    themeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.contains("dark");
        const newTheme = isDark ? "light" : "dark";

        setTheme(newTheme);
    });
}

async function loadIncludes() {
    const includes = document.querySelectorAll("[data-include]");

    for (const element of includes) {
        const file = element.getAttribute("data-include");
        const response = await fetch(file);

        if (response.ok) {
            element.innerHTML = await response.text();
        } else {
            element.innerHTML = "Erro ao carregar componente.";
        }
    }

    lucide.createIcons();
    setupMobileMenu();
    setupThemeToggle();
}

function setupMobileMenu() {
    const openBtn = document.querySelector(".mobile-menu-toggle");
    const closeBtn = document.querySelector(".mobile-menu__close");
    const menu = document.querySelector(".mobile-menu");
    const overlay = document.querySelector(".mobile-menu-overlay");

    if (!openBtn || !closeBtn || !menu || !overlay) return;

    function openMenu() {
        menu.classList.add("is-open");
        overlay.classList.add("is-open");
    }

    function closeMenu() {
        menu.classList.remove("is-open");
        overlay.classList.remove("is-open");
    }

    openBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);
}

const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

loadIncludes();