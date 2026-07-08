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

function setupFilters() {
    const sections = document.querySelectorAll(".filter-section");
    const checkboxes = document.querySelectorAll(".checkbox-filter input");
    const activeFilters = document.querySelector("#activeFilters");
    const clearButton = document.querySelector(".filters-clear");
    const rows = document.querySelectorAll(".request-row");

    sections.forEach((section) => {
        const toggle = section.querySelector(".filter-section__toggle");
        toggle.addEventListener("click", () => {
            section.classList.toggle("is-closed");
        });
    });

    function applyFilters() {
        const selectedFilters = {};
        checkboxes.forEach(cb => {
            if (cb.checked) {
                const group = cb.getAttribute('data-filter-group');
                if (!selectedFilters[group]) selectedFilters[group] = [];
                selectedFilters[group].push(cb.value.toLowerCase().trim());
            }
        });

        const hasActiveFilters = Object.keys(selectedFilters).length > 0;

        rows.forEach(row => {
            if (!hasActiveFilters) {
                row.style.display = '';
                return;
            }

            let shouldShow = true;

            for (const group in selectedFilters) {
                let rowValue = "";
                if (group === "Status") rowValue = row.getAttribute("data-status");
                else if (group === "Grupo dentário") rowValue = row.getAttribute("data-grupo");
                else if (group === "Arcada") rowValue = row.getAttribute("data-arcada");
                else if (group === "Dentição") rowValue = row.getAttribute("data-denticao");
                else if (group === "Estado") rowValue = row.getAttribute("data-estado");

                rowValue = (rowValue || "").toLowerCase().trim();

                if (!selectedFilters[group].includes(rowValue)) {
                    shouldShow = false;
                    break;
                }
            }

            row.style.display = shouldShow ? '' : 'none';
        });
    }

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
                applyFilters();
            });

            activeFilters.appendChild(chip);
        });

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            renderActiveFilters();
            applyFilters();
        });
    });

    if (clearButton) {
        clearButton.addEventListener("click", () => {
            checkboxes.forEach((checkbox) => {
                checkbox.checked = false;
            });
            renderActiveFilters();
            applyFilters();
        });
    }
}

setupFilters();

function setupFilters() {
    const sections = document.querySelectorAll(".filter-section");
    const checkboxes = document.querySelectorAll(".checkbox-filter input");
    const activeFilters = document.querySelector("#activeFilters");
    const clearButton = document.querySelector(".filters-clear");
    const tableContainer = document.querySelector(".result-table--historico");
    const btnSortOrder = document.getElementById("btnSortOrder");
    const pageSizeSelect = document.getElementById("pageSize");
    const btnPrevPage = document.getElementById("btnPrevPage");
    const btnNextPage = document.getElementById("btnNextPage");
    const paginationInfo = document.getElementById("paginationInfo");

    let sortAscending = true;
    let currentPage = 1;
    let rowsPerPage = parseInt(pageSizeSelect ? pageSizeSelect.value : 10);

    sections.forEach((section) => {
        const toggle = section.querySelector(".filter-section__toggle");
        toggle.addEventListener("click", () => {
            section.classList.toggle("is-closed");
        });
    });

    // --- ORDENAÇÃO ---
    if (btnSortOrder) {
        btnSortOrder.addEventListener("click", () => {
            sortAscending = !sortAscending;
            const currentRows = Array.from(document.querySelectorAll(".request-row"));

            currentRows.sort((a, b) => {
                const codeA = parseInt(a.getAttribute("data-codigo")) || 0;
                const codeB = parseInt(b.getAttribute("data-codigo")) || 0;
                return sortAscending ? (codeA - codeB) : (codeB - codeA);
            });

            currentRows.forEach(row => tableContainer.appendChild(row));

            const icon = btnSortOrder.querySelector("i");
            if (icon) {
                icon.setAttribute("data-lucide", sortAscending ? "arrow-up" : "arrow-down");
                if (window.lucide) lucide.createIcons();
            }

            currentPage = 1;
            applyPagination();
        });
    }

    // --- FILTRAGEM ---
    function applyFilters() {
        const rows = document.querySelectorAll(".request-row");
        const selectedFilters = {};

        checkboxes.forEach(cb => {
            if (cb.checked) {
                const group = cb.getAttribute('data-filter-group');
                if (!selectedFilters[group]) selectedFilters[group] = [];
                selectedFilters[group].push(cb.value.toLowerCase().trim());
            }
        });

        const hasActiveFilters = Object.keys(selectedFilters).length > 0;

        rows.forEach(row => {
            if (!hasActiveFilters) {
                row.classList.remove('is-hidden-by-filter');
                return;
            }

            let shouldShow = true;

            for (const group in selectedFilters) {
                let rowValue = "";

                if (group === "Status") rowValue = row.getAttribute("data-status");
                else if (group === "Grupo dentário") rowValue = row.getAttribute("data-grupo");
                else if (group === "Estado") rowValue = row.getAttribute("data-estado");
                else if (group === "Arcada") rowValue = row.getAttribute("data-arcada");
                else if (group === "Dentição") rowValue = row.getAttribute("data-denticao");

                rowValue = (rowValue || "").toLowerCase().trim();

                if (!selectedFilters[group].includes(rowValue)) {
                    shouldShow = false;
                    break;
                }
            }

            if (shouldShow) {
                row.classList.remove('is-hidden-by-filter');
            } else {
                row.classList.add('is-hidden-by-filter');
            }
        });

        currentPage = 1;
        applyPagination();
    }

    // --- PAGINAÇÃO ---
    function applyPagination() {
        const currentRows = document.querySelectorAll(".request-row");
        const visibleRows = Array.from(currentRows).filter(row => !row.classList.contains('is-hidden-by-filter'));
        const totalRows = visibleRows.length;
        const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        currentRows.forEach(row => row.style.display = 'none');

        visibleRows.slice(startIndex, endIndex).forEach(row => {
            row.style.display = '';
        });

        if (paginationInfo) {
            paginationInfo.innerHTML = `${totalRows} Solicitações Encontradas <span style="font-weight: normal; margin-left: 8px;">(Página ${currentPage} de ${totalPages})</span>`;
        }

        if (btnPrevPage) btnPrevPage.disabled = (currentPage === 1);
        if (btnNextPage) btnNextPage.disabled = (currentPage === totalPages);
    }

    // --- CHIPS VISUAIS DOS FILTROS ---
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
                applyFilters();
            });

            activeFilters.appendChild(chip);
        });

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // --- EVENTOS E INICIALIZAÇÃO ---
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener("change", (e) => {
            rowsPerPage = parseInt(e.target.value);
            currentPage = 1;
            applyPagination();
        });
    }

    if (btnPrevPage) {
        btnPrevPage.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                applyPagination();
            }
        });
    }

    if (btnNextPage) {
        btnNextPage.addEventListener("click", () => {
            const currentRows = document.querySelectorAll(".request-row");
            const visibleRows = Array.from(currentRows).filter(row => !row.classList.contains('is-hidden-by-filter'));
            const totalPages = Math.ceil(visibleRows.length / rowsPerPage) || 1;

            if (currentPage < totalPages) {
                currentPage++;
                applyPagination();
            }
        });
    }

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            renderActiveFilters();
            applyFilters();
        });
    });

    if (clearButton) {
        clearButton.addEventListener("click", () => {
            checkboxes.forEach((checkbox) => {
                checkbox.checked = false;
            });
            renderActiveFilters();
            applyFilters();
        });
    }

    applyPagination();
}

document.addEventListener("DOMContentLoaded", setupFilters);