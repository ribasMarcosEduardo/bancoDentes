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
}

document.addEventListener("DOMContentLoaded", setupFilaEtiquetas);
