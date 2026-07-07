function setupRequestRows() {
    const rows = document.querySelectorAll(".request-row");

    rows.forEach((row) => {
        const toggle = row.querySelector(".request-toggle");

        if (!toggle) return;

        toggle.addEventListener("click", () => {
            row.classList.toggle("is-open");
        });
    });
}

setupRequestRows();