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

    // A partir daqui: "irmãos" de propósito (mesmo grupo/estado/arcada/
    // denticao de um frasco BDH acima) — servem pra exercitar o modal
    // "Selecionar Frascos" (Origem dos Dentes = "Outro(s) frasco(s)" em
    // cadastro_movimentacao.html), que só mostra frascos com os MESMOS
    // atributos dentários do frasco de destino escolhido (ver
    // candidatosOutrosFrascos, mais abaixo). Sem esses pares, cada
    // combinação ali em cima era única e o modal nunca tinha candidato
    // nenhum pra listar. Endo (ENbd-a0001/a0002) já tinha um par de
    // propósito desde o início — o resto ganha o mesmo tratamento aqui.
    { id: "ENbd-a0013", grupo: "Endo", estado: "Misto", arcada: "", denticao: "", setor: "bdh", disponivel: 15, dataCadastro: "08/07/25", dataManutencao: "08/07/26" },
    { id: "PMbd-a0014", grupo: "Pré-Molar", estado: "Hígido", arcada: "Inferior", denticao: "Permanente", setor: "bdh", disponivel: 10, dataCadastro: "15/07/25", dataManutencao: "15/07/26" },
    { id: "PMbd-a0015", grupo: "Pré-Molar", estado: "Cariado", arcada: "Superior", denticao: "Permanente", setor: "bdh", disponivel: 7, dataCadastro: "22/08/25", dataManutencao: "22/08/26" },
    { id: "MObd-a0016", grupo: "Molar", estado: "Hígido", arcada: "Superior", denticao: "Permanente", setor: "bdh", disponivel: 16, dataCadastro: "03/09/25", dataManutencao: "03/09/26" },
    { id: "MObd-a0017", grupo: "Molar", estado: "Hígido", arcada: "Superior", denticao: "Permanente", setor: "bdh", disponivel: 25, dataCadastro: "11/10/25", dataManutencao: "11/10/26" },
    { id: "CNbd-a0018", grupo: "Canino", estado: "Restaurado", arcada: "Superior", denticao: "Permanente", setor: "bdh", disponivel: 4, dataCadastro: "19/11/25", dataManutencao: "19/11/26" },
    { id: "INbd-a0019", grupo: "Incisivo", estado: "Misto", arcada: "Inferior", denticao: "Permanente", setor: "bdh", disponivel: 12, dataCadastro: "27/12/25", dataManutencao: "27/12/26" },
];

// "21/06/25" -> Date — formato usado em todo o protótipo (dd/mm/aa).
function parseDataBr(data) {
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
// decidi". Grupo dentário/Ordenar (rotuloQualquer omitido) perdem o "sem
// filtro" de vez, já que são os filtros que definem o critério principal
// da busca/ordenação. Estado do dente/Dentição (rotuloQualquer =
// "Qualquer Estado"/"Qualquer Dentição") só perdem o TEXTO original — o
// próprio placeholder vira essa opção de verdade, específica de cada
// filtro (evita um "Qualquer" genérico igual nos dois, que não diz a
// qual filtro pertence), disponível dali em diante pra voltar a "sem
// filtro" quantas vezes quiser. Status (Todos/Já Escolhidos/Em
// Manutenção) não passa por aqui: "Todos" já é uma opção normal, sempre
// selecionável, não um placeholder.
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
        obterCatalogo = () => MOCK_FRASCOS_MOVIMENTACAO,
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

        // true só quando existe um motivo real pra rodar a busca (grupo
        // escolhido ou termo digitado) — é o que mantém a listagem vazia
        // (com o aviso de "escolha um grupo ou pesquise") logo ao abrir,
        // em vez de despejar o setor inteiro de uma vez. semGatilho pula
        // essa espera: o modal "Selecionar Frascos" já nasce filtrado
        // pelos atributos do destino (ver obterCatalogo), não sobra
        // escolha nenhuma pro usuário fazer antes de ver resultado.
        function temGatilhoDeBusca() {
            if (semGatilho) return true;

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

            const filtrados = obterCatalogo().filter((frasco) => {
                const bateSetor = frasco.setor === setor;
                const bateTermo = !termo || frasco.id.toLowerCase().includes(termo);
                const bateGrupo = !grupo || frasco.grupo === grupo;
                const bateEstado = !estado || frasco.estado === estado;
                const bateDenticao = !denticao || frasco.denticao === denticao;

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

        travarPlaceholderDoFiltro(filtroGrupo);
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
                const frasco = MOCK_FRASCOS_MOVIMENTACAO.find((item) => item.id === linha.dataset.frascoId);
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

        trigger.addEventListener("click", () => {
            if (isEntrada()) return;
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
                const frasco = MOCK_FRASCOS_MOVIMENTACAO.find((item) => item.id === linha.dataset.frascoId);
                if (!frasco) return;

                const jaEraSelecionado = selecionados.has(frasco.id);

                // Só cabe um — escolher um novo descarta o anterior (se
                // houver) antes de valer a nova seleção.
                selecionados.clear();
                if (!jaEraSelecionado) {
                    selecionados.set(frasco.id, { frasco, quantidade: 0 });
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

        trigger.addEventListener("click", () => {
            if (!isEntrada()) return;
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
            return MOCK_FRASCOS_MOVIMENTACAO.filter((frasco) =>
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
                const frasco = MOCK_FRASCOS_MOVIMENTACAO.find((item) => item.id === linha.dataset.frascoId);
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

        selecionarFrascosOrigemBtn?.addEventListener("click", () => modalOutrosFrascos?.open());
    }

    // renderSelecionados() já chama atualizarOrigemDentes() no final (ver
    // acima) — não precisa de uma chamada separada aqui.
    renderSelecionados();
}

setupFrascoSearchModal();