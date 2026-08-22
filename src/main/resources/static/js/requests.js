function animateScrollToRow(row, duration) {
    const navbar = document.querySelector(".navbar");
    const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
    const margin = 16;
    const topLimit = navbarHeight + margin;

    const startTime = performance.now();

    // A área expandida ainda está crescendo (CSS grid-template-rows/padding
    // animando) enquanto isso roda, então em vez de calcular um alvo fixo,
    // cada frame remede a posição atual da linha e persegue esse alvo em
    // movimento com um easing (lerp) — resultado: começa a rolar no mesmo
    // instante do clique e acompanha a expansão em vez de esperar ela acabar.
    function step(now) {
        if (!row.classList.contains("is-open")) return;

        const rect = row.getBoundingClientRect();
        const bottomLimit = window.innerHeight - margin;

        let delta = 0;

        if (rect.bottom > bottomLimit) {
            delta = rect.bottom - bottomLimit;

            if (rect.top - delta < topLimit) {
                delta = rect.top - topLimit;
            }
        } else if (rect.top < topLimit) {
            delta = rect.top - topLimit;
        }

        if (Math.abs(delta) > 0.5) {
            window.scrollBy(0, delta * 0.22);
        }

        if (now - startTime < duration) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

function setupRequestRows() {
    const rows = document.querySelectorAll(".request-row");

    rows.forEach((row) => {
        const bar = row.querySelector(".result-list");
        const details = row.querySelector(".request-details");

        if (!bar) return;

        bar.addEventListener("click", (event) => {
            if (event.target.closest(".result-list__action")) return;

            const isOpening = !row.classList.contains("is-open");
            row.classList.toggle("is-open");

            if (isOpening && details) {
                animateScrollToRow(row, 500);
            }
        });
    });
}

setupRequestRows();