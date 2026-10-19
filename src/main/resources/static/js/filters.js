// Minúsculas e sem acento, pra "manutencao" achar "Manutenção" na busca
function normalizarBusca(texto) {
    return (texto || "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// Estado do painel guardado antes de uma ação que recarrega a própria página
// (salvarEstadoPainel) e restaurado uma única vez na carga seguinte.
// Expira rápido pra não reaparecer se a ação acabar levando pra outra tela.
const ESTADO_PAINEL_KEY = "estadoPainel:" + location.pathname;
const ESTADO_PAINEL_TTL_MS = 60 * 1000;

function lerEstadoPainelSalvo() {
    try {
        const bruto = sessionStorage.getItem(ESTADO_PAINEL_KEY);
        sessionStorage.removeItem(ESTADO_PAINEL_KEY);
        const estado = bruto ? JSON.parse(bruto) : null;
        return estado && Date.now() - estado.salvoEm < ESTADO_PAINEL_TTL_MS ? estado : null;
    } catch {
        return null;
    }
}

// Seleciona os elementos do DOM e inicializa as variáveis de controle
function setupFilters() {
    const sections = document.querySelectorAll(".filter-section");
    const checkboxes = document.querySelectorAll(".checkbox-filter input");
    const activeFilters = document.querySelector("#activeFilters");
    const activeFiltersBar = document.querySelector(".active-filters-bar");
    const clearButtons = document.querySelectorAll(".filters-clear");
    const tableContainer = document.querySelector(".result-table");
    const gridContainer = document.querySelector(".results-grid");
    const emptyStateFiltro = document.getElementById("emptyStateFiltro");
    const btnSortOrder = document.getElementById("btnSortOrder");
    const sortSelect = document.getElementById("sort-requests");
    const pageSizeSelect = document.getElementById("pageSize");
    const btnPrevPage = document.getElementById("btnPrevPage");
    const btnNextPage = document.getElementById("btnNextPage");
    const paginationRange = document.getElementById("paginationRange");
    const paginationInfo = document.getElementById("paginationInfo");
    const paginationLabel = paginationInfo ? (paginationInfo.getAttribute("data-label") || "Resultados Encontrados") : "";
    // Busca da toolbar do painel (os campos de busca dos modais ficam fora da .toolbar)
    const searchInput = document.querySelector(".toolbar input[type='search']");

    let sortAscending = false;
    let currentPage = 1;
    let rowsPerPage = parseInt(pageSizeSelect ? pageSizeSelect.value : 10);

    // Configura o comportamento de abrir/fechar as seções do menu lateral de filtros
    sections.forEach((section) => {
        const toggle = section.querySelector(".filter-section__toggle");
        if(toggle) {
            toggle.setAttribute("aria-expanded", String(!section.classList.contains("is-closed")));

            toggle.addEventListener("click", () => {
                const isClosed = section.classList.toggle("is-closed");
                toggle.setAttribute("aria-expanded", String(!isClosed));
            });
        }
    });

    // Ordena as linhas da tabela com base no código da solicitação
    function sortTable() {
        const currentRows = Array.from(document.querySelectorAll(".request-row, .card"));

        currentRows.sort((a, b) => {
            const codeA = parseInt(a.dataset.sort ?? a.dataset.codigo) || 0;
            const codeB = parseInt(b.dataset.sort ?? b.dataset.codigo) || 0;
            return sortAscending ? (codeA - codeB) : (codeB - codeA);
        });

        currentRows.forEach(row => {
            const container = row.classList.contains("card") ? gridContainer : tableContainer;
            if (container) container.appendChild(row);
        });

        currentPage = 1;
        applyPagination();
    }

    function atualizarIconeOrdem() {
        const icon = btnSortOrder?.querySelector(".orderBy-icon");
        if (!icon) return false;

        const newIcon = document.createElement("i");
        newIcon.className = "orderBy-icon";
        newIcon.setAttribute("data-lucide", sortAscending ? "arrow-down-up" : "arrow-up-down");
        icon.replaceWith(newIcon);

        if (window.lucide) {
            lucide.createIcons();
        }
        return true;
    }

    // Alterna a ordem e atualiza o ícone ao clicar no botão de ordenar
    if (btnSortOrder) {
        btnSortOrder.addEventListener("click", () => {
            sortAscending = !sortAscending;
            sortTable();

            if (atualizarIconeOrdem()) {
                // lucide.createIcons() troca o <i data-lucide> por um <svg> novo
                // (mesma classe, nó diferente) — precisa reconsultar depois de
                // rodar, senão a animação tenta grudar num elemento que já não
                // está mais no DOM.
                const spinIcon = btnSortOrder.querySelector(".orderBy-icon");
                if (spinIcon) {
                    spinIcon.classList.add("orderBy-icon--spin");
                    spinIcon.addEventListener(
                        "animationend",
                        () => spinIcon.classList.remove("orderBy-icon--spin"),
                        { once: true }
                    );
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

        const termoBusca = normalizarBusca(searchInput?.value);

        rows.forEach(row => {
            let shouldShow = true;

            // Busca pelo texto do data-busca de cada linha (ex.: identificação do
            // frasco). Itens sem data-busca não entram na busca.
            if (termoBusca && row.hasAttribute("data-busca")
                && !normalizarBusca(row.getAttribute("data-busca")).includes(termoBusca)) {
                row.classList.add('is-hidden-by-filter');
                return;
            }

            // Itens marcados com data-oculto-padrao="true" (ex.: frascos inativos)
            // ficam escondidos até o status deles ser marcado no filtro "Status".
            if (row.getAttribute("data-oculto-padrao") === "true") {
                const rowStatus = (row.getAttribute("data-status") || "").toLowerCase().trim();
                const statusSelecionados = selectedFilters["Status"] || [];
                if (!statusSelecionados.includes(rowStatus)) {
                    row.classList.add('is-hidden-by-filter');
                    return;
                }
            }

            for (const group in selectedFilters) {
                let rowValue = "";

                if (group === "Status") rowValue = row.getAttribute("data-status");
                else if (group === "Grupo dentário") rowValue = row.getAttribute("data-grupo");
                else if (group === "Estado") rowValue = row.getAttribute("data-estado");
                else if (group === "Arcada") rowValue = row.getAttribute("data-arcada");
                else if (group === "Dentição") rowValue = row.getAttribute("data-denticao");
                else if (group === "Origem") rowValue = row.getAttribute("data-origem");
                else if (group === "Tipo") rowValue = row.getAttribute("data-tipo");

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
        const currentRows = Array.from(document.querySelectorAll(".request-row"));
        const cardByCodigo = new Map();
        document.querySelectorAll(".card").forEach(card => {
            cardByCodigo.set(card.getAttribute("data-codigo"), card);
        });

        const visibleRows = currentRows.filter(row =>
            !row.classList.contains('is-hidden-by-filter') &&
            !row.classList.contains('is-hidden-by-sector') &&
            !row.classList.contains('is-hidden-by-status')
        );
        const totalRows = visibleRows.length;
        const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        function setVisibility(row, visible) {
            row.style.display = visible ? '' : 'none';
            const card = cardByCodigo.get(row.getAttribute("data-codigo"));
            if (card) card.style.display = visible ? '' : 'none';
        }

        currentRows.forEach(row => setVisibility(row, false));
        visibleRows.slice(startIndex, endIndex).forEach(row => setVisibility(row, true));

        if (paginationInfo) {
            if (paginationRange) {
                const ordenacao = sortAscending ? "Mais Antigos" : "Mais Recentes";
                paginationInfo.textContent = `${totalRows} ${paginationLabel} - ${ordenacao}`;
            } else {
                paginationInfo.innerHTML = `${totalRows} ${paginationLabel} <span style="font-weight: normal; margin-left: 8px;">(Página ${currentPage} de ${totalPages})</span>`;
            }
        }

        if (paginationRange) {
            paginationRange.textContent = totalRows === 0 ? "0-0" : `${startIndex + 1}-${Math.min(endIndex, totalRows)}`;
        }

        if (btnPrevPage) btnPrevPage.disabled = (currentPage === 1);
        if (btnNextPage) btnNextPage.disabled = (currentPage === totalPages);

        // Estado vazio por filtro/busca — o elemento só existe no DOM
        // quando a página já tem pelo menos 1 item vindo do banco (ele
        // é renderizado dentro de <section th:if="!isEmpty(...)">); o
        // banco vazio de verdade já tem seu próprio aviso, fora dessa
        // section, então não passa por aqui. tableContainer/gridContainer
        // (não a .results inteira) porque o próprio emptyStateFiltro
        // mora dentro de .results, como irmão dos dois.
        if (emptyStateFiltro) {
            const semResultado = totalRows === 0;
            emptyStateFiltro.hidden = !semResultado;
            if (tableContainer) tableContainer.style.display = semResultado ? "none" : "";
            if (gridContainer) gridContainer.style.display = semResultado ? "none" : "";
        }
    }

    // Exposto global pro setSector/setStatus (results.js) recalcular
    // contagem/paginação/estado vazio ao trocar Todos/BDH/Biobanco ou
    // Em andamento/Concluídas — eles só marcam is-hidden-by-sector /
    // is-hidden-by-status em cada item, quem decide
    // o que fica visível de fato é sempre esta função. results.js roda
    // depois de filters.js (ver ordem dos <script> nas páginas que têm
    // #sectorSwitch), então já encontra isto definido.
    window.applyPagination = applyPagination;

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
            activeFiltersBar.classList.toggle("has-active", chipsByCheckbox.size > 0);
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
                const currentRows = document.querySelectorAll(".request-row");
                const visibleRows = Array.from(currentRows).filter(row =>
                    !row.classList.contains('is-hidden-by-filter') &&
                    !row.classList.contains('is-hidden-by-sector') &&
                    !row.classList.contains('is-hidden-by-status')
                );
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
    // (querySelectorAll, não só o da barra de filtros ativos — o botão
    // "Resetar Filtros" do estado vazio, ver partials/empty_state.html,
    // usa a mesma classe e precisa disparar a mesma limpeza)
    clearButtons.forEach((clearButton) => {
        clearButton.addEventListener("click", () => {
            checkboxes.forEach((checkbox) => {
                checkbox.checked = false;
            });
            if (searchInput && searchInput.value) {
                searchInput.value = "";
                // Atualiza o botão "x" da busca (search.js escuta "input")
                searchInput.dispatchEvent(new Event("input", { bubbles: true }));
            }
            renderActiveFilters();
            applyFilters();
        });
    });

    // Busca filtra enquanto digita; o "x" (search.js) dispara "input" ao limpar
    searchInput?.addEventListener("input", applyFilters);

    window.salvarEstadoPainel = () => {
        try {
            sessionStorage.setItem(ESTADO_PAINEL_KEY, JSON.stringify({
                salvoEm: Date.now(),
                filtros: Array.from(checkboxes)
                    .filter(cb => cb.checked)
                    .map(cb => [cb.getAttribute("data-filter-group"), cb.value]),
                busca: searchInput?.value || "",
                sortAscending,
                sortSelect: sortSelect?.value,
                pageSize: pageSizeSelect?.value,
                page: currentPage
            }));
        } catch {
            // sessionStorage indisponível: só perde a restauração
        }
    };

    const estadoSalvo = lerEstadoPainelSalvo();

    if (estadoSalvo) {
        const marcados = new Set(estadoSalvo.filtros.map(([grupo, valor]) => grupo + "|" + valor));
        checkboxes.forEach(cb => {
            cb.checked = marcados.has(cb.getAttribute("data-filter-group") + "|" + cb.value);
        });

        if (searchInput && estadoSalvo.busca) {
            searchInput.value = estadoSalvo.busca;
            searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        }

        if (pageSizeSelect && estadoSalvo.pageSize) {
            pageSizeSelect.value = estadoSalvo.pageSize;
            rowsPerPage = parseInt(pageSizeSelect.value);
        }

        if (sortSelect && estadoSalvo.sortSelect) sortSelect.value = estadoSalvo.sortSelect;
        sortAscending = !!estadoSalvo.sortAscending;
        if (sortAscending) atualizarIconeOrdem();

        renderActiveFilters();
    }

    // Aplica os filtros já na carga para esconder os itens ocultos por padrão
    applyFilters();

    if (paginationRange || estadoSalvo?.sortAscending) {
        sortTable();
    }

    // applyPagination limita à última página existente
    if (estadoSalvo?.page > 1) {
        currentPage = estadoSalvo.page;
        applyPagination();
    }
}

// Inicializa o script garantindo que o DOM já foi completamente carregado
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", setupFilters);
} else {
    setupFilters();
}