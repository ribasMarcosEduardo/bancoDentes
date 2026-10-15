// Tela 3 do fluxo de impressão de etiquetas. A folha já vem montada do
// servidor; aqui só fica o botão que abre o diálogo de impressão e, quando
// ele fecha, o foco vai para "Confirmar impressão" (próximo passo do fluxo).
document.addEventListener("DOMContentLoaded", () => {
    const btnImprimir = document.querySelector("#btnImprimir");
    const btnConfirmar = document.querySelector("#btnConfirmarImpressao");

    btnImprimir?.addEventListener("click", () => window.print());

    window.addEventListener("afterprint", () => {
        btnConfirmar?.focus();
    });
});
