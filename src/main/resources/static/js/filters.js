// Seleciona os elementos do DOM e inicializa as variáveis de controle
function setupFilters() {
    const sections = document.querySelectorAll(".filter-section");
    const checkboxes = document.querySelectorAll(".checkbox-filter input");
    const activeFilters = document.querySelector("#activeFilters");
    const activeFiltersBar = document.querySelector(".active-filters-bar");
    const clearButton = document.querySelector(".filters-clear");
    const tableContainer = document.querySelector(".result-table");
    const btnSortOrder = document.getElementById("btnSortOrder");
    const sortSelect = document.getElementById("sort-requests");
    const pageSizeSelect = document.getElementById("pageSize");
    const btnPrevPage = document.getElementById("btnPrevPage");
    const btnNextPage = document.getElementById("btnNextPage");
    const paginationInfo = document.getElementById("paginationInfo");

    let sortAscending = false;
    let currentPage = 1;
    let rowsPerPage = parseInt(pageSizeSelect ? pageSizeSelect.value : 10);

    // Esconde a barra de filtros ativos no carregamento da página
    if (activeFiltersBar) {
        activeFiltersBar.style.display = 'none';
    }

    // Configura o comportamento de abrir/fechar as seções do menu lateral de filtros
    sections.forEach((section) => {
        const toggle = section.querySelector(".filter-section__toggle");
        if(toggle) {
            toggle.addEventListener("click", () => {
                section.classList.toggle("is-closed");
            });
        }
    });

    // Ordena as linhas da tabela com base no código da solicitação
    function sortTable() {
        const currentRows = Array.from(document.querySelectorAll(".request-row, .card"));

        currentRows.sort((a, b) => {
            const codeA = parseInt(a.getAttribute("data-codigo")) || 0;
            const codeB = parseInt(b.getAttribute("data-codigo")) || 0;
            return sortAscending ? (codeA - codeB) : (codeB - codeA);
        });

        if (tableContainer) {
            currentRows.forEach(row => tableContainer.appendChild(row));
        }

        currentPage = 1;
        applyPagination();
    }

    // Alterna a ordem e atualiza o ícone ao clicar no botão de ordenar
    if (btnSortOrder) {
        btnSortOrder.addEventListener("click", () => {
            sortAscending = !sortAscending;
            sortTable();

            let icon = btnSortOrder.querySelector(".orderBy-icon");
            if (icon) {
                const newIcon = document.createElement("i");
                newIcon.className = "orderBy-icon";
                newIcon.setAttribute("data-lucide", sortAscending ? "arrow-up" : "arrow-down");

                icon.replaceWith(newIcon);

                if (window.lucide) {
                    lucide.createIcons();
                }
            }
        });
    }

    // Aplica a ordenação ao alterar a opção no menu dropdown (select)
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            if (e.target.value === "recent") {
                sortAscending = false;
            } else if (e.target.value === "oldest") {
                sortAscending = true;
            }
            sortTable();
        });
    }

    // Filtra as linhas da tabela ocultando as que não correspondem aos itens selecionados
    function applyFilters() {
        const rows = document.querySelectorAll(".request-row, .card");
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

    // Controla a exibição das linhas por página e atualiza os botões de navegação
    function applyPagination() {
        const currentRows = document.querySelectorAll(".request-row, .card");
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

    // Gerencia a criação, remoção e exibição dos chips visuais de filtros ativos
    const chipsByCheckbox = new Map();

    function createChip(checkbox) {
        const chip = document.createElement("span");
        chip.className = "filter-chip filter-chip--hidden";
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

        if (activeFilters) activeFilters.appendChild(chip);
        chipsByCheckbox.set(checkbox, chip);

        void chip.offsetWidth;
        requestAnimationFrame(() => {
            chip.classList.remove("filter-chip--hidden");
        });

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function removeChip(checkbox) {
        const chip = chipsByCheckbox.get(checkbox);
        if (!chip) return;

        chipsByCheckbox.delete(checkbox);
        chip.classList.add("filter-chip--hidden");

        chip.addEventListener(
            "transitionend",
            () => chip.remove(),
            { once: true }
        );
    }

    function renderActiveFilters() {
        checkboxes.forEach((checkbox) => {
            const hasChip = chipsByCheckbox.has(checkbox);

            if (checkbox.checked && !hasChip) {
                createChip(checkbox);
            } else if (!checkbox.checked && hasChip) {
                removeChip(checkbox);
            }
        });

        if (activeFiltersBar) {
            const hasActive = chipsByCheckbox.size > 0;
            activeFiltersBar.style.display = hasActive ? '' : 'none';
            activeFiltersBar.classList.toggle("has-active", hasActive);
        }
    }

    // Configura os eventos de mudança no select de quantidade e botões de página
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
                const currentRows = document.querySelectorAll(".request-row, .card");
                const visibleRows = Array.from(currentRows).filter(row => !row.classList.contains('is-hidden-by-filter'));
                const totalPages = Math.ceil(visibleRows.length / rowsPerPage) || 1;

                if (currentPage < totalPages) {
                    currentPage++;
                    applyPagination();
                }
            });
    }

    // Escuta as marcações nos checkboxes para atualizar a UI e a tabela
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            renderActiveFilters();
            applyFilters();
        });
    });

    // Limpa todos os filtros selecionados e redefine a tabela ao clicar em resetar
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

// Inicializa o script garantindo que o DOM já foi completamente carregado
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", setupFilters);
} else {
    setupFilters();
}