function setupManutencaoConcluirModal() {
    const overlay = document.querySelector("#modalConcluirManutencao");
    const resultsView = document.querySelector("#resultsView");

    if (!overlay || !resultsView) return;

    const closeBtn = document.querySelector("#modalConcluirManutencaoClose");
    const cancelBtn = document.querySelector("#modalConcluirManutencaoCancelar");
    const confirmBtn = document.querySelector("#modalConcluirManutencaoConfirmar");

    const codigoEl = document.querySelector("#modalConcluirManutencaoCodigo");
    const grupoEl = document.querySelector("#modalConcluirManutencaoGrupo");
    const estadoEl = document.querySelector("#modalConcluirManutencaoEstado");
    const localEl = document.querySelector("#modalConcluirManutencaoLocal");
    const qtdAtualEl = document.querySelector("#modalConcluirManutencaoQtdAtual");

    const qtdInput = document.querySelector("#modalConcluirManutencaoQtdNova");
    const qtdDownBtn = overlay.querySelector("[data-number-action='down']");
    const qtdUpBtn = overlay.querySelector("[data-number-action='up']");

    if (!qtdInput) return;

    let linhaAtual = null;

    function open(row) {
        linhaAtual = row;

        const { codigo = "---", grupo = "---", estado = "---", local = "---", qtd = "0" } = row.dataset;
        const qtdAtual = Number(qtd) || 0;

        if (codigoEl) codigoEl.textContent = codigo;
        if (grupoEl) grupoEl.textContent = grupo;
        if (estadoEl) estadoEl.textContent = estado;
        if (localEl) localEl.textContent = local;
        if (qtdAtualEl) qtdAtualEl.textContent = String(qtdAtual);

        qtdInput.max = String(qtdAtual);
        qtdInput.min = "0";
        qtdInput.value = String(qtdAtual);

        overlay.classList.add("is-open");
        document.body.classList.add("modal-open");
    }

    function close() {
        overlay.classList.remove("is-open");
        document.body.classList.remove("modal-open");
        linhaAtual = null;
        stopRepeat();
    }

    function clampQtdInput() {
        const max = Number(qtdInput.max || 0);
        const min = Number(qtdInput.min || 0);
        let valor = Number(qtdInput.value);

        if (Number.isNaN(valor)) valor = min;

        valor = Math.min(Math.max(valor, min), max);
        qtdInput.value = String(valor);
    }

    resultsView.addEventListener("click", (event) => {
        const trigger = event.target.closest(".js-concluir-manutencao");
        if (!trigger) return;

        const row = trigger.closest(".request-row");
        if (!row) return;

        open(row);
    });

    closeBtn?.addEventListener("click", close);
    cancelBtn?.addEventListener("click", close);

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) close();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && overlay.classList.contains("is-open")) close();
    });

    let repeatTimeout;
    let repeatInterval;

    function stopRepeat() {
        clearTimeout(repeatTimeout);
        clearInterval(repeatInterval);
    }

    function changeQtd(direction) {
        if (direction === "up") qtdInput.stepUp();
        if (direction === "down") qtdInput.stepDown();

        clampQtdInput();
    }

    function startRepeat(direction) {
        changeQtd(direction);

        repeatTimeout = setTimeout(() => {
            repeatInterval = setInterval(() => changeQtd(direction), 80);
        }, 350);
    }

    qtdUpBtn?.addEventListener("pointerdown", () => startRepeat("up"));
    qtdDownBtn?.addEventListener("pointerdown", () => startRepeat("down"));

    ["pointerup", "pointerleave", "pointercancel"].forEach((eventName) => {
        qtdUpBtn?.addEventListener(eventName, stopRepeat);
        qtdDownBtn?.addEventListener(eventName, stopRepeat);
    });

    qtdInput.addEventListener("input", clampQtdInput);
    qtdInput.addEventListener("blur", clampQtdInput);

    confirmBtn?.addEventListener("click", async () => {
        if (!linhaAtual) return;

        clampQtdInput();

        const actionBtn = linhaAtual.querySelector(".js-concluir-manutencao");
        const codManutencao = actionBtn ? actionBtn.dataset.id : null;

        const codigo = linhaAtual.dataset.codigo || "---";
        const novaQuantidade = Number(qtdInput.value);

        if (!codManutencao) {
            if (window.Swal) Swal.fire('Erro', 'Código da manutenção não identificado.', 'error');
            return;
        }

        try {
            const response = await fetch(`/manutencao/concluir/${codManutencao}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantidadeCalculada: novaQuantidade })
            });

            if (!response.ok) throw new Error("Erro ao concluir manutenção no servidor.");

            close();

            if (window.Swal) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Manutenção Concluída!',
                    html: `Frasco <strong>${codigo}</strong> atualizado com sucesso para <strong>${novaQuantidade}</strong> dentes.`,
                    timer: 1500,
                    showConfirmButton: false
                });
            } else if (typeof showToast === "function") {
                showToast(`Manutenção do frasco <strong>${codigo}</strong> concluída — quantidade atualizada para <strong>${novaQuantidade}</strong>.`);
            }

            location.reload();

        } catch (error) {
            console.error(error);
            if (window.Swal) Swal.fire('Erro', 'Não foi possível concluir a manutenção no servidor.', 'error');
        }
    });
}

document.addEventListener("DOMContentLoaded", setupManutencaoConcluirModal);