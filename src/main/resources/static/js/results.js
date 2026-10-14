function setupViewSwitch() {
    const resultsView = document.querySelector("#resultsView");
    const gridBtn = document.querySelector("[data-view='grid']");
    const listBtn = document.querySelector("[data-view='list']");

    if (!resultsView || !gridBtn || !listBtn) {
        return;
    }

    function setView(view) {
        const isGrid = view === "grid";

        resultsView.classList.toggle("results--grid", isGrid);
        resultsView.classList.toggle("results--list", !isGrid);

        gridBtn.classList.toggle("active", isGrid);
        listBtn.classList.toggle("active", !isGrid);

        localStorage.setItem("frascosViewMode", view);
    }

    const savedView = localStorage.getItem("frascosViewMode") || "grid";
    setView(savedView);

    gridBtn.addEventListener("click", () => setView("grid"));
    listBtn.addEventListener("click", () => setView("list"));
}

function setupSectorSwitch() {
    const switcher = document.querySelector("#sectorSwitch");
    const resultsView = document.querySelector("#resultsView");

    if (!switcher || !resultsView) {
        return;
    }

    const buttons = switcher.querySelectorAll(".sector-switch__btn");
    const items = resultsView.querySelectorAll("[data-setor]");
    const indicator = switcher.querySelector(".sector-switch__indicator");

    let activeButton = null;

    function replayEntranceAnimation() {
        resultsView.querySelectorAll(".results-grid, .result-table").forEach((el) => {
            el.style.animation = "none";
            void el.offsetWidth;
            el.style.animation = "";
        });
    }

    function moveIndicator(button) {
        if (!indicator || !button) return;

        indicator.style.width = `${button.offsetWidth}px`;
        indicator.style.transform = `translateX(${button.offsetLeft}px)`;
    }

    function setSector(setor) {
        activeButton = null;

        buttons.forEach((button) => {
            const isActive = button.dataset.setor === setor;
            button.classList.toggle("active", isActive);

            if (isActive) activeButton = button;
        });

        moveIndicator(activeButton);

        items.forEach((item) => {
            const matches = setor === "todos" || item.dataset.setor === setor;
            item.classList.toggle("is-hidden-by-sector", !matches);
        });

        localStorage.setItem("frascosSectorFilter", setor);

        // Só marca a classe acima — quem decide display/contagem/
        // paginação/estado vazio é sempre applyPagination (filters.js),
        // senão essas trocas de setor nunca refletiam ali (o "Nenhum
        // frasco encontrado" nunca aparecia mesmo com o setor zerando
        // tudo, e a contagem/paginação ficavam contando os itens
        // escondidos como se estivessem visíveis).
        if (typeof window.applyPagination === "function") {
            window.applyPagination();
        }
    }


    const savedSector = localStorage.getItem("frascosSectorFilter") || "todos";
    setSector(savedSector);

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            setSector(button.dataset.setor);
            replayEntranceAnimation();
        });
    });

    // O "Limpar filtros" do estado vazio (partials/empty_state.html)
    // também volta o setor pra "Todos" — o setor sozinho pode ser o
    // motivo de não ter resultado. Os checkboxes ele já limpa pelo
    // .filters-clear (filters.js); o da barra de filtros ativos não
    // mexe no setor.
    resultsView.querySelectorAll(".empty-state__action").forEach((button) => {
        button.addEventListener("click", () => {
            if (activeButton && activeButton.dataset.setor === "todos") return;
            setSector("todos");
            replayEntranceAnimation();
        });
    });

    new ResizeObserver(() => moveIndicator(activeButton)).observe(switcher);
}

setupViewSwitch();
setupSectorSwitch();