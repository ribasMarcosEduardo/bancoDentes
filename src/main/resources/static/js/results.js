function setupViewSwitch() {
    const resultsView = document.querySelector("#resultsView");
    const gridBtn = document.querySelector("[data-view='grid']");
    const listBtn = document.querySelector("[data-view='list']");

    if (!resultsView || !gridBtn || !listBtn) {
        return;
    }

    function setView(view) {
        const isGrid = view === "grid";

        resultsView.classList.toggle("results--grid", isGrid);
        resultsView.classList.toggle("results--list", !isGrid);

        gridBtn.classList.toggle("active", isGrid);
        listBtn.classList.toggle("active", !isGrid);

        localStorage.setItem("frascosViewMode", view);
    }

    const savedView = localStorage.getItem("frascosViewMode") || "grid";
    setView(savedView);

    gridBtn.addEventListener("click", () => setView("grid"));
    listBtn.addEventListener("click", () => setView("list"));
}

function setupSectorSwitch() {
    // Além do sector-switch da paginação, a página pode ter as abas de
    // setor do header do celular (#sectorTabs, partials/app_mobile.html) -
    // só um dos dois aparece por vez, e os dois ficam sempre em sincronia
    const switchers = Array.from(document.querySelectorAll("#sectorSwitch, #sectorTabs"));
    const resultsView = document.querySelector("#resultsView");

    if (!switchers.length || !resultsView) {
        return;
    }

    const buttons = switchers.flatMap((switcher) => Array.from(switcher.querySelectorAll("button[data-setor]")));
    const items = resultsView.querySelectorAll("[data-setor]");

    let setorAtivo = null;

    // Itens entram em cascata, como na troca de página (animarItensVisiveis,
    // filters.js). Sem filters.js na página, repete o fade do bloco inteiro
    function replayEntranceAnimation() {
        if (typeof animarItensVisiveis === "function") {
            animarItensVisiveis();
            return;
        }

        resultsView.querySelectorAll(".results-grid, .result-table").forEach((el) => {
            el.style.animation = "none";
            void el.offsetWidth;
            el.style.animation = "";
        });
    }

    function moveIndicator(switcher) {
        const indicator = switcher.querySelector(".sector-switch__indicator, .app-tabs__indicator");
        const button = switcher.querySelector("button[data-setor].active");

        if (!indicator || !button) return;

        // O CSS recorta o indicador com essas medidas (clip-path, ver view-switch.css)
        indicator.style.setProperty("--ind-x", `${button.offsetLeft}px`);
        indicator.style.setProperty("--ind-w", `${button.offsetWidth}px`);
        indicator.style.setProperty("--ind-trilho", `${switcher.scrollWidth}px`);
    }

    function setSector(setor) {
        setorAtivo = setor;

        buttons.forEach((button) => {
            button.classList.toggle("active", button.dataset.setor === setor);
        });

        switchers.forEach(moveIndicator);

        items.forEach((item) => {
            const matches = setor === "todos" || item.dataset.setor === setor;
            item.classList.toggle("is-hidden-by-sector", !matches);
        });

        localStorage.setItem("frascosSectorFilter", setor);

        // Só marca a classe acima — quem decide display/contagem/
        // paginação/estado vazio é sempre applyPagination (filters.js),
        // senão essas trocas de setor nunca refletiam ali (o "Nenhum
        // frasco encontrado" nunca aparecia mesmo com o setor zerando
        // tudo, e a contagem/paginação ficavam contando os itens
        // escondidos como se estivessem visíveis).
        if (typeof window.applyPagination === "function") {
            window.applyPagination();
        }
    }


    const savedSector = localStorage.getItem("frascosSectorFilter") || "todos";
    setSector(savedSector);

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            setSector(button.dataset.setor);
            replayEntranceAnimation();
        });
    });

    // O "Limpar filtros" do estado vazio (partials/empty_state.html)
    // também volta o setor pra "Todos" — o setor sozinho pode ser o
    // motivo de não ter resultado. Os checkboxes ele já limpa pelo
    // .filters-clear (filters.js); o da barra de filtros ativos não
    // mexe no setor.
    resultsView.querySelectorAll(".empty-state__action").forEach((button) => {
        button.addEventListener("click", () => {
            if (setorAtivo === "todos") return;
            setSector("todos");
            replayEntranceAnimation();
        });
    });

    // Também cobre o switch que estava escondido (largura 0) e passou a
    // aparecer. Os botões entram junto: as abas do header ocupam a largura
    // toda e não mudam de tamanho quando a fonte carrega, só os botões
    const resizeObserver = new ResizeObserver(() => switchers.forEach(moveIndicator));
    [...switchers, ...buttons].forEach((el) => resizeObserver.observe(el));
}

/*
    Abas que mostram só um grupo de itens por vez, marcando uma classe
    is-hidden-by-* em cada um e deixando applyPagination (filters.js)
    decidir visibilidade/contagem/estado vazio - mesma mecânica do
    setSector acima, sem lembrar a escolha (a página sempre abre em
    "inicial"). Pode ter um switch no desktop e as abas do header do
    celular (partials/app_mobile.html), sempre em sincronia.

        seletores: os switches/abas (ex.: "#statusSwitch, #statusTabs")
        atributo:  data-* comparado entre botão e item (ex.: "status")
        inicial:   valor ativo ao abrir (um ?atributo=valor na URL tem prioridade)
        todos:     valor que mostra tudo (opcional); com ele, o "Limpar
                   filtros" do estado vazio também volta pra essa aba
*/
function setupAbasDeGrupo({ seletores, atributo, inicial, todos = null }) {
    const switchers = Array.from(document.querySelectorAll(seletores));
    const resultsView = document.querySelector("#resultsView");

    if (!switchers.length || !resultsView) {
        return;
    }

    const buttons = switchers.flatMap((switcher) => Array.from(switcher.querySelectorAll(`button[data-${atributo}]`)));
    const items = resultsView.querySelectorAll(`[data-${atributo}]`);
    const classeOculta = `is-hidden-by-${atributo}`;

    let valorAtivo = null;

    function moveIndicator(switcher) {
        const indicator = switcher.querySelector(".sector-switch__indicator, .app-tabs__indicator");
        const button = switcher.querySelector(`button[data-${atributo}].active`);

        if (!indicator || !button) return;

        indicator.style.setProperty("--ind-x", `${button.offsetLeft}px`);
        indicator.style.setProperty("--ind-w", `${button.offsetWidth}px`);
        indicator.style.setProperty("--ind-trilho", `${switcher.scrollWidth}px`);
    }

    function setValor(valor) {
        valorAtivo = valor;

        buttons.forEach((button) => {
            const isActive = button.dataset[atributo] === valor;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });

        switchers.forEach(moveIndicator);

        items.forEach((item) => {
            item.classList.toggle(classeOculta, valor !== todos && item.dataset[atributo] !== valor);
        });

        if (typeof window.applyPagination === "function") {
            window.applyPagination();
        }

        // Pra quem depende da aba ativa (ex.: setupFiltrosPorEtapa)
        document.dispatchEvent(new CustomEvent("abas-de-grupo:troca", { detail: { atributo, valor } }));
    }

    // Mesmo do setupSectorSwitch
    function replayEntranceAnimation() {
        if (typeof animarItensVisiveis === "function") {
            animarItensVisiveis();
            return;
        }

        resultsView.querySelectorAll(".results-grid, .result-table").forEach((el) => {
            el.style.animation = "none";
            void el.offsetWidth;
            el.style.animation = "";
        });
    }

    // A URL pode escolher a aba de abertura (ex.: ?etapa=finalizadas depois de
    // confirmar uma retirada, AnaliseSolicitacaoFormController) - só se existir
    const pedidoNaUrl = new URLSearchParams(location.search).get(atributo);
    const abaDaUrl = buttons.some((button) => button.dataset[atributo] === pedidoNaUrl) ? pedidoNaUrl : null;

    setValor(abaDaUrl ?? inicial);

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            setValor(button.dataset[atributo]);
            replayEntranceAnimation();
        });
    });

    // Como no setupSectorSwitch: a aba sozinha pode ser o motivo de não ter
    // resultado. Só pra abas com um "mostrar tudo" (as sem ele são visões
    // diferentes, ex.: Em andamento/Concluídas, não um filtro)
    if (todos !== null) {
        resultsView.querySelectorAll(".empty-state__action").forEach((button) => {
            button.addEventListener("click", () => {
                if (valorAtivo === todos) return;
                setValor(todos);
                replayEntranceAnimation();
            });
        });
    }

    // Mesmo motivo do setupSectorSwitch: switch que aparece depois de
    // escondido e abas que só mudam de largura quando a fonte carrega
    const resizeObserver = new ResizeObserver(() => switchers.forEach(moveIndicator));
    [...switchers, ...buttons].forEach((el) => resizeObserver.observe(el));
}

/*
    Filtro de Status acompanhando a etapa (painéis de solicitações): só os
    status da etapa ativa aparecem na gaveta (data-etapa-filtro em cada
    .checkbox-filter), e trocar de etapa desmarca os de status - um marcado
    de outra etapa esconderia a lista inteira. Com uma opção só na etapa
    (Pendentes), a seção inteira some. style.display e não o atributo hidden:
    o display do .checkbox-filter no CSS venceria o hidden.
    Precisa ser chamada antes do setupAbasDeGrupo da etapa, que já avisa
    a aba inicial ao abrir.
*/
function setupFiltrosPorEtapa() {
    const labels = Array.from(document.querySelectorAll(".checkbox-filter[data-etapa-filtro]"));

    if (!labels.length) return;

    const secao = labels[0].closest(".filter-section");

    document.addEventListener("abas-de-grupo:troca", ({ detail }) => {
        if (detail.atributo !== "etapa") return;

        let desmarcado = null;

        labels.forEach((label) => {
            label.style.display = label.dataset.etapaFiltro === detail.valor ? "" : "none";

            const checkbox = label.querySelector("input");
            if (checkbox.checked) {
                checkbox.checked = false;
                desmarcado = checkbox;
            }
        });

        if (secao) {
            const visiveis = labels.filter((label) => label.style.display !== "none").length;
            secao.style.display = visiveis > 1 ? "" : "none";
        }

        // Um "change" basta: filters.js refaz os chips e a filtragem lendo
        // todos os checkboxes
        desmarcado?.dispatchEvent(new Event("change"));
    });
}

setupViewSwitch();
setupSectorSwitch();
setupFiltrosPorEtapa();

// Manutenções: Em andamento / Concluídas
setupAbasDeGrupo({ seletores: "#statusSwitch, #statusTabs", atributo: "status", inicial: "andamento" });

// Movimentações (só no celular): Todas / Entradas / Saídas / Transferências.
// Soma com o filtro de Tipo da gaveta
setupAbasDeGrupo({ seletores: "#tipoTabs", atributo: "tipo", inicial: "todas", todos: "todas" });

// Painel de Solicitações: Pendentes / Em andamento / Finalizadas (a fila de
// trabalho do laboratório)
setupAbasDeGrupo({ seletores: "#etapaSwitch, #etapaTabs", atributo: "etapa", inicial: "pendentes" });
