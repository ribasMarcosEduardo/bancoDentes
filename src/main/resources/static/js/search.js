function setupSearchClear() {
    const wrappers = document.querySelectorAll(".search-wrapper");

    wrappers.forEach((wrapper) => {
        const input = wrapper.querySelector("input[type='search']");
        const clearBtn = wrapper.querySelector(".search-clear");

        if (!input || !clearBtn) return;

        function sync() {
            wrapper.classList.toggle("has-value", input.value.length > 0);
        }

        input.addEventListener("input", sync);
        input.addEventListener("search", sync);

        clearBtn.addEventListener("click", () => {
            input.value = "";
            sync();
            input.focus();
            input.dispatchEvent(new Event("input", { bubbles: true }));
        });

        sync();
    });
}

setupSearchClear();
