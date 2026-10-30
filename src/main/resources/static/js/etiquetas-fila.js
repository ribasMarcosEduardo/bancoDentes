// Tela 1 do fluxo de impressão de etiquetas: a fila em si vem do
// servidor (frascos com status Disponível para impressão, todos já
// marcados); aqui só fica o "selecionar todos", o contador da barra
// fixa, o bloqueio dos botões sem nenhum frasco marcado e as
// confirmações de remover da fila / confirmar impressão.
function setupFilaEtiquetas() {
    const form = document.querySelector("#formFilaEtiquetas");
    if (!form) return;

    const selecionarTodos = document.querySelector("#selecionarTodosEtiqueta");
    const checkboxes = Array.from(form.querySelectorAll("input[name='frascos']"));
    const barCount = document.querySelector("#etiquetaSelecaoCount");
    const btnContinuar = document.querySelector("#btnContinuarEtiqueta");
    const btnConfirmar = document.querySelector("#btnConfirmarImpressaoFila");

    function atualizar() {
        const total = checkboxes.length;
        const marcados = checkboxes.filter((c) => c.checked).length;

        if (barCount) {
            barCount.textContent = marcados === 0
                ? "Nenhum frasco selecionado"
                : `${marcados} de ${total} frasco${total === 1 ? "" : "s"} selecionado${marcados === 1 ? "" : "s"}`;
        }

        if (btnContinuar) btnContinuar.disabled = marcados === 0;
        if (btnConfirmar) btnConfirmar.disabled = marcados === 0;

        if (selecionarTodos) {
            selecionarTodos.checked = marcados === total;
            selecionarTodos.indeterminate = marcados > 0 && marcados < total;
        }
    }

    form.addEventListener("change", (event) => {
        if (event.target.name === "frascos") atualizar();
    });

    // Fica no cabeçalho, fora do grupo name="frascos", então não vai no POST.
    selecionarTodos?.addEventListener("change", () => {
        checkboxes.forEach((c) => { c.checked = selecionarTodos.checked; });
        atualizar();
    });

    // Submete com o próprio botão como submitter, pra valer o formaction dele.
    function confirmarESubmeter(botao, opcoes) {
        Swal.fire({
            showCancelButton: true,
            reverseButtons: true,
            focusCancel: true,
            cancelButtonText: "Cancelar",
            buttonsStyling: false,
            ...opcoes,
        }).then((result) => {
            if (result.isConfirmed) form.requestSubmit(botao);
        });
    }

    form.addEventListener("click", (event) => {
        const botao = event.target.closest(".js-remover-fila");
        if (!botao) return;

        event.preventDefault();
        confirmarESubmeter(botao, {
            icon: "warning",
            title: "Remover da fila de impressão?",
            text: `O frasco ${botao.dataset.identificacao || ""} volta para Disponível sem imprimir a etiqueta.`,
            confirmButtonText: "Sim, remover",
            customClass: {
                confirmButton: "btn btn-outline btn-outline-danger",
                cancelButton: "btn btn-secondary",
            },
        });
    });

    btnConfirmar?.addEventListener("click", (event) => {
        event.preventDefault();

        const marcados = checkboxes.filter((c) => c.checked).length;
        confirmarESubmeter(btnConfirmar, {
            icon: "question",
            title: "Confirmar impressão?",
            text: `${marcados} frasco${marcados === 1 ? "" : "s"} marcado${marcados === 1 ? " vai" : "s vão"} sair da fila como impresso${marcados === 1 ? "" : "s"}.`,
            confirmButtonText: "Sim, confirmar",
            customClass: {
                confirmButton: "btn btn-primary",
                cancelButton: "btn btn-secondary",
            },
        });
    });

    atualizar();
    setupPaginacaoFila(form);
}

// Paginação só visual (20 por página): as linhas das outras páginas ficam
// escondidas mas continuam no form, então seleção e POST valem pra fila toda.
function setupPaginacaoFila(form) {
    const POR_PAGINA = 20;
    const lista = document.querySelector("#listaFrascosEtiqueta");
    const linhas = Array.from(form.querySelectorAll(".etiqueta-fila-row"));
    const nav = document.querySelector("#filaPaginacao");
    const range = document.querySelector("#filaPaginacaoRange");
    const btnAnterior = document.querySelector("#filaPaginaAnterior");
    const btnProxima = document.querySelector("#filaPaginaProxima");

    const totalPaginas = Math.ceil(linhas.length / POR_PAGINA);
    if (!nav || totalPaginas <= 1) return;

    let pagina = 0;
    nav.hidden = false;

    function mostrar(animar) {
        const inicio = pagina * POR_PAGINA;
        const fim = Math.min(inicio + POR_PAGINA, linhas.length);

        // style.display (não [hidden]): .result-list tem display:grid, que venceria o [hidden]
        linhas.forEach((linha, i) => {
            linha.style.display = i >= inicio && i < fim ? "" : "none";
        });

        range.textContent = `${inicio + 1}-${fim} de ${linhas.length}`;
        btnAnterior.disabled = pagina === 0;
        btnProxima.disabled = pagina === totalPaginas - 1;

        if (!animar || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        // A entrada da carga (fila_etiquetas.css) repetiria com atraso; no lugar, cascata curta
        lista?.classList.add("sem-entrada");
        linhas.slice(inicio, fim).forEach((linha, i) => {
            linha.animate(
                [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
                { duration: 320, delay: Math.min(i, 8) * 30, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
            );
        });
    }

    btnAnterior.addEventListener("click", () => { pagina--; mostrar(true); });
    btnProxima.addEventListener("click", () => { pagina++; mostrar(true); });

    mostrar(false);
}

document.addEventListener("DOMContentLoaded", setupFilaEtiquetas);
