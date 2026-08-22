// Mock temporário: no projeto completo esses frascos vêm de uma consulta
// ao backend, já recortada pelo Local (BDH/Biobanco) escolhido lá em cima
// no formulário. Aqui é só um catálogo único com os dois setores
// misturados (campo "setor"), e o JS filtra pelo que #localMovimentacao
// tiver selecionado. Cobre também "Endo" (sem arcada/dentição/numeração,
// mesma regra de cadastro_frasco.html/forms.js) pra exercitar o exemplo
// de uso real: aula de Endodontia pedindo 30 dentes, atendida com 2
// frascos Endo do BDH (ENbd-a0001 com 22, ENbd-a0002 com 30 disponíveis).
//
// Identificador: {grupo}{setor}-a{seq}. Grupo sempre com 2 letras — PM
// (Pré-Molar), MO (Molar), EN (Endo), CN (Canino), IN (Incisivo); setor
// "bd" (BDH) ou "bb" (Biobanco); o "a" no meio é fixo, não representa
// nada (mesmo modelo usado em frascos.html/movimentacoes.html).
const MOCK_FRASCOS_MOVIMENTACAO = [
    { id: "ENbd-a0001", grupo: "Endo", estado: "Misto", arcada: "", denticao: "", setor: "bdh", disponivel: 22, dataCadastro: "05/01/25", dataManutencao: "05/01/26" },
    { id: "ENbd-a0002", grupo: "Endo", estado: "Misto", arcada: "", denticao: "", setor: "bdh", disponivel: 30, dataCadastro: "14/02/25", dataManutencao: "14/02/26" },
    { id: "ENbb-a0003", grupo: "Endo", estado: "Misto", arcada: "", denticao: "", setor: "biobanco", disponivel: 12, dataCadastro: "20/03/25", dataManutencao: "20/03/26" },
    { id: "PMbd-a0004", grupo: "Pré-Molar", estado: "Hígido", arcada: "Inferior", denticao: "Permanente", setor: "bdh", disponivel: 14, dataCadastro: "12/03/25", dataManutencao: "12/03/26" },
    { id: "PMbd-a0005", grupo: "Pré-Molar", estado: "Cariado", arcada: "Superior", denticao: "Permanente", setor: "bdh", disponivel: 9, dataCadastro: "04/05/25", dataManutencao: "04/05/26" },
    { id: "PMbb-a0006", grupo: "Pré-Molar", estado: "Hígido", arcada: "Inferior", denticao: "Decídua", setor: "biobanco", disponivel: 11, dataCadastro: "09/02/25", dataManutencao: "09/02/26" },
    { id: "MObd-a0007", grupo: "Molar", estado: "Hígido", arcada: "Superior", denticao: "Permanente", setor: "bdh", disponivel: 20, dataCadastro: "30/01/25", dataManutencao: "30/01/26" },
    { id: "MObb-a0008", grupo: "Molar", estado: "Restaurado", arcada: "Inferior", denticao: "Permanente", setor: "biobanco", disponivel: 8, dataCadastro: "25/06/25", dataManutencao: "25/06/26" },
    { id: "CNbd-a0009", grupo: "Canino", estado: "Restaurado", arcada: "Superior", denticao: "Permanente", setor: "bdh", disponivel: 6, dataCadastro: "02/03/25", dataManutencao: "02/03/26" },
    { id: "CNbb-a0010", grupo: "Canino", estado: "Hígido", arcada: "Inferior", denticao: "Decídua", setor: "biobanco", disponivel: 5, dataCadastro: "18/06/25", dataManutencao: "18/06/26" },
    { id: "INbd-a0011", grupo: "Incisivo", estado: "Misto", arcada: "Inferior", denticao: "Permanente", setor: "bdh", disponivel: 18, dataCadastro: "18/06/25", dataManutencao: "18/06/26" },
    { id: "INbb-a0012", grupo: "Incisivo", estado: "Hígido", arcada: "Superior", denticao: "Decídua", setor: "biobanco", disponivel: 6, dataCadastro: "10/04/25", dataManutencao: "10/04/26" },
];

// "21/06/25" -> Date — formato usado em todo o protótipo (dd/mm/aa).
function parseDataBr(data) {
    const [dia, mes, ano] = data.split("/").map(Number);
    return new Date(2000 + ano, mes - 1, dia);
}

// Alguns filtros são "sem volta" depois da primeira escolha: assim que o
// usuário sai do placeholder (value=""), esse placeholder nunca mais
// reaparece — impede o clique acidental de voltar pro estado "ainda não
// decidi". Grupo dentário/Ordenar (rotuloQualquer omitido) perdem o "sem
// filtro" de vez, já que são os filtros que definem o critério principal
// da busca/ordenação. Estado do dente/Dentição (rotuloQualquer =
// "Qualquer Estado"/"Qualquer Dentição") só perdem o TEXTO original — o
// próprio placeholder vira essa opção de verdade, específica de cada
// filtro (evita um "Qualquer" genérico igual nos dois, que não diz a
// qual filtro pertence), disponível dali em diante pra voltar a "sem
// filtro" quantas vezes quiser. Status (Todos/Já Escolhidos) não passa
// por aqui: "Todos" já é uma opção normal, sempre selecionável, não um
// placeholder.
function travarPlaceholderDoFiltro(select, rotuloQualquer) {
    if (!select) return;

    select.addEventListener("change", () => {
        if (select.value === "") return;

        const placeholder = select.querySelector("option[value='']");
        if (!placeholder) return;

        if (rotuloQualquer) {
            placeholder.textContent = rotuloQualquer;
        } else {
            placeholder.remove();
        }
    });
}

function setupFrascoSearchModal() {
    const trigger = document.querySelector("#escolherFrascosBtn");
    const overlay = document.querySelector("#modalBuscaFrascoMovimentacao");

    // Página sem o botão de gatilho ou sem o modal incluído (data-include
    // ainda não carregou, ou a tela nem usa esse recurso) — não faz nada.
    if (!trigger || !overlay) return;

    const modal = overlay.querySelector(".modal");
    const closeBtn = overlay.querySelector("#modalBuscaFrascoMovimentacaoClose");
    const searchInput = overlay.querySelector("#modalBuscaFrascoMovimentacaoInput");
    const searchWrapper = searchInput ? searchInput.closest(".search-wrapper") : null;
    const searchClearBtn = overlay.querySelector(".search-clear");
    const filtroGrupo = overlay.querySelector("#modalFiltroGrupoMovimentacao");
    const filtroEstado = overlay.querySelector("#modalFiltroEstadoMovimentacao");
    const filtroDenticao = overlay.querySelector("#modalFiltroDenticaoMovimentacao");
    const filtroStatus = overlay.querySelector("#modalFiltroStatusMovimentacao");
    const ordenarSelect = overlay.querySelector("#modalOrdenarMovimentacao");
    const resultsContainer = overlay.querySelector("#modalBuscaFrascoMovimentacaoResults");
    const emptyState = overlay.querySelector("#modalBuscaFrascoMovimentacaoEmpty");
    const countLabel = overlay.querySelector("#modalBuscaFrascoMovimentacaoCount");
    const paginationRange = overlay.querySelector("#modalPaginationRangeMovimentacao");
    const paginationPrev = overlay.querySelector("#modalPaginationPrevMovimentacao");
    const paginationNext = overlay.querySelector("#modalPaginationNextMovimentacao");

    if (!modal || !resultsContainer) return;

    // Mock também pagina (mesmo com poucos frascos) pra exercitar os
    // botões/texto de verdade — no projeto completo o tamanho de página
    // provavelmente viria de um controle "Exibir" como o de frascos.html,
    // aqui é só um valor fixo.
    const PAGE_SIZE = 4;
    let paginaAtual = 1;

    // Campos do formulário por trás do modal — local decide o recorte por
    // setor (BDH/Biobanco) e tipo entra no cálculo de "Qtd. após a
    // movimentação" de cada linha selecionada. Tudo defensivo (?.) caso a
    // página não os tenha.
    const localSelect = document.querySelector("#localMovimentacao");
    const tipoSelect = document.querySelector("#tipoMovimentacao");
    const selectedFlasksList = document.querySelector(".selected-flasks");
    const selectedFlasksHead = document.querySelector("#selectedFlasksHead");
    const selectedFlasksEmpty = document.querySelector("#selectedFlasksEmpty");
    const observacoesWrapper = document.querySelector("#observacoesWrapper");
    const observacoesField = document.querySelector("#observacoesMovimentacao");

    // Estado compartilhado entre o modal e a lista "Frascos selecionados"
    // da página — Map em vez de ler/escrever o DOM toda hora, pra manter
    // uma única fonte de verdade enquanto o usuário ajusta quantidades,
    // adiciona e remove. id do frasco -> { frasco, quantidade }.
    const selecionados = new Map();

    function setorAtual() {
        return localSelect?.value === "biobanco" ? "biobanco" : "bdh";
    }

    // Diferente do modal de análise de solicitação (onde vários frascos
    // disputam uma mesma cota "quanto falta pra completar o pedido"),
    // aqui cada frasco é um recipiente físico independente — o limite de
    // um nunca muda por causa do que foi escolhido em outro. Por
    // simplificação do protótipo, o mesmo saldo também tampa a
    // quantidade em "Entrada" (na prática uma entrada não teria por que
    // ficar presa ao saldo atual do frasco, mas evita valores digitados
    // sem nenhum teto por enquanto).
    function maxPermitido(frasco) {
        return frasco.disponivel;
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

    // true só quando existe um motivo real pra rodar a busca (grupo
    // escolhido ou termo digitado) — é o que mantém a listagem vazia
    // (com o aviso de "escolha um grupo ou pesquise") logo ao abrir,
    // em vez de despejar o setor inteiro de uma vez.
    function temGatilhoDeBusca() {
        const termo = (searchInput?.value || "").trim();
        return termo.length > 0 || (filtroGrupo?.value || "") !== "";
    }

    function getFiltrados() {
        const termo = (searchInput?.value || "").trim().toLowerCase();
        const grupo = filtroGrupo?.value || "";
        const estado = filtroEstado?.value || "";
        const denticao = filtroDenticao?.value || "";
        const status = filtroStatus?.value || "todos";
        const ordenacao = ordenarSelect?.value || "";
        const setor = setorAtual();

        const filtrados = MOCK_FRASCOS_MOVIMENTACAO.filter((frasco) => {
            const bateSetor = frasco.setor === setor;
            const bateTermo = !termo || frasco.id.toLowerCase().includes(termo);
            const bateGrupo = !grupo || frasco.grupo === grupo;
            const bateEstado = !estado || frasco.estado === estado;
            const bateDenticao = !denticao || frasco.denticao === denticao;

            // Só "Todos"/"Já Escolhidos" (ver modal_busca_frasco_movimentacao.html)
            // — sem opção pro inverso, então basta checar o caso positivo.
            const bateStatus = status === "todos" || selecionados.has(frasco.id);

            return bateSetor && bateTermo && bateGrupo && bateEstado && bateDenticao && bateStatus;
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

    // "Misto" sozinho pros frascos Endo (sem arcada/dentição) — "Hígido ·
    // Inferior · Permanente" pros demais. Filtra em vez de fixar 3 partes
    // pra não sobrar "· ·" quando os campos vêm vazios.
    function formatarMeta(frasco) {
        return [frasco.estado, frasco.arcada, frasco.denticao].filter(Boolean).join(" · ");
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
                    <span class="modal-result__meta">${formatarMeta(frasco)}</span>
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
        const gatilho = temGatilhoDeBusca();
        const filtrados = gatilho ? getFiltrados() : [];

        const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
        paginaAtual = Math.min(Math.max(paginaAtual, 1), totalPaginas);

        const inicio = (paginaAtual - 1) * PAGE_SIZE;
        const pagina = filtrados.slice(inicio, inicio + PAGE_SIZE);

        resultsContainer.innerHTML = "";
        pagina.forEach((frasco) => resultsContainer.appendChild(criarLinhaResultado(frasco)));

        if (emptyState) {
            emptyState.hidden = filtrados.length > 0;

            if (!gatilho) {
                emptyState.textContent = "Escolha um grupo dentário ou pesquise por um identificador para ver os frascos disponíveis.";
            } else if (filtroStatus?.value === "escolhidos") {
                emptyState.textContent = "Nenhum frasco escolhido ainda.";
            } else {
                emptyState.textContent = "Nenhum frasco encontrado com esses critérios.";
            }
        }

        if (countLabel) {
            if (!gatilho) {
                countLabel.textContent = "Nenhuma busca realizada";
            } else {
                const plural = filtrados.length === 1 ? "" : "s";
                countLabel.textContent = `${filtrados.length} frasco${plural} encontrado${plural}`;
            }
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

    // Observações só faz sentido preencher depois que existe pelo menos
    // um frasco selecionado (ver cadastro_movimentacao.html) — reflete
    // esse gate a cada mudança na seleção. .textarea-veil-wrapper--locked
    // (ver forms.css) borra só o textarea e mostra o aviso por cima, em
    // vez do .form-section--disabled genérico (que esmaeceria a seção
    // toda, aviso incluso).
    function sincronizarObservacoes() {
        if (!observacoesField) return;

        const liberado = selecionados.size > 0;

        observacoesWrapper?.classList.toggle("textarea-veil-wrapper--locked", !liberado);
        observacoesField.disabled = !liberado;
    }

    function qtdAposMovimentacao(frasco, quantidade) {
        const tipo = tipoSelect?.value;
        return tipo === "entrada"
            ? frasco.disponivel + quantidade
            : Math.max(frasco.disponivel - quantidade, 0);
    }

    function criarLinhaSelecionada(id, entry) {
        const { frasco, quantidade } = entry;
        const tipo = tipoSelect?.value;
        const rotuloApos = tipo === "entrada" ? "Qtd. após a entrada" : "Qtd. após a saída";

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
                            <span>${frasco.arcada || "—"}</span>
                        </div>

                        <div class="request-detail">
                            <span class="request-details__label">Dentição</span>
                            <span>${frasco.denticao || "—"}</span>
                        </div>

                        <div class="request-detail">
                            <span class="request-details__label">Qtd. total do frasco</span>
                            <span>${frasco.disponivel}</span>
                        </div>

                        <div class="request-detail">
                            <span class="request-details__label">${rotuloApos}</span>
                            <span>${qtdAposMovimentacao(frasco, quantidade)}</span>
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
    // cadastro. No projeto completo isso vira só estado local até
    // "Salvar" (cada frasco + quantidade vira um registro de movimentação
    // distinto, ver comentário no HTML); aqui só atualiza a UI.
    function renderSelecionados() {
        if (selectedFlasksList) {
            const abertos = new Set();
            selectedFlasksList.querySelectorAll(".request-row.is-open").forEach((row) => {
                if (row.dataset.frascoId) abertos.add(row.dataset.frascoId);
            });

            // Remove tudo que não for o cabeçalho ou o aviso de "nenhum
            // frasco selecionado".
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

        sincronizarObservacoes();
    }

    // X vermelho — zera a quantidade direto (mesmo efeito de apagar o
    // campo ou segurar o "-" até 0, só que num clique só).
    resultsContainer.addEventListener("click", (event) => {
        const resetBtn = event.target.closest(".modal-result__reset");
        if (!resetBtn) return;

        const linha = resetBtn.closest(".modal-result");
        const frasco = MOCK_FRASCOS_MOVIMENTACAO.find((item) => item.id === linha.dataset.frascoId);
        if (!frasco) return;

        selecionados.delete(frasco.id);

        const quantidadeInput = linha.querySelector(".number-input__field");
        if (quantidadeInput) quantidadeInput.value = 0;

        marcarLinhaComoAdicionada(linha, false);
        renderSelecionados();

        // Com o filtro "Já Escolhidos" ativo, esse frasco acabou de sair da
        // lista que deveria aparecer — precisa de uma re-renderização de
        // verdade, não só o visual da própria linha.
        if (filtroStatus && filtroStatus.value !== "todos") {
            renderResultados();
        }
    });

    // A própria rolagem de quantidade (digitando ou pelos botões +/-,
    // que disparam "input" via forms.js) é quem adiciona/remove agora —
    // sair de 0 já conta como selecionado, voltar a 0 tira da seleção.
    resultsContainer.addEventListener("input", (event) => {
        const quantidadeInput = event.target.closest(".number-input__field");
        if (!quantidadeInput) return;

        const linha = quantidadeInput.closest(".modal-result");
        const frasco = MOCK_FRASCOS_MOVIMENTACAO.find((item) => item.id === linha?.dataset.frascoId);
        if (!frasco) return;

        const limite = maxPermitido(frasco);
        let quantidade = Number(quantidadeInput.value || 0);
        quantidade = Math.min(Math.max(quantidade, 0), Math.max(limite, 0));

        quantidadeInput.value = quantidade;

        const eraAdicionado = linha.dataset.added === "true";
        const agoraAdicionado = quantidade > 0;

        if (agoraAdicionado) {
            selecionados.set(frasco.id, { frasco, quantidade });
        } else {
            selecionados.delete(frasco.id);
        }

        if (eraAdicionado !== agoraAdicionado) {
            marcarLinhaComoAdicionada(linha, agoraAdicionado);
        }

        renderSelecionados();

        // Só precisa de uma re-renderização de verdade (não só o visual da
        // própria linha) quando o status de seleção mudou E o filtro por
        // status está ativo — é isso que faz o frasco sumir/aparecer da
        // lista "Já Escolhidos".
        if (eraAdicionado !== agoraAdicionado && filtroStatus && filtroStatus.value !== "todos") {
            renderResultados();
        }
    });

    // Remover e expandir/recolher pela lista "Frascos selecionados" da
    // página — remover sincroniza de volta com o modal (renderResultados)
    // pra a linha voltar a mostrar "0" caso o usuário reabra a busca.
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

    [filtroGrupo, filtroEstado, filtroDenticao, filtroStatus, ordenarSelect].forEach((select) => {
        select?.addEventListener("change", () => {
            paginaAtual = 1;
            renderResultados();
        });
    });

    travarPlaceholderDoFiltro(filtroGrupo);
    travarPlaceholderDoFiltro(filtroEstado, "Qualquer Estado");
    travarPlaceholderDoFiltro(filtroDenticao, "Qualquer Dentição");
    travarPlaceholderDoFiltro(ordenarSelect);

    // Troca de Local muda o setor (BDH/Biobanco) que a busca considera —
    // esvazia a seleção feita sob o setor anterior (esses frascos não
    // pertencem mais ao contexto atual do formulário) e recomeça a
    // paginação. Troca de Tipo não mexe em quem está selecionado, só
    // recalcula "Qtd. após a entrada/saída" de cada linha já escolhida.
    localSelect?.addEventListener("change", () => {
        selecionados.clear();
        renderSelecionados();
        paginaAtual = 1;
        renderResultados();
    });

    tipoSelect?.addEventListener("change", renderSelecionados);

    renderSelecionados();
    renderResultados();
}