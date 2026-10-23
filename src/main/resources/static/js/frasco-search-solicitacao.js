const DADOS = window.DADOS_ANALISE || { frascosDisponiveis: [], itensSalvos: [], codAnalise: null, codSolicitacao: null, totalSolicitado: null };

// Nomes de exibição dos enums do backend (getNome() de TipoDente, EstadoDente,
// Arcada e Denticao, em model/enumModels). DADOS_ANALISE vem serializado pelo
// Thymeleaf (Jackson), que manda o name() do enum ("PRE_MOLAR", "HIGIDO"...),
// não o nome por extenso.
const NOMES_ENUM = {
    MOLAR: "Molar",
    PRE_MOLAR: "Pré-Molar",
    CANINO: "Canino",
    INCISIVO: "Incisivo",
    ENDO: "Endo",
    SISO: "Siso",
    NAO_INFORMADA: "Não informada",
    CARIADO: "Cariado",
    HIGIDO: "Hígido",
    RESTAURADO: "Restaurado",
    MISTO: "Misto",
    INFERIOR: "Inferior",
    SUPERIOR: "Superior",
    DECIDUA: "Decídua",
    PERMANENTE: "Permanente"
};

function nomeEnum(valor) {
    if (!valor) return "---";
    if (typeof valor === "object") return valor.nome || "---";
    return NOMES_ENUM[valor] || valor;
}

// LocalDateTime chega como "2026-05-04T10:23:45.123" (ou [2026, 5, 4, ...],
// conforme a configuração do Jackson). Fica só a data, em dd/MM/yy: mesmo
// formato das listas e o que parseDataBr (ordenação por manutenção) espera.
function formatarData(valor) {
    if (!valor) return "---";

    let ano, mes, dia;

    if (Array.isArray(valor)) {
        [ano, mes, dia] = valor;
    } else {
        const partes = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!partes) return "---";
        [, ano, mes, dia] = partes.map(Number);
    }

    const doisDigitos = (n) => String(n).padStart(2, "0");
    return `${doisDigitos(dia)}/${doisDigitos(mes)}/${doisDigitos(ano % 100)}`;
}

const MOCK_FRASCOS = DADOS.frascosDisponiveis.map(f => ({
    id: f.identificacao || ('FR-' + f.codigo),
    codFrasco: f.codigo,
    grupo: nomeEnum(f.tipoDente),
    estado: nomeEnum(f.estado),
    arcada: nomeEnum(f.arcada),
    denticao: nomeEnum(f.denticao),
    disponivel: f.quantidade,
    dataCadastro: formatarData(f.datCad),
    dataManutencao: formatarData(f.datManutencao)
}));

const mapaCodigosItem = new Map();
DADOS.itensSalvos.forEach(item => {
    const idVisual = item.frasco.identificacao || ('FR-' + item.frasco.codigo);
    mapaCodigosItem.set(idVisual, item.codigo);
});

function parseDataBr(data) {
    if(!data || !data.includes("/")) return new Date();
    const [dia, mes, ano] = data.split("/").map(Number);
    return new Date(2000 + ano, mes - 1, dia);
}

function setupFrascoSearchModal() {
    const trigger = document.querySelector("#adicionarFrascoBtn");
    const overlay = document.querySelector("#modalBuscaFrasco");

    if (!trigger || !overlay) return;

    const modal = overlay.querySelector(".modal");
    const closeBtn = overlay.querySelector("#modalBuscaFrascoClose");
    const searchInput = overlay.querySelector("#modalBuscaFrascoInput");
    const searchWrapper = searchInput ? searchInput.closest(".search-wrapper") : null;
    const searchClearBtn = overlay.querySelector(".search-clear");
    const filtroGrupo = overlay.querySelector("#modalFiltroGrupo");
    const filtroEstado = overlay.querySelector("#modalFiltroEstado");
    const filtroStatus = overlay.querySelector("#modalFiltroStatus");
    const ordenarSelect = overlay.querySelector("#modalOrdenar");
    const resultsContainer = overlay.querySelector("#modalBuscaFrascoResults");
    const emptyState = overlay.querySelector("#modalBuscaFrascoEmpty");
    const countLabel = overlay.querySelector("#modalBuscaFrascoCount");
    const paginationRange = overlay.querySelector("#modalPaginationRange");
    const paginationPrev = overlay.querySelector("#modalPaginationPrev");
    const paginationNext = overlay.querySelector("#modalPaginationNext");

    if (!modal || !resultsContainer) return;

    const PAGE_SIZE = 4;
    let paginaAtual = 1;

    const selectedFlasksList = document.querySelector(".selected-flasks");
    const selectedFlasksHead = document.querySelector("#selectedFlasksHead");
    const selectedFlasksEmpty = document.querySelector("#selectedFlasksEmpty");
    const progressText = document.querySelector(".analysis-progress__text strong");
    const progressFill = document.querySelector(".analysis-progress__fill");
    const progressRemaining = document.querySelector(".analysis-progress__text span");

    const headerProgressCount = overlay.querySelector("#modalBuscaFrascoProgressCount");
    const headerProgressFill = overlay.querySelector("#modalBuscaFrascoProgressFill");

    const selecionados = new Map();
    let totalSolicitado = DADOS.totalSolicitado;

    DADOS.itensSalvos.forEach(item => {
        const idVisual = item.frasco.identificacao || ('FR-' + item.frasco.codigo);
        const frascoRef = MOCK_FRASCOS.find(f => f.id === idVisual);
        if (frascoRef) selecionados.set(idVisual, { frasco: frascoRef, quantidade: item.quantidade });
    });

    function maxPermitido(frasco) {
        if (totalSolicitado == null || totalSolicitado === 0) return frasco.disponivel;

        let atualSemEste = 0;
        selecionados.forEach(({ quantidade }, id) => {
            if (id !== frasco.id) atualSemEste += quantidade;
        });

        const restante = Math.max(totalSolicitado - atualSemEste, 0);
        return Math.min(frasco.disponivel, restante);
    }

    function open() {
        overlay.classList.add("is-open");
        document.body.classList.add("modal-open");
        paginaAtual = 1;
        renderResultados();
        searchInput?.focus();
    }

    function close() {
        overlay.classList.remove("is-open");
        document.body.classList.remove("modal-open");
    }

    function getFiltrados() {
        const termo = (searchInput?.value || "").trim().toLowerCase();
        const grupo = filtroGrupo?.value || "";
        const estado = filtroEstado?.value || "";
        const status = filtroStatus?.value || "todos";
        const ordenacao = ordenarSelect?.value || "";

        const filtrados = MOCK_FRASCOS.filter((frasco) => {
            const bateTermo = !termo || frasco.id.toLowerCase().includes(termo);
            const bateGrupo = !grupo || frasco.grupo === grupo;
            const bateEstado = !estado || frasco.estado === estado;
            const bateStatus = status === "todos" || selecionados.has(frasco.id);

            return bateTermo && bateGrupo && bateEstado && bateStatus;
        });

        if (ordenacao === "disponivel-asc") {
            filtrados.sort((a, b) => a.disponivel - b.disponivel);
        } else if (ordenacao === "disponivel-desc") {
            filtrados.sort((a, b) => b.disponivel - a.disponivel);
        } else if (ordenacao === "manutencao-asc") {
            filtrados.sort((a, b) => parseDataBr(a.dataManutencao) - parseDataBr(b.dataManutencao));
        } else if (ordenacao === "manutencao-desc") {
            filtrados.sort((a, b) => parseDataBr(b.dataManutencao) - parseDataBr(a.dataManutencao));
        }

        return filtrados;
    }

    function criarLinhaResultado(frasco) {
        const linha = document.createElement("article");
        linha.dataset.frascoId = frasco.id;

        const selecionado = selecionados.get(frasco.id);
        const quantidade = selecionado ? selecionado.quantidade : 0;
        const jaAdicionado = quantidade > 0;
        const limite = maxPermitido(frasco);

        linha.className = jaAdicionado ? "modal-result modal-result--added" : "modal-result";
        linha.dataset.added = jaAdicionado ? "true" : "false";

        // Só as características que o frasco tem (Endo não tem arcada nem
        // dentição - ficava "Misto · --- · ---")
        const caracteristicas = [frasco.estado, frasco.arcada, frasco.denticao]
            .filter((valor) => valor && valor !== "---")
            .join(" · ") || "---";

        linha.innerHTML = `
            <div class="modal-result__info">
                <span class="modal-result__code">${frasco.id}</span>

                <div class="modal-result__subinfo">
                    <span class="modal-result__meta">${caracteristicas}</span>
                    <span class="modal-result__dates">
                        <span class="modal-result__date">Cadastro ${frasco.dataCadastro}</span>
                        <span class="modal-result__dates-sep">·</span>
                        <span class="modal-result__date">Manutenção ${frasco.dataManutencao}</span>
                    </span>
                </div>
            </div>

            <div class="modal-result__actions">
                <button type="button" class="modal-result__reset result-list__action result-list__action--red${jaAdicionado ? "" : " modal-result__reset--invisible"}" data-tooltip="Remover" aria-label="Remover frasco">
                    <i class="icon" data-lucide="x"></i>
                </button>

                <div class="number-input number-input--fraction">
                    <input class="form-control number-input__field" type="number" min="0" max="${limite}" value="${quantidade}">
                    <span class="number-input__max">/${limite}</span>

                    <div class="number-input__actions">
                        <button type="button" class="number-input__btn" data-number-action="down">
                            <i class="icon" data-lucide="minus"></i>
                        </button>

                        <button type="button" class="number-input__btn" data-number-action="up">
                            <i class="icon" data-lucide="plus"></i>
                        </button>
                    </div>
                </div>

                <button type="button" class="btn btn-tonal modal-result__max" aria-label="Usar a quantidade máxima">Máx.</button>
            </div>
        `;

        atualizarBotaoMax(linha, limite);

        return linha;
    }

    // "Máx." preenche o maior valor permitido pra essa linha: o saldo do frasco
    // ou o que falta pra completar a solicitação, o que for menor
    // (maxPermitido). Apagado quando já está no máximo ou não cabe mais nada.
    function atualizarBotaoMax(linha, limite) {
        const botao = linha.querySelector(".modal-result__max");
        const quantidadeInput = linha.querySelector(".number-input__field");
        if (!botao || !quantidadeInput) return;

        botao.disabled = limite === 0 || Number(quantidadeInput.value) >= limite;
    }

    function renderResultados() {
        const filtrados = getFiltrados();
        const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
        paginaAtual = Math.min(Math.max(paginaAtual, 1), totalPaginas);

        const inicio = (paginaAtual - 1) * PAGE_SIZE;
        const pagina = filtrados.slice(inicio, inicio + PAGE_SIZE);

        resultsContainer.innerHTML = "";
        pagina.forEach((frasco) => resultsContainer.appendChild(criarLinhaResultado(frasco)));

        if (emptyState) {
            emptyState.hidden = filtrados.length > 0;
            emptyState.textContent = filtroStatus?.value === "adicionados"
                ? "Nenhum frasco adicionado ainda."
                : "Nenhum frasco encontrado com esses critérios.";
        }

        if (countLabel) {
            const plural = filtrados.length === 1 ? "" : "s";
            countLabel.textContent = `${filtrados.length} frasco${plural} encontrado${plural}`;
        }

        if (paginationRange) {
            paginationRange.textContent = filtrados.length === 0
                ? "0-0"
                : `${inicio + 1}-${Math.min(inicio + PAGE_SIZE, filtrados.length)}`;
        }

        if (paginationPrev) paginationPrev.disabled = paginaAtual <= 1;
        if (paginationNext) paginationNext.disabled = paginaAtual >= totalPaginas;

        if (window.lucide) {
            lucide.createIcons();
        }

        if (typeof setupNumberInputs === "function") {
            setupNumberInputs();
        }
    }

    function marcarLinhaComoAdicionada(linha, adicionado) {
        linha.dataset.added = adicionado ? "true" : "false";
        linha.classList.toggle("modal-result--added", adicionado);

        const resetBtn = linha.querySelector(".modal-result__reset");
        if (resetBtn) {
            resetBtn.classList.toggle("modal-result__reset--invisible", !adicionado);
        }
    }

    function atualizarLimitesLinhasVisiveis() {
        resultsContainer.querySelectorAll(".modal-result").forEach((linha) => {
            const frasco = MOCK_FRASCOS.find((item) => item.id === linha.dataset.frascoId);
            if (!frasco) return;

            const limite = maxPermitido(frasco);
            const quantidadeInput = linha.querySelector(".number-input__field");
            if (quantidadeInput) quantidadeInput.max = limite;

            const maxLabel = linha.querySelector(".number-input__max");
            if (maxLabel) maxLabel.textContent = `/${limite}`;

            atualizarBotaoMax(linha, limite);
        });
    }

    function atualizarProgresso() {
        if (totalSolicitado == null || !progressText) return;

        let atual = 0;
        selecionados.forEach(({ quantidade }) => {
            atual += quantidade;
        });
        atual = Math.min(atual, totalSolicitado);

        progressText.textContent = `${atual} / ${totalSolicitado} dentes selecionados`;

        if (progressFill) {
            progressFill.style.width = `${(atual / totalSolicitado) * 100}%`;
        }

        if (headerProgressCount) {
            headerProgressCount.textContent = `${atual}/${totalSolicitado}`;
            headerProgressCount.classList.toggle("modal-header-count--complete", atual >= totalSolicitado);
        }

        if (headerProgressFill) {
            headerProgressFill.style.setProperty("--progresso", atual / totalSolicitado);
        }

        if (progressRemaining) {
            const restante = totalSolicitado - atual;
            progressRemaining.textContent = restante > 0
                ? `Faltam ${restante} dentes para completar a solicitação.`
                : "Quantidade solicitada completa.";
        }
    }

    function criarLinhaSelecionada(id, entry) {
        const { frasco, quantidade } = entry;
        const qtdTotal = frasco.disponivel ?? 0;
        const qtdRestante = Math.max(qtdTotal - quantidade, 0);

        const row = document.createElement("article");
        row.className = "request-row";
        row.dataset.frascoId = id;

        row.innerHTML = `
            <div class="selected-flask">
                <span class="result-list__code">${id}</span>
                <span>${quantidade}</span>

                <div class="result-list__actions">
                    <button type="button" class="selected-flask__remove result-list__action result-list__action--red" data-tooltip="Remover" aria-label="Remover frasco">
                        <i class="icon" data-lucide="x"></i>
                    </button>

                    <button type="button" class="request-toggle request-toggle--plain" aria-label="Expandir frasco">
                        <i class="icon" data-lucide="chevron-down"></i>
                    </button>
                </div>
            </div>

            <div class="request-details">
                <div class="request-details__content">
                    <div class="request-details__grid">
                        <div class="request-detail">
                            <span class="request-details__label">Grupo dentário</span>
                            <span>${frasco.grupo ?? "---"}</span>
                        </div>

                        <div class="request-detail">
                            <span class="request-details__label">Estado</span>
                            <span>${frasco.estado ?? "---"}</span>
                        </div>

                        <div class="request-detail">
                            <span class="request-details__label">Arcada</span>
                            <span>${frasco.arcada ?? "---"}</span>
                        </div>

                        <div class="request-detail">
                            <span class="request-details__label">Dentição</span>
                            <span>${frasco.denticao ?? "---"}</span>
                        </div>

                        <div class="request-detail">
                            <span class="request-details__label">Qtd. total do frasco</span>
                            <span>${qtdTotal}</span>
                        </div>

                        <div class="request-detail">
                            <span class="request-details__label">Qtd. após a retirada</span>
                            <span>${qtdRestante}</span>
                        </div>

                        <div class="request-detail">
                            <span class="request-details__label">Data de cadastro</span>
                            <span>${frasco.dataCadastro ?? "---"}</span>
                        </div>

                        <div class="request-detail">
                            <span class="request-details__label">Próxima manutenção</span>
                            <span>${frasco.dataManutencao ?? "---"}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return row;
    }

    function renderSelecionados() {
        if (selectedFlasksList) {
            const abertos = new Set();
            selectedFlasksList.querySelectorAll(".request-row.is-open").forEach((row) => {
                if (row.dataset.frascoId) abertos.add(row.dataset.frascoId);
            });

            Array.from(selectedFlasksList.children).forEach((child) => {
                if (child !== selectedFlasksHead && child !== selectedFlasksEmpty) {
                    child.remove();
                }
            });

            selecionados.forEach((entry, id) => {
                const row = criarLinhaSelecionada(id, entry);
                if (abertos.has(id)) row.classList.add("is-open");
                selectedFlasksList.appendChild(row);
            });

            const vazio = selecionados.size === 0;
            if (selectedFlasksHead) selectedFlasksHead.hidden = vazio;
            if (selectedFlasksEmpty) selectedFlasksEmpty.hidden = !vazio;

            if (window.lucide) {
                lucide.createIcons();
            }
        }

        atualizarProgresso();
    }

    resultsContainer.addEventListener("click", (event) => {
        const resetBtn = event.target.closest(".modal-result__reset");
        if (!resetBtn) return;

        const linha = resetBtn.closest(".modal-result");
        const frasco = MOCK_FRASCOS.find((item) => item.id === linha.dataset.frascoId);
        if (!frasco) return;

        const codItemBD = mapaCodigosItem.get(frasco.id);
        if (codItemBD) {
            const formData = new URLSearchParams();
            formData.append("codSolicitacao", DADOS.codSolicitacao);
            fetch('/analiseSolicitacao/removerItem/' + codItemBD, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });
            mapaCodigosItem.delete(frasco.id);
        }

        selecionados.delete(frasco.id);

        const quantidadeInput = linha.querySelector(".number-input__field");
        if (quantidadeInput) quantidadeInput.value = 0;

        marcarLinhaComoAdicionada(linha, false);
        renderSelecionados();

        if (filtroStatus && filtroStatus.value !== "todos") {
            renderResultados();
        } else {
            atualizarLimitesLinhasVisiveis();
        }
    });

    // Mesmo caminho de digitar no campo: o "input" abaixo salva no servidor,
    // atualiza o progresso e os limites das outras linhas
    resultsContainer.addEventListener("click", (event) => {
        const maxBtn = event.target.closest(".modal-result__max");
        if (!maxBtn) return;

        const linha = maxBtn.closest(".modal-result");
        const frasco = MOCK_FRASCOS.find((item) => item.id === linha?.dataset.frascoId);
        const quantidadeInput = linha?.querySelector(".number-input__field");
        if (!frasco || !quantidadeInput) return;

        const limite = maxPermitido(frasco);
        if (Number(quantidadeInput.value) === limite) return;

        quantidadeInput.value = limite;
        quantidadeInput.dispatchEvent(new Event("input", { bubbles: true }));
    });

    resultsContainer.addEventListener("input", (event) => {
        const quantidadeInput = event.target.closest(".number-input__field");
        if (!quantidadeInput) return;

        const linha = quantidadeInput.closest(".modal-result");
        const frasco = MOCK_FRASCOS.find((item) => item.id === linha?.dataset.frascoId);
        if (!frasco) return;

        const limite = maxPermitido(frasco);
        let quantidade = Number(quantidadeInput.value || 0);
        quantidade = Math.min(Math.max(quantidade, 0), Math.max(limite, 0));

        quantidadeInput.value = quantidade;
        quantidadeInput.max = limite;

        const maxLabel = linha.querySelector(".number-input__max");
        if (maxLabel) maxLabel.textContent = `/${limite}`;

        const eraAdicionado = linha.dataset.added === "true";
        const agoraAdicionado = quantidade > 0;

        if (agoraAdicionado) {
            selecionados.set(frasco.id, { frasco, quantidade });

            const formData = new URLSearchParams();
            formData.append("analiseSolicitacao.codigo", DADOS.codAnalise);
            formData.append("frasco.codigo", frasco.codFrasco);
            formData.append("quantidade", quantidade);
            formData.append("codSolicitacao", DADOS.codSolicitacao);

            fetch('/analiseSolicitacao/selecionaFrasco', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            })
            .then(response => {
                const idCabecalho = response.headers.get("Codigo_Item_Analise");
                if (idCabecalho) {
                    mapaCodigosItem.set(frasco.id, Number(idCabecalho));
                }
                return response.text();
            })
            .catch(err => console.error("Erro ao salvar:", err));

        } else {
            const codItemBD = mapaCodigosItem.get(frasco.id);
            if (codItemBD) {
                const formData = new URLSearchParams();
                formData.append("codSolicitacao", DADOS.codSolicitacao);
                fetch('/analiseSolicitacao/removerItem/' + codItemBD, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData
                });
                mapaCodigosItem.delete(frasco.id);
            }
            selecionados.delete(frasco.id);
        }

        if (eraAdicionado !== agoraAdicionado) {
            marcarLinhaComoAdicionada(linha, agoraAdicionado);
        }

        renderSelecionados();

        if (eraAdicionado !== agoraAdicionado && filtroStatus && filtroStatus.value !== "todos") {
            renderResultados();
        } else {
            atualizarLimitesLinhasVisiveis();
        }
    });

    selectedFlasksList?.addEventListener("click", (event) => {
        const removeBtn = event.target.closest(".selected-flask__remove");

        if (removeBtn) {
            const row = removeBtn.closest(".request-row");
            const id = row?.dataset.frascoId;
            if (!id) return;

            const codItemBD = mapaCodigosItem.get(id);
            if (codItemBD) {
                const formData = new URLSearchParams();
                formData.append("codSolicitacao", DADOS.codSolicitacao);
                fetch('/analiseSolicitacao/removerItem/' + codItemBD, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData
                });
                mapaCodigosItem.delete(id);
            }

            selecionados.delete(id);
            renderSelecionados();
            renderResultados();
            return;
        }

        const row = event.target.closest(".request-row");
        if (!row) return;

        const isOpening = !row.classList.contains("is-open");
        row.classList.toggle("is-open");

        if (isOpening && typeof animateScrollToRow === "function") {
            animateScrollToRow(row, 500);
        }
    });

    trigger.addEventListener("click", open);
    closeBtn?.addEventListener("click", close);

    paginationPrev?.addEventListener("click", () => {
        paginaAtual -= 1;
        renderResultados();
    });

    paginationNext?.addEventListener("click", () => {
        paginaAtual += 1;
        renderResultados();
    });

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) close();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && overlay.classList.contains("is-open")) close();
    });

    searchInput?.addEventListener("input", () => {
        searchWrapper?.classList.toggle("has-value", searchInput.value.length > 0);
        paginaAtual = 1;
        renderResultados();
    });

    searchClearBtn?.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        searchWrapper?.classList.remove("has-value");
        paginaAtual = 1;
        renderResultados();
        searchInput?.focus();
    });

    [filtroGrupo, filtroEstado, filtroStatus, ordenarSelect].forEach((select) => {
        select?.addEventListener("change", () => {
            paginaAtual = 1;
            renderResultados();
        });
    });

    renderSelecionados();
    renderResultados();
}

document.addEventListener("DOMContentLoaded", setupFrascoSearchModal);