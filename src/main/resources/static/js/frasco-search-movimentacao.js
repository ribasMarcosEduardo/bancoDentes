// "PRE_MOLAR" (nome cru do enum Java, como o back-end manda) precisa bater
// com "Pré-Molar" (texto de exibição da <option>) — mesma ideia pra
// EstadoDente ("HIGIDO" x "Hígido") e Denticao ("DECIDUA" x "Decídua").
// Sem essa normalização, "===" nunca bate entre os dois formatos e o
// filtro escolhido derruba a lista pra vazio mesmo havendo frasco
// correspondente no catálogo (o "sem filtro" nunca passa por aqui, por
// isso só o comportamento COM filtro parecia quebrado).
function normalizarTexto(str) {
    return (str || "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/[_-]/g, " ") // underscore/hífen tratados como espaço
        .trim()
        .toLowerCase();
}

// "21/06/25" -> Date — formato usado em todo o protótipo (dd/mm/aa).
function parseDataBr(data) {
    if (!data) return new Date(); // Fallback caso venha nulo
    const [dia, mes, ano] = data.split("/").map(Number);
    return new Date(2000 + ano, mes - 1, dia);
}

// "Misto" sozinho pros frascos Endo (sem arcada/dentição) — "Hígido ·
// Inferior · Permanente" pros demais. Filtra em vez de fixar 3 partes pra
// não sobrar "· ·" quando os campos vêm vazios. Pura (só lê o frasco),
// então fica no nível do módulo — os dois modais (Saída/Entrada) usam a
// mesma, sem duplicar.
function formatarMeta(frasco) {
    return [frasco.estado, frasco.arcada, frasco.denticao].filter(Boolean).join(" · ");
}

// Miolo do painel de detalhes (expandir/recolher) de uma linha "tipo
// selected-flasks" — reaproveitado pelas duas listas da tela (Frascos
// selecionados/Frascos de Origem), cada uma injetando só a(s) linha(s)
// extra(s) que fazem sentido pra ela (Qtd. após a entrada/saída, ou nada)
// no meio do miolo comum.
function montarDetalhesFrasco(frasco, extrasHtml = "") {
    return `
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

            ${extrasHtml}

            <div class="request-detail">
                <span class="request-details__label">Data de cadastro</span>
                <span>${frasco.dataCadastro ?? "—"}</span>
            </div>

            <div class="request-detail">
                <span class="request-details__label">Próxima manutenção</span>
                <span>${frasco.dataManutencao ?? "—"}</span>
            </div>
        </div>
    `;
}

// Alguns filtros são "sem volta" depois da primeira escolha: assim que o
// usuário sai do placeholder (value=""), esse placeholder nunca mais
// reaparece — impede o clique acidental de voltar pro estado "ainda não
// decidi". Ordenar (rotuloQualquer omitido) é o único que ainda faz isso:
// sem resultado nenhum depende dele (só afeta a ORDEM de uma lista que já
// aparece sozinha), então perder a volta não trava filtro nenhum. Grupo
// dentário, Estado do dente e Dentição (rotuloQualquer = "Qualquer
// Grupo"/"Qualquer Estado"/"Qualquer Dentição") só perdem o TEXTO
// original — o próprio placeholder vira essa opção de verdade, específica
// de cada filtro (evita um "Qualquer" genérico igual nos três, que não
// diz a qual filtro pertence), disponível dali em diante pra voltar a
// "sem filtro" quantas vezes quiser — necessário pra Grupo desde que ele
// deixou de ser o gatilho obrigatório da busca (ver temGatilhoDeBusca).
// Status (Todos/Já Escolhidos/Em Manutenção) não passa por aqui: "Todos"
// já é uma opção normal, sempre selecionável, não um placeholder.
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

// Os dois modais (modal_busca_frasco_movimentacao_saida.html/_entrada.html)
// seguem o mesmo esquema de ids, só com "Entrada" inserido depois de
// "Movimentacao" no segundo — monta os ids de um pelo do outro em vez de
// escrever os dois conjuntos na mão (risco real de digitar um id
// diferente por acidente entre os dois arquivos).
function obterRefsModalBusca(sufixo) {
    const overlay = document.querySelector(`#modalBuscaFrascoMovimentacao${sufixo}`);
    if (!overlay) return null;

    return {
        overlay,
        modal: overlay.querySelector(".modal"),
        closeBtn: overlay.querySelector(`#modalBuscaFrascoMovimentacao${sufixo}Close`),
        searchInput: overlay.querySelector(`#modalBuscaFrascoMovimentacao${sufixo}Input`),
        searchClearBtn: overlay.querySelector(".search-clear"),
        filtroGrupo: overlay.querySelector(`#modalFiltroGrupoMovimentacao${sufixo}`),
        filtroEstado: overlay.querySelector(`#modalFiltroEstadoMovimentacao${sufixo}`),
        filtroDenticao: overlay.querySelector(`#modalFiltroDenticaoMovimentacao${sufixo}`),
        filtroStatus: overlay.querySelector(`#modalFiltroStatusMovimentacao${sufixo}`),
        ordenarSelect: overlay.querySelector(`#modalOrdenarMovimentacao${sufixo}`),
        resultsContainer: overlay.querySelector(`#modalBuscaFrascoMovimentacao${sufixo}Results`),
        emptyState: overlay.querySelector(`#modalBuscaFrascoMovimentacao${sufixo}Empty`),
        countLabel: overlay.querySelector(`#modalBuscaFrascoMovimentacao${sufixo}Count`),
        paginationRange: overlay.querySelector(`#modalPaginationRangeMovimentacao${sufixo}`),
        paginationPrev: overlay.querySelector(`#modalPaginationPrevMovimentacao${sufixo}`),
        paginationNext: overlay.querySelector(`#modalPaginationNextMovimentacao${sufixo}`),
    };
}

function setupFrascoSearchModal() {
    const trigger = document.querySelector("#escolherFrascosBtn");
    const triggerLabel = trigger?.querySelector(".btn__label");

    const refsSaida = obterRefsModalBusca("");
    const refsEntrada = obterRefsModalBusca("Entrada");
    const refsOutrosFrascos = obterRefsModalBusca("OutrosFrascos");

    // Página sem o botão de gatilho ou sem nenhum dos modais incluídos
    // (data-include ainda não carregou, ou a tela nem usa esse recurso) —
    // não faz nada.
    if (!trigger || (!refsSaida && !refsEntrada && !refsOutrosFrascos)) return;

    // Campos do formulário por trás dos modais — local decide o recorte
    // por setor (BDH/Biobanco), tipo decide qual modal abre embaixo de
    // "Escolher Frasco(s)" e entra no cálculo de "Qtd. após a
    // movimentação" de cada linha selecionada. Tudo defensivo (?.) caso a
    // página não tenha.
    const localSelect = document.querySelector("#localMovimentacao");
    const tipoSelect = document.querySelector("#tipoMovimentacao");
    // id, não só a classe — desde que #origemFrascosList (abaixo) passou a
    // ter sua própria ".selected-flasks", ".selected-flasks" sozinho virou
    // ambíguo (pegaria a primeira que aparecesse no DOM).
    const selectedFlasksList = document.querySelector("#selectedFlasksList");
    const selectedFlasksHead = document.querySelector("#selectedFlasksHead");
    const selectedFlasksEmpty = document.querySelector("#selectedFlasksEmpty");
    const observacoesWrapper = document.querySelector("#observacoesWrapper");
    const observacoesField = document.querySelector("#observacoesMovimentacao");

    // Bloco "Origem dos Dentes" — só existe pra Entrada (ver
    // cadastro_movimentacao.html). Ausente em qualquer outra tela que
    // reaproveite este arquivo, então tudo abaixo que o usa é defensivo.
    const origemDentesSection = document.querySelector("#origemDentesSection");
    const origemDentesSelect = document.querySelector("#origemDentes");
    const selecionarFrascosOrigemGroup = document.querySelector("#selecionarFrascosOrigemGroup");
    const selecionarFrascosOrigemBtn = document.querySelector("#selecionarFrascosOrigemBtn");
    const quantidadeDoacaoGroup = document.querySelector("#quantidadeDoacaoGroup");
    const quantidadeDoacaoInput = document.querySelector("#quantidadeDoacao");

    // "Frascos de Origem" — só existe quando Origem dos Dentes = "Outro(s)
    // frasco(s)" (ver atualizarOrigemDentes, mais abaixo).
    const frascosOrigemSection = document.querySelector("#frascosOrigemSection");
    const origemFrascosList = document.querySelector("#origemFrascosList");
    const origemFrascosHead = document.querySelector("#origemFrascosHead");
    const origemFrascosEmpty = document.querySelector("#origemFrascosEmpty");
    const origemFrascosTotalValor = document.querySelector("#origemFrascosTotalValor");

    // Estado compartilhado entre os três modais (só um está "ativo" por
    // vez) e a lista "Frascos selecionados" da página — id do frasco ->
    // { frasco, quantidade }. Saída guarda uma quantidade de verdade por
    // frasco (vários frascos, cada um com sua própria rolagem); Entrada
    // nunca tem mais de uma entrada aqui (seleção única, sem quantidade
    // nesse passo — quem decide "quantos dentes" ali é a Origem dos
    // Dentes, não o frasco de destino).
    const selecionados = new Map();

    // Frascos de origem escolhidos no modal "Selecionar Frascos" (Origem
    // dos Dentes = "Outro(s) frasco(s)") — id do frasco -> frasco. Cada um
    // entra INTEIRO no destino (toda a quantidade disponível dele, sem
    // seleção parcial), então basta guardar o frasco — não precisa de uma
    // quantidade à parte como o Map acima.
    const origemFrascosSelecionados = new Map();

    // Só faz sentido durante Entrada com Origem = "Outro(s) frasco(s)" —
    // nesse contexto, "selecionados" (acima) nunca tem mais de 1 item: o
    // próprio frasco de destino escolhido em "Escolher Frasco".
    function frascoDestinoAtual() {
        const [entry] = selecionados.values();
        return entry ? entry.frasco : null;
    }

    function isEntrada() {
        // Agora aceita ENTRADA (case-insensitive) por causa do Enum
        return tipoSelect?.value?.toUpperCase() === "ENTRADA";
    }

    function setorAtual() {
        // Agora aceita BIOBANCO/BDH (case-insensitive) por causa do Enum
        return localSelect?.value?.toUpperCase() === "BIOBANCO" ? "biobanco" : "bdh";
    }

    // Por simplificação do protótipo, o mesmo saldo também tampa a
    // quantidade em Saída (cada frasco é um recipiente físico
    // independente, seu limite nunca muda por causa de outro).
    function maxPermitido(frasco) {
        return frasco.disponivel;
    }

    function qtdAposMovimentacao(frasco, quantidade) {
        return isEntrada()
            ? frasco.disponivel + quantidade
            : Math.max(frasco.disponivel - quantidade, 0);
    }

    // Observações só faz sentido preencher depois que existe pelo menos
    // um frasco selecionado. .textarea-veil-wrapper--locked (ver
    // forms.css) borra só o textarea e mostra o aviso por cima, em vez do
    // .form-section--disabled genérico (que esmaeceria a seção toda,
    // aviso incluso).
    function sincronizarObservacoes() {
        if (!observacoesField) return;

        const liberado = selecionados.size > 0;

        observacoesWrapper?.classList.toggle("textarea-veil-wrapper--locked", !liberado);
        observacoesField.disabled = !liberado;
    }

    function criarLinhaSelecionada(id, entry) {
        const { frasco, quantidade } = entry;
        const entrada = isEntrada();
        const rotuloApos = entrada ? "Qtd. após a entrada" : "Qtd. após a saída";

        const row = document.createElement("article");
        row.className = "request-row";
        row.dataset.frascoId = id;

        row.innerHTML = `
            <div class="selected-flask">
                <span class="result-list__code">${id}</span>
                ${entrada ? "" : `<span>${quantidade}</span>`}

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
                    ${montarDetalhesFrasco(frasco, entrada ? "" : `
                        <div class="request-detail">
                            <span class="request-details__label">${rotuloApos}</span>
                            <span>${qtdAposMovimentacao(frasco, quantidade)}</span>
                        </div>`)}
                </div>
            </div>
        `;

        return row;
    }

    // Soma "quanto o destino vai receber" — cada frasco de origem entra
    // inteiro (toda a quantidade disponível dele).
    function totalDentesOrigemFrascos() {
        let total = 0;
        origemFrascosSelecionados.forEach((frasco) => {
            total += frasco.disponivel;
        });
        return total;
    }

    function criarLinhaOrigemFrasco(id, frasco) {
        const row = document.createElement("article");
        row.className = "request-row";
        row.dataset.frascoId = id;

        row.innerHTML = `
            <div class="selected-flask">
                <span class="result-list__code">${id}</span>
                <span>${frasco.disponivel}</span>

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
                    ${montarDetalhesFrasco(frasco)}
                </div>
            </div>
        `;

        return row;
    }

    // Reflete origemFrascosSelecionados na seção "Frascos de Origem" —
    // mesmo esquema de renderSelecionados, só que numa lista/Map à parte
    // (ver comentário em origemFrascosSelecionados, mais acima).
    function renderOrigemFrascos() {
        if (origemFrascosList) {
            const abertos = new Set();
            origemFrascosList.querySelectorAll(".request-row.is-open").forEach((row) => {
                if (row.dataset.frascoId) abertos.add(row.dataset.frascoId);
            });

            Array.from(origemFrascosList.children).forEach((child) => {
                if (child !== origemFrascosHead && child !== origemFrascosEmpty) {
                    child.remove();
                }
            });

            origemFrascosSelecionados.forEach((frasco, id) => {
                const row = criarLinhaOrigemFrasco(id, frasco);
                if (abertos.has(id)) row.classList.add("is-open");
                origemFrascosList.appendChild(row);
            });

            const vazio = origemFrascosSelecionados.size === 0;
            if (origemFrascosHead) origemFrascosHead.hidden = vazio;
            if (origemFrascosEmpty) origemFrascosEmpty.hidden = !vazio;

            if (window.lucide) {
                lucide.createIcons();
            }
        }

        if (origemFrascosTotalValor) {
            const total = totalDentesOrigemFrascos();
            origemFrascosTotalValor.textContent = `${total} dente${total === 1 ? "" : "s"} selecionado${total === 1 ? "" : "s"}`;
        }
    }

    function limparOrigemFrascos() {
        origemFrascosSelecionados.clear();
        renderOrigemFrascos();
    }

    // Remover e expandir/recolher pela lista "Frascos de Origem" da
    // página — mesmo padrão do listener de #selectedFlasksList, mais
    // abaixo, só que sincronizando de volta com o modal "Selecionar
    // Frascos" (modalOutrosFrascos, montado adiante) em vez dos outros
    // dois.
    origemFrascosList?.addEventListener("click", (event) => {
        const removeBtn = event.target.closest(".selected-flask__remove");

        if (removeBtn) {
            const row = removeBtn.closest(".request-row");
            const id = row?.dataset.frascoId;
            if (!id) return;

            origemFrascosSelecionados.delete(id);
            renderOrigemFrascos();
            modalOutrosFrascos?.renderResultados();
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

    // Reflete o Map inteiro na lista "Frascos selecionados" da tela de
    // cadastro. No projeto completo isso vira só estado local até
    // "Salvar" (cada frasco + quantidade vira um registro de movimentação
    // distinto, ver comentário no HTML); aqui só atualiza a UI.
    function renderSelecionados() {
        if (selectedFlasksList) {
            // Entrada não escolhe quantidade nesse passo (ver
            // criarLinhaSelecionada) — sem essa coluna, a lista colapsa
            // pra 2 colunas (Frasco + Ações) em vez das 3 padrão (ver
            // .selected-flasks--sem-quantidade em analysis.css).
            selectedFlasksList.classList.toggle("selected-flasks--sem-quantidade", isEntrada());

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

        // O frasco de destino é quem decide o filtro implícito do modal
        // "Selecionar Frascos" (mesmos atributos dele — ver
        // setupModalOutrosFrascos) — toda vez que ele muda (troca, é
        // adicionado ou removido), uma seleção de origem feita sob o
        // destino anterior deixa de fazer sentido. atualizarOrigemDentes()
        // também recalcula o travamento de "Origem dos Dentes" (só libera
        // depois que existe um destino).
        limparOrigemFrascos();
        atualizarOrigemDentes();
    }

    // Referência pro modal "ativo" no momento (o que corresponde ao Tipo
    // escolhido) — usada só pra saber qual dos dois precisa re-renderizar
    // a própria lista de resultados quando algo muda por fora dele (ex.:
    // remover um frasco direto pela lista "Frascos selecionados" da
    // página, não pelo modal). modalOutrosFrascos não entra em
    // modalAtivo() — é sempre referenciado direto (só existe no contexto
    // de Entrada + Origem "Outro(s) frasco(s)", nunca some pro Saída
    // reclamar). Todos setados mais abaixo, depois que os modais terminam
    // de montar.
    let modalSaida = null;
    let modalEntrada = null;
    let modalOutrosFrascos = null;

    function modalAtivo() {
        return isEntrada() ? modalEntrada : modalSaida;
    }

    // Remover e expandir/recolher pela lista "Frascos selecionados" da
    // página — remover sincroniza de volta com o modal correspondente
    // (renderResultados) pra a linha voltar a mostrar "não selecionado"
    // caso o usuário reabra a busca.
    selectedFlasksList?.addEventListener("click", (event) => {
        const removeBtn = event.target.closest(".selected-flask__remove");

        if (removeBtn) {
            const row = removeBtn.closest(".request-row");
            const id = row?.dataset.frascoId;
            if (!id) return;

            selecionados.delete(id);
            renderSelecionados();
            modalAtivo()?.renderResultados();
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

    // ---- Origem dos Dentes (só existe pro fluxo de Entrada) ----

    function atualizarOrigemDentes() {
        if (!origemDentesSection) return;

        const entrada = isEntrada();
        const temDestino = selecionados.size > 0;

        // Some por inteiro pra Saída (não é só uma etapa travada, a seção
        // não existe nesse fluxo) — sem "form-section--disabled" junto:
        // assim que aparece pra Entrada já nasce interativa, sem um
        // esmaecimento a mais pra tirar em seguida.
        origemDentesSection.hidden = !entrada;

        if (origemDentesSelect) {
            // Só libera depois que existe um frasco de destino escolhido
            // em "Escolher Frasco" — decidir de onde os dentes vêm não faz
            // sentido antes de saber pra onde eles vão, e "Outro(s)
            // frasco(s)" depende justamente dos atributos desse destino
            // pra filtrar candidatos (ver setupModalOutrosFrascos).
            origemDentesSelect.disabled = !entrada || !temDestino;
            origemDentesSelect.required = entrada;
        }

        const origem = entrada && temDestino ? origemDentesSelect?.value : "";
        const mostrarFrascos = origem === "frascos";
        const mostrarDoacao = origem === "doacao";

        if (selecionarFrascosOrigemGroup) selecionarFrascosOrigemGroup.hidden = !mostrarFrascos;

        if (quantidadeDoacaoGroup) quantidadeDoacaoGroup.hidden = !mostrarDoacao;
        if (quantidadeDoacaoInput) {
            quantidadeDoacaoInput.disabled = !mostrarDoacao;
            quantidadeDoacaoInput.required = mostrarDoacao;
        }

        // "Frascos de Origem" (lista + total) segue o mesmo "mostrarFrascos"
        // de "Selecionar Frascos" acima — só existe enquanto essa origem
        // estiver escolhida.
        if (frascosOrigemSection) frascosOrigemSection.hidden = !mostrarFrascos;
    }

    function resetarOrigemDentes() {
        if (origemDentesSelect) origemDentesSelect.value = "";
        if (quantidadeDoacaoInput) quantidadeDoacaoInput.value = 1;
        atualizarOrigemDentes();
    }

    origemDentesSelect?.addEventListener("change", atualizarOrigemDentes);

    // ---- Troca de Tipo/Local ----

    // Troca de Tipo muda o modal por trás de "Escolher Frasco(s)" — a
    // seleção feita sob um fluxo não faz sentido no outro (Saída junta
    // vários frascos com quantidade própria; Entrada é um só, sem
    // quantidade nesse passo), então reinicia tudo. O rótulo do botão
    // também é ajustado aqui (plural em Saída, singular em Entrada).
    tipoSelect?.addEventListener("change", () => {
        selecionados.clear();
        renderSelecionados();
        resetarOrigemDentes();

        if (triggerLabel) {
            triggerLabel.textContent = isEntrada() ? "Escolher Frasco" : "Escolher Frascos";
        }
    });

    // Troca de Local muda o setor (BDH/Biobanco) que a busca considera —
    // esvazia a seleção feita sob o setor anterior (esses frascos não
    // pertencem mais ao contexto atual do formulário) e recomeça a
    // paginação dos três modais.
    localSelect?.addEventListener("change", () => {
        selecionados.clear();
        renderSelecionados();

        modalSaida?.resetPagina();
        modalSaida?.renderResultados();
        modalEntrada?.resetPagina();
        modalEntrada?.renderResultados();
        modalOutrosFrascos?.resetPagina();
        modalOutrosFrascos?.renderResultados();
    });

    // ---- Miolo comum aos três modais (busca/filtros/paginação/abrir-fechar) ----
    //
    // O que muda de um pro outro é só o que cada linha de resultado
    // oferece (rolagem de quantidade em Saída, botão de seleção única em
    // Entrada, botão de seleção múltipla em Outros Frascos) e, pro
    // terceiro, um catálogo já pré-filtrado (obterCatalogo) em vez do
    // catálogo inteiro — por isso tudo isso fica de fora daqui, injetado
    // por quem chama.
    function criarBuscaFrascoModal(refs, {
        criarLinhaResultado,
        ligarInteracaoResultados,
        estaSelecionado,
        obterCatalogo = () => window.catalogoFrascosCache || [],
        semGatilho = false,
    }) {
        const {
            overlay, modal, closeBtn, searchInput, searchClearBtn,
            filtroGrupo, filtroEstado, filtroDenticao, filtroStatus, ordenarSelect,
            resultsContainer, emptyState, countLabel,
            paginationRange, paginationPrev, paginationNext,
        } = refs;

        if (!modal || !resultsContainer) return null;

        const searchWrapper = searchInput ? searchInput.closest(".search-wrapper") : null;

        // Mock também pagina (mesmo com poucos frascos) pra exercitar os
        // botões/texto de verdade — no projeto completo o tamanho de
        // página provavelmente viria de um controle "Exibir" como o de
        // frascos.html, aqui é só um valor fixo.
        const PAGE_SIZE = 4;
        let paginaAtual = 1;

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

        // Sempre "true": o modal lista todos os frascos do setor atual
        // (BDH/Biobanco, ver bateSetor em getFiltrados) assim que abre —
        // termo digitado e filtros só refinam essa lista, não são mais
        // pré-requisito pra ela aparecer. semGatilho (modal "Selecionar
        // Frascos") continua sem efeito prático aqui, já que o resultado
        // final é o mesmo (sempre gatilho).
        function temGatilhoDeBusca() {
            return true;
        }

        function getFiltrados() {
            const termo = (searchInput?.value || "").trim().toLowerCase();
            const grupo = filtroGrupo?.value || "";
            const estado = filtroEstado?.value || "";
            const denticao = filtroDenticao?.value || "";
            const status = filtroStatus?.value || "todos";
            const ordenacao = ordenarSelect?.value || "";
            const setor = setorAtual();

            const filtrados = obterCatalogo().filter((frasco) => {
                const bateSetor = frasco.setor === setor;
                const bateTermo = !termo || frasco.id.toLowerCase().includes(termo);
                const bateGrupo = !grupo || normalizarTexto(frasco.grupo) === normalizarTexto(grupo);
                const bateEstado = !estado || normalizarTexto(frasco.estado) === normalizarTexto(estado);
                const bateDenticao = !denticao || normalizarTexto(frasco.denticao) === normalizarTexto(denticao);

                // "Já Escolhidos" é o único valor com filtro de verdade
                // aplicado aqui. "Em Manutenção" ainda não filtra nada —
                // no projeto final ela vai depender de uma tag do banco
                // de dados que ainda não existe no mock; por ora se
                // comporta como "Todos" pra não quebrar a lista.
                const bateStatus = status !== "escolhidos" || estaSelecionado(frasco);

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

                if (filtroStatus?.value === "escolhidos") {
                    emptyState.textContent = "Nenhum frasco escolhido ainda.";
                } else {
                    emptyState.textContent = "Nenhum frasco encontrado com esses critérios.";
                }
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

            // Linhas novas trazem seus próprios botões +/- de quantidade
            // (Saída) — setupNumberInputs (forms.js) varre TODOS os
            // .number-input da página de novo, então religa tanto os
            // antigos quanto os recém criados sem duplicar listener (cada
            // chamada busca os elementos atuais no DOM, não guarda
            // referência de chamadas anteriores). Sem custo real pra
            // Entrada, que não tem nenhum .number-input nas linhas.
            if (typeof setupNumberInputs === "function") {
                setupNumberInputs();
            }
        }

        function resetPagina() {
            paginaAtual = 1;
        }

        ligarInteracaoResultados(resultsContainer, { renderResultados });

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

        travarPlaceholderDoFiltro(filtroGrupo, "Qualquer Grupo");
        travarPlaceholderDoFiltro(filtroEstado, "Qualquer Estado");
        travarPlaceholderDoFiltro(filtroDenticao, "Qualquer Dentição");
        travarPlaceholderDoFiltro(ordenarSelect);

        return { open, close, renderResultados, resetPagina };
    }

    // ---- Saída: seleção múltipla, cada frasco com sua própria rolagem
    //      de quantidade (0 zera a seleção, sem botão "Adicionar"). ----
    if (refsSaida) {
        function criarLinhaResultadoSaida(frasco) {
            const linha = document.createElement("article");
            linha.dataset.frascoId = frasco.id;

            const selecionado = selecionados.get(frasco.id);
            const quantidade = selecionado ? selecionado.quantidade : 0;
            const jaAdicionado = quantidade > 0;
            const limite = maxPermitido(frasco);

            // Distinção visual leve (borda verde) pro que já está
            // selecionado.
            linha.className = jaAdicionado ? "modal-result modal-result--added" : "modal-result";
            linha.dataset.added = jaAdicionado ? "true" : "false";

            // Sem botão "Adicionar" — a própria rolagem de quantidade
            // (min=0) é quem adiciona: sair de 0 já conta como
            // selecionado. O X vermelho é só um atalho pra zerar direto,
            // sem precisar segurar o "-" ou apagar o campo manualmente —
            // reserva o espaço mesmo escondido (visibility, não
            // display/hidden) pra não empurrar a rolagem de lugar quando
            // aparece/some.
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

        // Troca só o visual de uma linha entre "adicionado"/"não
        // adicionado" (borda verde + visibilidade do X vermelho), sem
        // precisar re-renderizar o modal inteiro — evita perder o
        // foco/scroll enquanto o usuário está mexendo em outras linhas.
        function marcarLinhaComoAdicionada(linha, adicionado) {
            linha.dataset.added = adicionado ? "true" : "false";
            linha.classList.toggle("modal-result--added", adicionado);

            const resetBtn = linha.querySelector(".modal-result__reset");
            if (resetBtn) {
                resetBtn.classList.toggle("modal-result__reset--invisible", !adicionado);
            }
        }

        function ligarInteracaoSaida(resultsContainer, { renderResultados }) {
            // X vermelho — zera a quantidade direto (mesmo efeito de
            // apagar o campo ou segurar o "-" até 0, só que num clique
            // só).
            resultsContainer.addEventListener("click", (event) => {
                const resetBtn = event.target.closest(".modal-result__reset");
                if (!resetBtn) return;

                const linha = resetBtn.closest(".modal-result");
                const frasco = (window.catalogoFrascosCache || []).find((item) => item.id === linha.dataset.frascoId);
                if (!frasco) return;

                selecionados.delete(frasco.id);

                const quantidadeInput = linha.querySelector(".number-input__field");
                if (quantidadeInput) quantidadeInput.value = 0;

                marcarLinhaComoAdicionada(linha, false);
                renderSelecionados();

                // Com o filtro "Já Escolhidos" ativo, esse frasco acabou
                // de sair da lista que deveria aparecer — precisa de uma
                // re-renderização de verdade, não só o visual da própria
                // linha.
                if (refsSaida.filtroStatus && refsSaida.filtroStatus.value !== "todos") {
                    renderResultados();
                }
            });

            // A própria rolagem de quantidade (digitando ou pelos botões
            // +/-, que disparam "input" via forms.js) é quem
            // adiciona/remove agora — sair de 0 já conta como
            // selecionado, voltar a 0 tira da seleção.
            resultsContainer.addEventListener("input", (event) => {
                const quantidadeInput = event.target.closest(".number-input__field");
                if (!quantidadeInput) return;

                const linha = quantidadeInput.closest(".modal-result");
                const frasco = (window.catalogoFrascosCache || []).find((item) => item.id === linha?.dataset.frascoId);
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

                // Só precisa de uma re-renderização de verdade (não só o
                // visual da própria linha) quando o status de seleção
                // mudou E o filtro por status está ativo — é isso que faz
                // o frasco sumir/aparecer da lista "Já Escolhidos".
                if (eraAdicionado !== agoraAdicionado && refsSaida.filtroStatus && refsSaida.filtroStatus.value !== "todos") {
                    renderResultados();
                }
            });
        }

        modalSaida = criarBuscaFrascoModal(refsSaida, {
            criarLinhaResultado: criarLinhaResultadoSaida,
            ligarInteracaoResultados: ligarInteracaoSaida,
            estaSelecionado: (frasco) => selecionados.has(frasco.id),
        });

        trigger.addEventListener("click", async () => {
            if (isEntrada()) return;

            const originalHtml = trigger.innerHTML;
            trigger.innerHTML = '<i class="icon" data-lucide="loader"></i> <span class="btn__label">Carregando...</span>';
            trigger.disabled = true;
            if (window.lucide) lucide.createIcons();

            await window.carregarCatalogoFrascos();

            trigger.innerHTML = originalHtml;
            trigger.disabled = false;
            if (window.lucide) lucide.createIcons();

            modalSaida?.open();
        });
    }

    // ---- Entrada: seleção única (o frasco de destino) e sem quantidade
    //      nesse passo — um botão por linha alterna entre
    //      "Selecionar"/"Selecionado"; escolher outro troca o que já
    //      estava selecionado, já que só cabe um. ----
    if (refsEntrada) {
        function criarLinhaResultadoEntrada(frasco) {
            const linha = document.createElement("article");
            linha.dataset.frascoId = frasco.id;

            const selecionado = selecionados.has(frasco.id);

            linha.className = selecionado ? "modal-result modal-result--added" : "modal-result";
            linha.dataset.added = selecionado ? "true" : "false";

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
                    <button type="button" class="btn btn-tonal modal-result__select">
                        <i class="icon" data-lucide="${selecionado ? "check" : "plus"}"></i>
                        ${selecionado ? "Selecionado" : "Selecionar"}
                    </button>
                </div>
            `;

            return linha;
        }

        function ligarInteracaoEntrada(resultsContainer, { renderResultados }) {
            resultsContainer.addEventListener("click", (event) => {
                const selectBtn = event.target.closest(".modal-result__select");
                if (!selectBtn) return;

                const linha = selectBtn.closest(".modal-result");
                const frasco = (window.catalogoFrascosCache || []).find((item) => item.id === linha.dataset.frascoId);
                if (!frasco) return;

                const jaEraSelecionado = selecionados.has(frasco.id);
                const frascoHiddenInput = document.getElementById("frascoSelecionadoInput");

                // Só cabe um — escolher um novo descarta o anterior (se
                // houver) antes de valer a nova seleção.
                selecionados.clear();
                if (!jaEraSelecionado) {
                    selecionados.set(frasco.id, { frasco, quantidade: 0 });
                    if (frascoHiddenInput) frascoHiddenInput.value = frasco.codigo;
                } else {
                    if (frascoHiddenInput) frascoHiddenInput.value = "";
                }

                renderSelecionados();
                renderResultados();
            });
        }

        modalEntrada = criarBuscaFrascoModal(refsEntrada, {
            criarLinhaResultado: criarLinhaResultadoEntrada,
            ligarInteracaoResultados: ligarInteracaoEntrada,
            estaSelecionado: (frasco) => selecionados.has(frasco.id),
        });

        trigger.addEventListener("click", async () => {
            if (!isEntrada()) return;

            const originalHtml = trigger.innerHTML;
            trigger.innerHTML = '<i class="icon" data-lucide="loader"></i> <span class="btn__label">Carregando...</span>';
            trigger.disabled = true;
            if (window.lucide) lucide.createIcons();

            await window.carregarCatalogoFrascos();

            trigger.innerHTML = originalHtml;
            trigger.disabled = false;
            if (window.lucide) lucide.createIcons();

            modalEntrada?.open();
        });
    }

    // ---- Outros Frascos: seleção múltipla de frascos DE ORIGEM (Origem
    //      dos Dentes = "Outro(s) frasco(s)") — mesmo botão de
    //      "Selecionar"/"Selecionado" de Entrada, mas sem substituir a
    //      seleção anterior (cada clique só alterna o próprio frasco).
    //      Catálogo já pré-filtrado pelos atributos do destino
    //      (obterCatalogo/semGatilho) — sem Grupo/Estado/Dentição pro
    //      usuário escolher, essa busca não fica esperando gatilho. ----
    if (refsOutrosFrascos) {
        function candidatosOutrosFrascos() {
            const destino = frascoDestinoAtual();
            if (!destino) return [];

            // Mesmos atributos dentários do destino — não faz sentido
            // transportar, por exemplo, Molares pra dentro de um frasco de
            // Incisivos. O próprio destino nunca aparece como opção de
            // origem dele mesmo.
            return (window.catalogoFrascosCache || []).filter((frasco) =>
                frasco.id !== destino.id &&
                frasco.grupo === destino.grupo &&
                frasco.estado === destino.estado &&
                frasco.arcada === destino.arcada &&
                frasco.denticao === destino.denticao
            );
        }

        function criarLinhaResultadoOutrosFrascos(frasco) {
            const linha = document.createElement("article");
            linha.dataset.frascoId = frasco.id;

            const selecionado = origemFrascosSelecionados.has(frasco.id);

            linha.className = selecionado ? "modal-result modal-result--added" : "modal-result";
            linha.dataset.added = selecionado ? "true" : "false";

            // "N dentes disponíveis" junto do resto do meta — quem decide
            // aqui precisa ver de cara quanto vai entrar no destino, já
            // que a seleção transporta o frasco inteiro, sem quantidade
            // parcial.
            linha.innerHTML = `
                <div class="modal-result__info">
                    <span class="modal-result__code">${frasco.id}</span>

                    <div class="modal-result__subinfo">
                        <span class="modal-result__meta">${formatarMeta(frasco)} · ${frasco.disponivel} dentes disponíveis</span>
                        <span class="modal-result__dates">
                            <span class="modal-result__date">Cadastro ${frasco.dataCadastro}</span>
                            <span class="modal-result__dates-sep">·</span>
                            <span class="modal-result__date">Manutenção ${frasco.dataManutencao}</span>
                        </span>
                    </div>
                </div>

                <div class="modal-result__actions">
                    <button type="button" class="btn btn-tonal modal-result__select">
                        <i class="icon" data-lucide="${selecionado ? "check" : "plus"}"></i>
                        ${selecionado ? "Selecionado" : "Selecionar"}
                    </button>
                </div>
            `;

            return linha;
        }

        function ligarInteracaoOutrosFrascos(resultsContainer, { renderResultados }) {
            resultsContainer.addEventListener("click", (event) => {
                const selectBtn = event.target.closest(".modal-result__select");
                if (!selectBtn) return;

                const linha = selectBtn.closest(".modal-result");
                const frasco = (window.catalogoFrascosCache || []).find((item) => item.id === linha.dataset.frascoId);
                if (!frasco) return;

                // Seleção múltipla de verdade — diferente de Entrada, um
                // clique aqui só alterna o próprio frasco, sem mexer nos
                // outros já escolhidos.
                if (origemFrascosSelecionados.has(frasco.id)) {
                    origemFrascosSelecionados.delete(frasco.id);
                } else {
                    origemFrascosSelecionados.set(frasco.id, frasco);
                }

                renderOrigemFrascos();
                renderResultados();
            });
        }

        modalOutrosFrascos = criarBuscaFrascoModal(refsOutrosFrascos, {
            criarLinhaResultado: criarLinhaResultadoOutrosFrascos,
            ligarInteracaoResultados: ligarInteracaoOutrosFrascos,
            estaSelecionado: (frasco) => origemFrascosSelecionados.has(frasco.id),
            obterCatalogo: candidatosOutrosFrascos,
            semGatilho: true,
        });

        if (selecionarFrascosOrigemBtn) {
             selecionarFrascosOrigemBtn.addEventListener("click", async () => {
                const originalHtml = selecionarFrascosOrigemBtn.innerHTML;
                selecionarFrascosOrigemBtn.innerHTML = '<i class="icon" data-lucide="loader"></i> Carregando...';
                selecionarFrascosOrigemBtn.disabled = true;
                if (window.lucide) lucide.createIcons();

                await window.carregarCatalogoFrascos();

                selecionarFrascosOrigemBtn.innerHTML = originalHtml;
                selecionarFrascosOrigemBtn.disabled = false;
                if (window.lucide) lucide.createIcons();

                modalOutrosFrascos?.open();
             });
        }
    }

    // renderSelecionados() já chama atualizarOrigemDentes() no final (ver
    // acima) — não precisa de uma chamada separada aqui.
    renderSelecionados();

    const formMovimentacao = document.getElementById("cadastroMovimentacaoForm");

    if (formMovimentacao) {
        formMovimentacao.addEventListener("submit", function (event) {

            document.querySelectorAll(".item-dinamico").forEach(el => el.remove());

            const ehEntrada = isEntrada();
            const origem = document.getElementById("origemDentes")?.value;

            if (ehEntrada && origem === "frascos") {

                if (origemFrascosSelecionados.size === 0) {
                    event.preventDefault();
                    if (window.Swal) Swal.fire('Atenção', 'Selecione pelo menos um frasco de origem.', 'warning');
                    return;
                }

                let index = 0;
                    origemFrascosSelecionados.forEach((frasco) => {
                    const inputFrasco = document.createElement("input");
                    inputFrasco.type = "hidden";

                    inputFrasco.name = `itens[${index}].codFrasco`;
                    inputFrasco.value = frasco.codigo;
                    inputFrasco.className = "item-dinamico";
                    formMovimentacao.appendChild(inputFrasco);

                    const inputQtd = document.createElement("input");
                    inputQtd.type = "hidden";

                    inputQtd.name = `itens[${index}].quantidade`;
                    inputQtd.value = frasco.disponivel;
                    inputQtd.className = "item-dinamico";
                    formMovimentacao.appendChild(inputQtd);

                    index++;
                });
            }
        });
    }
}

setupFrascoSearchModal();