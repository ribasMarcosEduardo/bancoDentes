// Mock temporário: no projeto completo esses frascos vêm de uma consulta
// ao backend já filtrada pelas regras da solicitação (grupo/estado/
// arcada/dentição exigidos, saldo disponível etc.) — por isso os 6 aqui
// têm todos o mesmo grupo/estado/arcada/dentição do card "Detalhes da
// Solicitação" (Pré-Molar · Hígido · Inferior · Permanente, ver
// analise_solicitacao.html): simula esse filtro do backend já aplicado,
// só varia o que realmente distinguiria frascos compatíveis de verdade
// (identificador, saldo, datas). Identificadores no mesmo modelo usado
// em frascos.html (result-list__code): {grupo}bd-a{seq}.
const MOCK_FRASCOS = [
    { id: "PMbd-a0006", grupo: "Pré-Molar", estado: "Hígido", arcada: "Inferior", denticao: "Permanente", disponivel: 14, dataCadastro: "12/03/25", dataManutencao: "12/03/26" },
    { id: "PMbd-a0007", grupo: "Pré-Molar", estado: "Hígido", arcada: "Inferior", denticao: "Permanente", disponivel: 9, dataCadastro: "04/05/25", dataManutencao: "04/05/26" },
    { id: "PMbd-a0008", grupo: "Pré-Molar", estado: "Hígido", arcada: "Inferior", denticao: "Permanente", disponivel: 20, dataCadastro: "30/01/25", dataManutencao: "30/01/26" },
    { id: "PMbd-a0009", grupo: "Pré-Molar", estado: "Hígido", arcada: "Inferior", denticao: "Permanente", disponivel: 6, dataCadastro: "18/07/25", dataManutencao: "18/07/26" },
    { id: "PMbd-a0010", grupo: "Pré-Molar", estado: "Hígido", arcada: "Inferior", denticao: "Permanente", disponivel: 11, dataCadastro: "09/02/25", dataManutencao: "09/02/26" },
    { id: "PMbd-a0011", grupo: "Pré-Molar", estado: "Hígido", arcada: "Inferior", denticao: "Permanente", disponivel: 3, dataCadastro: "25/06/25", dataManutencao: "25/06/26" },
];

// "21/06/25" -> Date — formato usado em todo o protótipo (dd/mm/aa).
function parseDataBr(data) {
    const [dia, mes, ano] = data.split("/").map(Number);
    return new Date(2000 + ano, mes - 1, dia);
}

function setupFrascoSearchModal() {
    const trigger = document.querySelector("#adicionarFrascoBtn");
    const overlay = document.querySelector("#modalBuscaFrasco");

    // Página sem o botão de gatilho ou sem o modal incluído (data-include
    // ainda não carregou, ou a tela nem usa esse recurso) — não faz nada.
    if (!trigger || !overlay) return;

    const modal = overlay.querySelector(".modal");
    const closeBtn = overlay.querySelector("#modalBuscaFrascoClose");
    const searchInput = overlay.querySelector("#modalBuscaFrascoInput");
    const searchWrapper = searchInput ? searchInput.closest(".search-wrapper") : null;
    const searchClearBtn = overlay.querySelector(".search-clear");
    // Grupo dentário/Estado do dente: não existem no HTML deste modal
    // (este aqui só precisa de Status + Ordenação) — quem usa esses
    // filtros de verdade é modal_busca_frasco_movimentacao.html/
    // frasco-search-movimentacao.js. Os querySelector abaixo continuam
    // aqui só resultando em null, desativados pelos "?." de
    // getFiltrados/dos listeners de "change".
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

    // Mock também pagina (mesmo com só 6 frascos) pra exercitar os
    // botões/texto de verdade — no projeto completo o tamanho de página
    // provavelmente viria de um controle "Exibir" como o de frascos.html,
    // aqui é só um valor fixo.
    const PAGE_SIZE = 4;
    let paginaAtual = 1;

    // Elementos da tela de análise que a seleção de frascos atualiza —
    // ficam fora do modal em si, por isso a busca é feita à parte e tudo
    // aqui é defensivo (?.) caso a página não os tenha.
    const selectedFlasksList = document.querySelector(".selected-flasks");
    const selectedFlasksHead = document.querySelector("#selectedFlasksHead");
    const selectedFlasksEmpty = document.querySelector("#selectedFlasksEmpty");
    const progressText = document.querySelector(".analysis-progress__text strong");
    const progressFill = document.querySelector(".analysis-progress__fill");
    const progressRemaining = document.querySelector(".analysis-progress__text span");

    // Header do próprio modal (ver modal_busca_frasco_solicitacao.html) —
    // mesmo progresso de cima, só que ali dentro (contador "0/34" baixinho
    // + a barra que substitui a borda do header).
    const headerProgressCount = overlay.querySelector("#modalBuscaFrascoProgressCount");
    const headerProgressFill = overlay.querySelector("#modalBuscaFrascoProgressFill");

    // Estado compartilhado entre o modal e a lista "Frascos selecionados"
    // da página — Map em vez de ler/escrever o DOM toda hora, pra manter
    // uma única fonte de verdade enquanto o usuário ajusta quantidades,
    // adiciona e remove. id do frasco -> { frasco, quantidade }.
    const selecionados = new Map();

    // Total de dentes da solicitação, lido uma vez do texto estático
    // ("12 / 34 dentes selecionados") — no projeto completo isso viria
    // pronto do backend, sem precisar fazer parse de texto.
    let totalSolicitado = null;

    if (progressText) {
        const match = progressText.textContent.match(/\d+\s*\/\s*(\d+)/);
        if (match) totalSolicitado = Number(match[1]);
    }

    // Quanto ainda cabe nesse frasco: o menor entre o saldo dele e o que
    // falta pra completar a solicitação — sem contar a própria
    // quantidade que ele já tem reservada (senão a margem ficaria curta
    // demais assim que ele mesmo entrasse na soma). Evita adicionar mais
    // frasco/dente do que a solicitação pede.
    function maxPermitido(frasco) {
        if (totalSolicitado == null) return frasco.disponivel;

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

        // Sempre reabre na primeira página — mais previsível do que
        // lembrar onde o usuário tinha parado da última vez.
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

            // Só "Todos"/"Já Adicionados" (ver modal_busca_frasco_solicitacao.html)
            // — sem opção pro inverso, então basta checar o caso positivo.
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

        // Distinção visual leve (borda verde) pro que já está selecionado.
        linha.className = jaAdicionado ? "modal-result modal-result--added" : "modal-result";
        linha.dataset.added = jaAdicionado ? "true" : "false";

        // Sem botão "Adicionar" — a própria rolagem de quantidade (min=0)
        // é quem adiciona: sair de 0 já conta como selecionado. O X
        // vermelho é só um atalho pra zerar direto, sem precisar segurar
        // o "-" ou apagar o campo manualmente — reserva o espaço mesmo
        // escondido (visibility, não display/hidden) pra não empurrar a
        // rolagem de lugar quando aparece/some.
        linha.innerHTML = `
            <div class="modal-result__info">
                <span class="modal-result__code">${frasco.id}</span>

                <div class="modal-result__subinfo">
                    <span class="modal-result__meta">${frasco.estado} · ${frasco.arcada} · ${frasco.denticao}</span>
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
            </div>
        `;

        return linha;
    }

    function renderResultados() {
        const filtrados = getFiltrados();

        // Clampa em vez de forçar a página 1 sempre que algo muda — se a
        // página atual ainda existe pro resultado novo (ex.: só ajustou
        // a quantidade de um frasco já adicionado), o usuário continua
        // exatamente onde estava.
        const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
        paginaAtual = Math.min(Math.max(paginaAtual, 1), totalPaginas);

        const inicio = (paginaAtual - 1) * PAGE_SIZE;
        const pagina = filtrados.slice(inicio, inicio + PAGE_SIZE);

        resultsContainer.innerHTML = "";
        pagina.forEach((frasco) => resultsContainer.appendChild(criarLinhaResultado(frasco)));

        if (emptyState) {
            emptyState.hidden = filtrados.length > 0;

            // Mesma mensagem usada na lista "Frascos selecionados" da
            // página quando o filtro "Adicionados" não tem nada — mais
            // específica que o "nenhum resultado" genérico dos outros
            // filtros/busca.
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

        // Linhas novas trazem seus próprios botões +/- de quantidade —
        // setupNumberInputs (forms.js) varre TODOS os .number-input da
        // página de novo, então religa tanto os antigos quanto os recém
        // criados sem duplicar listener (cada chamada busca os elementos
        // atuais no DOM, não guarda referência de chamadas anteriores).
        if (typeof setupNumberInputs === "function") {
            setupNumberInputs();
        }
    }

    // Troca só o visual de uma linha entre "adicionado"/"não adicionado"
    // (borda verde + visibilidade do X vermelho), sem precisar
    // re-renderizar o modal inteiro — evita perder o foco/scroll
    // enquanto o usuário está mexendo em outras linhas.
    function marcarLinhaComoAdicionada(linha, adicionado) {
        linha.dataset.added = adicionado ? "true" : "false";
        linha.classList.toggle("modal-result--added", adicionado);

        const resetBtn = linha.querySelector(".modal-result__reset");
        if (resetBtn) {
            resetBtn.classList.toggle("modal-result__reset--invisible", !adicionado);
        }
    }

    // Depois de adicionar/remover/ajustar um frasco, o "espaço restante"
    // muda pra TODOS os outros — atualiza o max de cada rolagem visível
    // sem recriar nada (preserva o que o usuário estiver digitando em
    // qualquer outra linha).
    function atualizarLimitesLinhasVisiveis() {
        resultsContainer.querySelectorAll(".modal-result").forEach((linha) => {
            const frasco = MOCK_FRASCOS.find((item) => item.id === linha.dataset.frascoId);
            if (!frasco) return;

            const limite = maxPermitido(frasco);

            const quantidadeInput = linha.querySelector(".number-input__field");
            if (quantidadeInput) {
                quantidadeInput.max = limite;
            }

            const maxLabel = linha.querySelector(".number-input__max");
            if (maxLabel) {
                maxLabel.textContent = `/${limite}`;
            }
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
            headerProgressFill.style.width = `${(atual / totalSolicitado) * 100}%`;
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
                            <span>${frasco.grupo ?? "—"}</span>
                        </div>

                        <div class="request-detail">
                            <span class="request-details__label">Estado</span>
                            <span>${frasco.estado ?? "—"}</span>
                        </div>

                        <div class="request-detail">
                            <span class="request-details__label">Arcada</span>
                            <span>${frasco.arcada ?? "—"}</span>
                        </div>

                        <div class="request-detail">
                            <span class="request-details__label">Dentição</span>
                            <span>${frasco.denticao ?? "—"}</span>
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
                            <span>${frasco.dataCadastro ?? "—"}</span>
                        </div>

                        <div class="request-detail">
                            <span class="request-details__label">Próxima manutenção</span>
                            <span>${frasco.dataManutencao ?? "—"}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return row;
    }

    // Reflete o Map inteiro na lista "Frascos selecionados" da tela de
    // análise. No projeto completo isso vira uma chamada ao backend
    // (persistindo a separação); aqui só atualiza a UI.
    function renderSelecionados() {
        if (selectedFlasksList) {
            const abertos = new Set();
            selectedFlasksList.querySelectorAll(".request-row.is-open").forEach((row) => {
                if (row.dataset.frascoId) abertos.add(row.dataset.frascoId);
            });

            // Remove tudo que não for o cabeçalho ou o aviso de "nenhum
            // frasco selecionado" — inclui tanto as linhas .request-row
            // já renderizadas por JS quanto o markup estático original
            // (.selected-flask solto, sem wrapper), que é só o fallback
            // pra quando JS não carrega.
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

            // Sem nenhum frasco selecionado, mostra o aviso no lugar da
            // "tabela" em vez de deixar cabeçalho sozinho sobre uma área
            // em branco.
            const vazio = selecionados.size === 0;
            if (selectedFlasksHead) selectedFlasksHead.hidden = vazio;
            if (selectedFlasksEmpty) selectedFlasksEmpty.hidden = !vazio;

            if (window.lucide) {
                lucide.createIcons();
            }
        }

        atualizarProgresso();
    }

    // X vermelho — zera a quantidade direto (mesmo efeito de apagar o
    // campo ou segurar o "-" até 0, só que num clique só).
    resultsContainer.addEventListener("click", (event) => {
        const resetBtn = event.target.closest(".modal-result__reset");
        if (!resetBtn) return;

        const linha = resetBtn.closest(".modal-result");
        const frasco = MOCK_FRASCOS.find((item) => item.id === linha.dataset.frascoId);
        if (!frasco) return;

        selecionados.delete(frasco.id);

        const quantidadeInput = linha.querySelector(".number-input__field");
        if (quantidadeInput) quantidadeInput.value = 0;

        marcarLinhaComoAdicionada(linha, false);
        renderSelecionados();

        // Com o filtro "Adicionados"/"Não adicionados" ativo, esse frasco
        // acabou de sair da lista que deveria aparecer — precisa de uma
        // re-renderização de verdade, não só atualizar limites no lugar.
        if (filtroStatus && filtroStatus.value !== "todos") {
            renderResultados();
        } else {
            atualizarLimitesLinhasVisiveis();
        }
    });

    // A própria rolagem de quantidade (digitando ou pelos botões +/-,
    // que disparam "input" via forms.js) é quem adiciona/remove agora —
    // sair de 0 já conta como selecionado, voltar a 0 tira da seleção.
    // Não precisa mais de um botão "Adicionar" à parte.
    resultsContainer.addEventListener("input", (event) => {
        const quantidadeInput = event.target.closest(".number-input__field");
        if (!quantidadeInput) return;

        const linha = quantidadeInput.closest(".modal-result");
        const frasco = MOCK_FRASCOS.find((item) => item.id === linha?.dataset.frascoId);
        if (!frasco) return;

        // Clamp explícito: o atributo "max" nem sempre reflete o limite
        // mais atual (outra linha pode ter consumido espaço desde a
        // última renderização desta), então recalcula na hora e corrige
        // o valor digitado/incrementado se ele passar do que sobra.
        // Mínimo agora é 0 (não mais 1) — 0 é o estado "não selecionado".
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
        } else {
            selecionados.delete(frasco.id);
        }

        // Só troca o visual (borda/X) quando cruza a fronteira 0 ↔ >0 —
        // ajustar de 3 pra 5, por exemplo, não precisa mexer nisso.
        if (eraAdicionado !== agoraAdicionado) {
            marcarLinhaComoAdicionada(linha, agoraAdicionado);
        }

        renderSelecionados();

        // Só precisa de uma re-renderização de verdade (não só atualizar
        // limites no lugar) quando o status de seleção mudou E o filtro
        // por status está ativo — é isso que faz o frasco sumir/aparecer
        // da lista "Adicionados"/"Não adicionados".
        if (eraAdicionado !== agoraAdicionado && filtroStatus && filtroStatus.value !== "todos") {
            renderResultados();
        } else {
            atualizarLimitesLinhasVisiveis();
        }
    });

    // Remover e expandir/recolher pela lista da tela de análise — remover
    // sincroniza de volta com o modal (renderResultados) pra a linha
    // voltar a mostrar "Adicionar" caso o usuário reabra a busca.
    selectedFlasksList?.addEventListener("click", (event) => {
        const removeBtn = event.target.closest(".selected-flask__remove");

        if (removeBtn) {
            const row = removeBtn.closest(".request-row");
            const id = row?.dataset.frascoId;
            if (!id) return;

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
