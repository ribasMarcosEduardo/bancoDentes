function setupFilters() {
    const sections = document.querySelectorAll(".filter-section");
    const checkboxes = document.querySelectorAll(".checkbox-filter input");
    const activeFilters = document.querySelector("#activeFilters");
    const clearButton = document.querySelector(".filters-clear");

    sections.forEach((section) => {
        const toggle = section.querySelector(".filter-section__toggle");

        toggle.addEventListener("click", () => {
            section.classList.toggle("is-closed");
        });
    });

    function renderActiveFilters() {
        activeFilters.innerHTML = "";

        checkboxes.forEach((checkbox) => {
            if (!checkbox.checked) return;

            const chip = document.createElement("span");
            chip.className = "filter-chip";
            chip.innerHTML = `
                ${checkbox.value}
                <button type="button" aria-label="Remover filtro">
                    <i class="icon" data-lucide="x"></i>
                </button>
            `;

            chip.querySelector("button").addEventListener("click", () => {
                checkbox.checked = false;
                renderActiveFilters();
            });

            activeFilters.appendChild(chip);
        });

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", renderActiveFilters);
    });

    clearButton.addEventListener("click", () => {
        checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
        });

        renderActiveFilters();
    });
}

setupFilters();