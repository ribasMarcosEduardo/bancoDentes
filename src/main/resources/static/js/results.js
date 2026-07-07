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

    gridBtn.addEventListener("click", () => {
        setView("grid");
    });

    listBtn.addEventListener("click", () => {
        setView("list");
    });
}

setupViewSwitch();