// Tela 2 do fluxo de impressão de etiquetas: escolha do modelo de folha
// e da célula inicial. Os frascos e o catálogo de modelos vêm do servidor
// (inputs hidden e data-* de cada <option>); aqui só se desenha a grade
// clicável e a prévia. A distribuição real dos frascos nas células é
// feita no servidor ao gerar a folha; a prévia só conta quantas
// etiquetas caem em cada folha, com a mesma regra: a 1ª folha começa na
// célula escolhida, as demais sempre na célula 1.
function setupConfigurarEtiquetas() {
    const form = document.querySelector("#formConfigEtiquetas");
    if (!form) return;

    const modeloSelect = document.querySelector("#modeloFolhaSelect");
    const modeloDescricao = document.querySelector("#modeloFolhaDescricao");
    const posicaoInput = document.querySelector("#posicaoInicialInput");
    const gridEl = document.querySelector("#etiquetaGridPosicao");
    const resumoTexto = document.querySelector("#etiquetaResumoTexto");
    const previewEl = document.querySelector("#etiquetaPreview");
    const barCount = document.querySelector("#etiquetaConfigCount");

    const totalFrascos = parseInt(form.dataset.totalFrascos, 10) || 0;
    let posicaoInicial = 0;

    function modeloAtual() {
        const option = modeloSelect.selectedOptions[0];
        const colunas = parseInt(option.dataset.colunas, 10);
        const linhas = parseInt(option.dataset.linhas, 10);

        return {
            colunas,
            capacidade: colunas * linhas,
            aspecto: `${option.dataset.celLargura} / ${option.dataset.celAltura}`,
            descricao: option.dataset.descricao,
        };
    }

    // Quantas etiquetas preenchidas cada folha recebe.
    function etiquetasPorFolha(modelo) {
        const folhas = [Math.min(totalFrascos, modelo.capacidade - posicaoInicial)];
        let restante = totalFrascos - folhas[0];

        while (restante > 0) {
            folhas.push(Math.min(restante, modelo.capacidade));
            restante -= modelo.capacidade;
        }

        return folhas;
    }

    function atualizarDescricaoModelo(modelo) {
        if (modeloDescricao) modeloDescricao.textContent = modelo.descricao;
    }

    function prepararGrade(el, modelo) {
        el.innerHTML = "";
        el.style.gridTemplateColumns = `repeat(${modelo.colunas}, 1fr)`;
        el.style.setProperty("--cel-aspect", modelo.aspecto);
    }

    // Grade clicável: representa só o estado físico da folha em branco,
    // não sabe nada sobre frascos. Ver css/components/etiqueta-grid.css.
    function renderGridPosicao(modelo) {
        if (!gridEl) return;

        prepararGrade(gridEl, modelo);

        for (let indice = 0; indice < modelo.capacidade; indice++) {
            const cel = document.createElement("button");
            cel.type = "button";
            cel.className = "etiqueta-grid__cel";
            cel.classList.toggle("etiqueta-grid__cel--pulada", indice < posicaoInicial);
            cel.classList.toggle("etiqueta-grid__cel--disponivel", indice >= posicaoInicial);
            cel.setAttribute("aria-label", `Começar na célula ${indice + 1}`);
            cel.setAttribute("aria-pressed", String(indice === posicaoInicial));
            cel.addEventListener("click", () => {
                posicaoInicial = indice;
                renderTudo({ focarCelula: indice });
            });
            gridEl.appendChild(cel);
        }
    }

    // Prévia somente leitura: mesma classe visual da grade clicável, uma
    // mini-grade por folha, com as células preenchidas destacadas.
    function renderMiniFolha(modelo, offset, preenchidas) {
        const mini = document.createElement("div");
        mini.className = "etiqueta-grid etiqueta-grid--mini";
        prepararGrade(mini, modelo);

        for (let indice = 0; indice < modelo.capacidade; indice++) {
            const ocupada = indice >= offset && indice < offset + preenchidas;
            const cel = document.createElement("span");
            cel.className = "etiqueta-grid__cel";
            cel.classList.toggle("etiqueta-grid__cel--pulada", !ocupada);
            cel.classList.toggle("etiqueta-grid__cel--disponivel", ocupada);
            mini.appendChild(cel);
        }

        return mini;
    }

    function renderPreview(modelo) {
        const folhas = etiquetasPorFolha(modelo);
        const totalFolhas = folhas.length;

        const frascosTexto = `${totalFrascos} frasco${totalFrascos === 1 ? "" : "s"} selecionado${totalFrascos === 1 ? "" : "s"}`;
        const folhasTexto = `${totalFolhas} folha${totalFolhas === 1 ? "" : "s"}`;

        if (resumoTexto) {
            resumoTexto.textContent =
                `${frascosTexto}, ${folhasTexto} necessária${totalFolhas === 1 ? "" : "s"}, ` +
                `começando na célula ${posicaoInicial + 1} da 1ª folha.`;
        }

        if (barCount) barCount.textContent = `${frascosTexto} em ${folhasTexto}`;

        if (!previewEl) return;

        previewEl.innerHTML = "";
        folhas.forEach((preenchidas, indice) => {
            const wrapper = document.createElement("div");
            wrapper.className = "etiqueta-preview__folha";

            const legenda = document.createElement("span");
            legenda.className = "etiqueta-preview__legenda";
            legenda.textContent = `Folha ${indice + 1}: ${preenchidas} etiqueta${preenchidas === 1 ? "" : "s"}`;

            wrapper.appendChild(renderMiniFolha(modelo, indice === 0 ? posicaoInicial : 0, preenchidas));
            wrapper.appendChild(legenda);
            previewEl.appendChild(wrapper);
        });
    }

    function renderTudo({ focarCelula } = {}) {
        const modelo = modeloAtual();
        if (posicaoInput) posicaoInput.value = String(posicaoInicial);

        atualizarDescricaoModelo(modelo);
        renderGridPosicao(modelo);
        renderPreview(modelo);

        // A grade é recriada a cada clique, então devolve o foco pra célula
        // clicada, senão quem navega por teclado volta pro início da página.
        if (focarCelula !== undefined) {
            gridEl?.children[focarCelula]?.focus();
        }
    }

    modeloSelect?.addEventListener("change", () => {
        // O novo modelo pode ter menos células, então é mais seguro reiniciar do
        // que tentar preservar a posição escolhida.
        posicaoInicial = 0;
        renderTudo();
    });

    renderTudo();
}

document.addEventListener("DOMContentLoaded", setupConfigurarEtiquetas);
