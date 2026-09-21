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
            item.style.display = matches ? "" : "none";
        });

        localStorage.setItem("frascosSectorFilter", setor);
    }

    const savedSector = localStorage.getItem("frascosSectorFilter") || "todos";
    setSector(savedSector);

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            setSector(button.dataset.setor);
            replayEntranceAnimation();
        });
    });

    new ResizeObserver(() => moveIndicator(activeButton)).observe(switcher);
}

setupViewSwitch();
setupSectorSwitch();