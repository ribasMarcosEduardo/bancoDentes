// Layout de app no celular (partials/app_mobile.html, css/layout/app-mobile.css).
// Precisa bater com o corte do @media de app-mobile.css.
const APP_MOBILE_MQ = window.matchMedia("(max-width: 600px)");

// Menu do botão de perfil, no header
function setupPerfilMenu() {
    const perfil = document.querySelector(".app-perfil");

    if (!perfil) return;

    const btn = perfil.querySelector(".app-perfil__btn");

    function setAberto(aberto) {
        perfil.classList.toggle("is-open", aberto);
        btn.setAttribute("aria-expanded", String(aberto));
    }

    btn.addEventListener("click", () => setAberto(!perfil.classList.contains("is-open")));

    // Cliques dentro do menu (ex.: trocar o tema) não fecham
    document.addEventListener("click", (event) => {
        if (!perfil.contains(event.target)) setAberto(false);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setAberto(false);
    });
}

/*
    No celular os cards vêm sem os botões (os de 32px são pequenos pro
    dedo): tocar no card abre uma folha de baixo pra cima com as ações dele. Cada item da
    folha só repassa o clique pro botão original, que continua no card
    (escondido) - assim as confirmações (Swal), o modal de concluir
    manutenção e os forms seguem funcionando sem nenhuma mudança.
*/
function setupFolhaAcoesCard() {
    const grid = document.querySelector(".results-grid");

    if (!grid || !document.body.classList.contains("app-mobile")) return;

    const overlay = document.createElement("div");
    overlay.className = "app-sheet-overlay";

    const folha = document.createElement("section");
    folha.className = "app-sheet";
    folha.setAttribute("role", "dialog");
    folha.setAttribute("aria-modal", "true");
    folha.setAttribute("aria-labelledby", "appSheetTitulo");
    folha.innerHTML = `
        <span class="app-sheet__handle" aria-hidden="true"></span>
        <header class="app-sheet__header">
            <div>
                <h2 class="app-sheet__titulo" id="appSheetTitulo"></h2>
                <p class="app-sheet__meta"></p>
            </div>
            <span class="app-sheet__codigo"></span>
        </header>
        <div class="app-sheet__acoes"></div>
    `;

    document.body.append(overlay, folha);

    const titulo = folha.querySelector(".app-sheet__titulo");
    const meta = folha.querySelector(".app-sheet__meta");
    const acoes = folha.querySelector(".app-sheet__acoes");
    let codigo = folha.querySelector(".app-sheet__codigo");

    let cardAtual = null;

    function criarItem(original) {
        const rotulo = original.getAttribute("aria-label") || original.dataset.tooltip || "";
        // Desabilitado, o tooltip explica o motivo ("Frasco inativo", "Já está em manutenção"...)
        const motivo = original.disabled && original.dataset.tooltip !== rotulo ? original.dataset.tooltip : "";

        const item = document.createElement("button");
        item.type = "button";
        item.className = "app-sheet__acao";
        item.disabled = original.disabled;

        if (original.classList.contains("card__action--red")) item.classList.add("app-sheet__acao--red");
        if (original.classList.contains("card__action--green")) item.classList.add("app-sheet__acao--green");

        item.innerHTML = `
            <span class="app-sheet__acao-icone"></span>
            <span class="app-sheet__acao-texto">
                <span class="app-sheet__acao-rotulo"></span>
                <span class="app-sheet__acao-motivo"></span>
            </span>
        `;

        const icone = original.querySelector("svg");
        if (icone) item.querySelector(".app-sheet__acao-icone").appendChild(icone.cloneNode(true));

        item.querySelector(".app-sheet__acao-rotulo").textContent = rotulo;
        item.querySelector(".app-sheet__acao-motivo").textContent = motivo || "";

        item.addEventListener("click", () => {
            fechar();
            original.click();
        });

        return item;
    }

    function abrir(card) {
        cardAtual = card;

        titulo.textContent = card.querySelector(".card__title")?.textContent.trim() || "";

        meta.replaceChildren(document.createTextNode(card.querySelector(".card__meta")?.textContent.trim() || ""));
        const status = card.querySelector(".status-pill");
        if (status) meta.appendChild(status.cloneNode(true));

        // Mesmo selo do card, com a borda na cor do status
        const codigoCard = card.querySelector(".card__code");
        const novoCodigo = codigoCard ? codigoCard.cloneNode(true) : document.createElement("span");
        novoCodigo.classList.add("app-sheet__codigo");
        codigo.replaceWith(novoCodigo);
        codigo = novoCodigo;

        // Editar e apagar/inativar (cabeçalho do card) + as 3 do rodapé.
        // Destrutivas por último, longe do polegar.
        const originais = Array.from(card.querySelectorAll(".card__header-actions .card__action, .card__actions .card__action"));
        originais.sort((a, b) => a.classList.contains("card__action--red") - b.classList.contains("card__action--red"));

        acoes.replaceChildren(...originais.map(criarItem));

        folha.style.removeProperty("--sheet-arraste");
        overlay.classList.add("is-open");
        folha.classList.add("is-open");

        acoes.querySelector(".app-sheet__acao:not(:disabled)")?.focus({ preventScroll: true });
    }

    function fechar() {
        if (!folha.classList.contains("is-open")) return;

        overlay.classList.remove("is-open");
        folha.classList.remove("is-open");

        cardAtual?.focus({ preventScroll: true });
        cardAtual = null;
    }

    // Cards viram "botões" só no layout de celular (foco pelo teclado/leitor de tela)
    function atualizarCards() {
        grid.querySelectorAll(".card").forEach((card) => {
            if (APP_MOBILE_MQ.matches) {
                card.setAttribute("tabindex", "0");
                card.setAttribute("role", "button");
                card.setAttribute("aria-haspopup", "dialog");
            } else {
                card.removeAttribute("tabindex");
                card.removeAttribute("role");
                card.removeAttribute("aria-haspopup");
            }
        });

        if (!APP_MOBILE_MQ.matches) fechar();
    }

    atualizarCards();
    APP_MOBILE_MQ.addEventListener("change", atualizarCards);

    grid.addEventListener("click", (event) => {
        if (!APP_MOBILE_MQ.matches) return;

        const card = event.target.closest(".card");
        if (card) abrir(card);
    });

    grid.addEventListener("keydown", (event) => {
        if (!APP_MOBILE_MQ.matches || (event.key !== "Enter" && event.key !== " ")) return;

        const card = event.target.closest(".card");
        if (card && event.target === card) {
            event.preventDefault();
            abrir(card);
        }
    });

    overlay.addEventListener("click", fechar);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") fechar();
    });

    // Arrastar pra baixo pelo topo da folha (alça + cabeçalho) fecha
    const areaArraste = [folha.querySelector(".app-sheet__handle"), folha.querySelector(".app-sheet__header")];
    let inicioY = null;
    let arraste = 0;

    areaArraste.forEach((area) => {
        area.addEventListener("touchstart", (event) => {
            inicioY = event.touches[0].clientY;
            arraste = 0;
            folha.classList.add("is-arrastando");
        }, { passive: true });
    });

    folha.addEventListener("touchmove", (event) => {
        if (inicioY === null) return;

        arraste = Math.max(0, event.touches[0].clientY - inicioY);
        folha.style.setProperty("--sheet-arraste", `${arraste}px`);
    }, { passive: true });

    folha.addEventListener("touchend", () => {
        if (inicioY === null) return;

        inicioY = null;
        folha.classList.remove("is-arrastando");

        if (arraste > 80) {
            fechar();
        } else {
            folha.style.removeProperty("--sheet-arraste");
        }
    });
}

// Header minimizado (barras-ocultas, setupStickyPagination em includes.js):
// tocar na faixa que sobra, ou puxar a alça pra baixo, traz header, toolbar
// e paginação de volta. A próxima descida da lista minimiza de novo.
function setupAlcaHeader() {
    const alca = document.querySelector(".app-header__alca");
    const header = document.querySelector(".app-header");

    if (!alca || !header) return;

    // Puxou mais que isso e soltou: expande. Menos: volta pra faixa.
    const ARRASTE_PRA_EXPANDIR = 40;

    function expandir() {
        document.documentElement.classList.remove("barras-ocultas");
    }

    let inicioY = null;
    let arraste = 0;

    // O click que vem logo depois de soltar um arrasto não conta como toque
    // (senão um arrasto curto, que devia voltar pra faixa, expandia)
    alca.addEventListener("click", () => {
        if (arraste <= 5) expandir();
    });

    alca.addEventListener("pointerdown", (event) => {
        inicioY = event.clientY;
        arraste = 0;
        alca.setPointerCapture(event.pointerId);
        header.classList.add("is-arrastando");
    });

    alca.addEventListener("pointermove", (event) => {
        if (inicioY === null) return;

        // Só pra baixo, e no máximo até o header inteiro aparecer
        arraste = Math.min(Math.max(0, event.clientY - inicioY), header.offsetHeight);
        header.style.setProperty("--header-arraste", `${arraste}px`);
    });

    function soltar() {
        if (inicioY === null) return;

        inicioY = null;
        header.classList.remove("is-arrastando");
        header.style.removeProperty("--header-arraste");

        if (arraste > ARRASTE_PRA_EXPANDIR) expandir();
    }

    alca.addEventListener("pointerup", soltar);
    alca.addEventListener("pointercancel", soltar);
}

/*
    Rodapé de vidro na gaveta de filtros, com "Limpar filtros", enquanto
    houver filtro marcado. Mesma fonte da barra "Filtros ativos": a classe
    has-active que o filters.js (renderActiveFilters) põe nela. O botão só
    aciona o "Limpar filtros" da barra, pra limpeza ser a mesma.
    Último filho do painel de filtros, sticky no fundo da gaveta (que é quem
    rola, ver components/filters.css): no fim da rolagem ele ocupa o próprio
    espaço e não cobre o último filtro.
*/
function setupRodapeFiltros() {
    const painel = document.querySelector(".filters-sidebar-desktop .filter-sidebar");
    const barra = document.querySelector("#activeFiltersBar");
    const limparDaBarra = barra?.querySelector(".filters-clear");

    if (!painel || !barra || !limparDaBarra || !document.body.classList.contains("app-mobile")) return;

    const rodape = document.createElement("div");
    rodape.className = "filters-rodape";
    rodape.hidden = true;
    rodape.innerHTML = `
        <button type="button" class="btn btn-secondary filters-rodape__limpar">
            <i class="icon" data-lucide="rotate-ccw"></i>
            Limpar filtros
        </button>
    `;

    painel.appendChild(rodape);
    if (window.lucide) lucide.createIcons();

    rodape.querySelector("button").addEventListener("click", () => limparDaBarra.click());

    function atualizar() {
        rodape.hidden = !barra.classList.contains("has-active");
    }

    atualizar();
    new MutationObserver(atualizar).observe(barra, { attributes: true, attributeFilter: ["class"] });
}

// Análise de solicitação e cadastros: no celular a toolbar vira a barra
// inferior fixa (css/layout/app-mobile.css), e a altura dela varia com as
// ações (etapa da análise, texto quebrando...). Medida de verdade em
// --barra-inferior-h, que vira o espaço no fim da página - assim a rolagem
// sempre chega no último componente. No desktop a toolbar fica no fluxo e a
// variável não é usada.
function setupAlturaBarraInferior() {
    const barra = document.querySelector(
        "body.analise-solicitacao .analysis-shell > .toolbar, body.app-cadastro .form-shell > .toolbar"
    );

    if (!barra) return;

    function atualizar() {
        document.documentElement.style.setProperty("--barra-inferior-h", `${barra.offsetHeight}px`);
    }

    atualizar();
    new ResizeObserver(atualizar).observe(barra);
}

// Cadastros: o "Cancelar" da toolbar some no celular (o ← do header leva pro
// mesmo painel), mas a confirmação "Cancelar cadastro?" dele (setupCadastro*Cancel
// em js/forms.js) continua valendo - o ← só repassa o clique pro Cancelar
// escondido. Sem Cancelar na página, o ← navega direto.
function setupVoltarCadastro() {
    const voltar = document.querySelector("body.app-cadastro .app-header__voltar");
    const cancelar = document.querySelector("body.app-cadastro .form-shell > .toolbar .toolbar__actions > a.btn-ghost");

    if (!voltar || !cancelar) return;

    voltar.addEventListener("click", (event) => {
        event.preventDefault();
        cancelar.click();
    });
}

/*
    Cadastros no celular: abas (.cadastro-abas[data-select]) no lugar de um
    select - Local no frasco, Tipo e Local na movimentação. O select continua
    no form, escondido, e é quem vai no POST: as abas só escrevem nele e
    disparam o change, então tudo que o js/forms.js e o
    frasco-search-movimentacao.js fazem na troca continua igual (prévia do
    identificador, limpar frascos escolhidos...).
    data-confirmar-se (opcional): seletor que, se existir na página, pede
    confirmação antes de trocar (data-confirmar-texto). Na movimentação:
    trocar com frascos já escolhidos apaga a seleção.
*/
/*
    Troca de aba no cadastro, em vez de trocar seco:
    - o conteúdo antigo (abaixo do topo) vira uma cópia congelada, por cima
      do card, que sai deslizando pro lado contrário da aba escolhida. A
      cópia fica numa camada recortada na caixa do card e com máscara de
      degradê nas laterais: vai se desfazendo ao chegar perto da borda, em
      vez de passar por cima dela;
    - o conteúdo novo (a troca já aplicada) começa invisível e entra com
      fade e um deslize curto do lado da aba, logo depois - sem parecer que
      já estava lá por baixo.
    A cópia leva os ids do original, mas vem depois dele no documento:
    getElementById/querySelector continuam achando o form de verdade.
*/
function trocarComDeslize(form, direcao, aplicar) {
    if (!form || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        aplicar();
        return;
    }

    const pai = form.parentElement;
    pai.querySelectorAll(":scope > .deslize-camada").forEach((camada) => camada.remove());

    const topo = form.querySelector(".cadastro-topo");
    const caixaForm = form.getBoundingClientRect();
    const caixaPai = pai.getBoundingClientRect();
    const corteTopo = topo ? topo.getBoundingClientRect().bottom - caixaForm.top : 0;

    const camada = document.createElement("div");
    camada.className = "deslize-camada";
    camada.setAttribute("aria-hidden", "true");
    camada.inert = true;

    const mascara = "linear-gradient(to right, transparent, #000 16%, #000 84%, transparent)";

    Object.assign(camada.style, {
        position: "absolute",
        left: `${caixaForm.left - caixaPai.left}px`,
        top: `${caixaForm.top - caixaPai.top + corteTopo}px`,
        width: `${caixaForm.width}px`,
        height: `${caixaForm.height - corteTopo}px`,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: "1",
        maskImage: mascara,
        webkitMaskImage: mascara,
    });

    const copia = form.cloneNode(true);

    // cloneNode não leva o valor atual dos campos, só o do HTML
    const camposOriginais = form.querySelectorAll("input, select, textarea");
    copia.querySelectorAll("input, select, textarea").forEach((campo, i) => {
        const original = camposOriginais[i];
        if (!original) return;

        campo.value = original.value;
        if ("checked" in original) campo.checked = original.checked;
    });

    Object.assign(copia.style, {
        position: "absolute",
        left: "0",
        top: `${-corteTopo}px`,
        width: `${caixaForm.width}px`,
        margin: "0",
        background: "transparent",
        borderColor: "transparent",
        boxShadow: "none",
        backdropFilter: "none",
        webkitBackdropFilter: "none",
    });

    const topoCopia = copia.querySelector(".cadastro-topo");
    if (topoCopia) topoCopia.style.visibility = "hidden";

    camada.appendChild(copia);

    if (getComputedStyle(pai).position === "static") pai.style.position = "relative";
    pai.appendChild(camada);

    aplicar();

    const DURACAO_SAIDA = 260;

    copia.animate([
        { opacity: 1, transform: "translateX(0)" },
        { opacity: 0, transform: `translateX(${-direcao * 72}px)` },
    ], {
        duration: DURACAO_SAIDA,
        easing: "cubic-bezier(0.4, 0, 1, 1)",
        fill: "forwards",
    }).finished.then(() => camada.remove(), () => camada.remove());

    // Conteúdo novo. Seções em display:contents (frasco) não têm caixa pra
    // animar: aí vão os campos de dentro
    const alvos = [];

    Array.from(form.children).forEach((filho) => {
        if (filho === topo || filho.type === "hidden") return;

        const display = getComputedStyle(filho).display;

        if (display === "none") return;

        if (display === "contents") {
            alvos.push(...filho.querySelectorAll(".form-group"));
        } else {
            alvos.push(filho);
        }
    });

    // Em sequência, não junto com a saída: o novo só começa quando o antigo
    // já quase sumiu (senão parece um componente se partindo pra dois
    // lados), e em cascata, um campo/seção depois do outro, de cima pra
    // baixo. Vem do mesmo lado pra onde o antigo foi empurrado (carrossel).
    // Só o quadro inicial: termina no estilo do próprio elemento (campo
    // travado do frasco fica em 0.45, não pula pra 1 no fim). offset: 0 é
    // obrigatório - um quadro único sem offset vale como o FINAL, e a
    // animação saía ao contrário (aparecia na hora e depois sumia). fill
    // backwards: invisível durante o atraso.
    alvos.forEach((alvo, i) => {
        alvo.animate([
            { offset: 0, opacity: 0, transform: `translateX(${direcao * 20}px)` },
        ], {
            duration: 380,
            delay: DURACAO_SAIDA - 40 + Math.min(i, 6) * 45,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "backwards",
        });
    });
}

function setupAbasCadastro() {
    document.querySelectorAll(".cadastro-abas[data-select]").forEach((abas) => {
        const select = document.querySelector(abas.dataset.select);

        if (!select) return;

        const indicador = abas.querySelector(".app-tabs__indicator");
        const botoes = Array.from(abas.querySelectorAll("button[data-valor]"));

        function moverIndicador() {
            const ativo = abas.querySelector("button.active");

            if (!ativo) return;

            indicador.style.setProperty("--ind-x", `${ativo.offsetLeft}px`);
            indicador.style.setProperty("--ind-w", `${ativo.offsetWidth}px`);
            indicador.style.setProperty("--ind-trilho", `${abas.scrollWidth}px`);
        }

        function marcar() {
            botoes.forEach((botao) => {
                const ativo = botao.dataset.valor === select.value;
                botao.classList.toggle("active", ativo);
                botao.setAttribute("aria-pressed", String(ativo));
            });

            moverIndicador();
        }

        function trocar(valor) {
            const indiceAntes = botoes.findIndex((botao) => botao.dataset.valor === select.value);
            const indiceDepois = botoes.findIndex((botao) => botao.dataset.valor === valor);

            trocarComDeslize(abas.closest("form"), indiceDepois > indiceAntes ? 1 : -1, () => {
                select.value = valor;
                select.dispatchEvent(new Event("change", { bubbles: true }));
            });
        }

        botoes.forEach((botao) => {
            botao.addEventListener("click", () => {
                const valor = botao.dataset.valor;

                if (select.value === valor) return;

                const precisaConfirmar = abas.dataset.confirmarSe && document.querySelector(abas.dataset.confirmarSe);

                if (!precisaConfirmar || typeof Swal === "undefined") {
                    trocar(valor);
                    return;
                }

                Swal.fire({
                    icon: "warning",
                    title: `Trocar para ${botao.textContent.trim()}?`,
                    text: abas.dataset.confirmarTexto || "",
                    showCancelButton: true,
                    reverseButtons: true,
                    focusCancel: true,
                    confirmButtonText: "Sim, trocar",
                    cancelButtonText: "Cancelar",
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: "btn btn-outline btn-outline-danger",
                        cancelButton: "btn btn-secondary",
                    },
                }).then((result) => {
                    if (result.isConfirmed) trocar(valor);
                });
            });
        });

        select.addEventListener("change", marcar);
        marcar();

        // Escondidas no desktop (largura 0) e a fonte carregando muda a largura dos botões
        const resizeObserver = new ResizeObserver(moverIndicador);
        [abas, ...botoes].forEach((el) => resizeObserver.observe(el));
    });
}

// Cadastro de frasco no celular: interruptor ao lado da Quantidade que
// mostra/esconde Dentição e Arcada/Numeração (classe opcionais-abertos no
// form, css/layout/app-mobile.css). Escondidos, os campos continuam no form.
function setupOpcionaisCadastro() {
    const form = document.querySelector("#cadastroFrascoForm");
    const toggle = document.querySelector("#opcionaisToggle");

    if (!form || !toggle) return;

    // Na edição já abre se algum opcional estiver preenchido
    const codigo = form.querySelector("input[name='codigo']")?.value;
    const isEdicao = codigo && codigo !== "null";

    toggle.checked = Boolean(isEdicao) && ["#denticao", "#arcada", "#numeracaoSelect"].some((seletor) => {
        const valor = form.querySelector(seletor)?.value;
        return valor && valor !== "NAO_INFORMADA";
    });

    function atualizar() {
        form.classList.toggle("opcionais-abertos", toggle.checked);
    }

    toggle.addEventListener("change", atualizar);
    atualizar();
}

/*
    Cadastro de frasco no celular: o campo de data nativo do Chrome do
    Android não deixa digitar (tocar só abre o calendário). Cada data ganha
    um campo de texto com teclado numérico (dd/mm/aaaa) por cima; o nativo
    continua no form, invisível, e é quem vai no POST - o texto só escreve
    nele (com input/change, pra sincronização das datas em js/forms.js
    rodar) e o ícone continua abrindo o calendário dele (showPicker). No
    desktop o campo de texto fica escondido (css/layout/app-mobile.css).
*/
function setupDatasDigitaveis() {
    const form = document.querySelector("#cadastroFrascoForm");

    if (!form) return;

    const pares = Array.from(form.querySelectorAll(".date-wrapper input[type='date']")).map((data) => {
        const texto = document.createElement("input");
        texto.type = "text";
        texto.inputMode = "numeric";
        texto.autocomplete = "off";
        texto.placeholder = "dd/mm/aaaa";
        texto.maxLength = 10;
        texto.className = "form-control data-texto";
        texto.setAttribute("aria-label", data.closest(".form-group")?.querySelector(".rotulo-longo")?.textContent || "Data");

        data.before(texto);
        return { data, texto };
    });

    if (!pares.length) return;

    // aaaa-mm-dd -> dd/mm/aaaa
    function paraTexto(valor) {
        const [ano, mes, dia] = valor.split("-");
        return valor ? `${dia}/${mes}/${ano}` : "";
    }

    function sincronizarTextos() {
        pares.forEach(({ data, texto }) => {
            texto.disabled = data.disabled;

            // Não reescreve o que a pessoa está digitando
            if (document.activeElement !== texto) texto.value = paraTexto(data.value);
        });
    }

    // Digitando (não apagando): dia que começa com 4-9 e mês com 2-9 só podem
    // ser 0X - o zero entra sozinho; e a barra já aparece depois de dia/mês
    function completarDigitos(digitos) {
        let d = digitos;

        if (d.length >= 1 && Number(d[0]) > 3) d = `0${d}`;
        if (d.length >= 3 && Number(d[2]) > 1) d = `${d.slice(0, 2)}0${d.slice(2)}`;

        return d.slice(0, 8);
    }

    pares.forEach(({ data, texto }) => {
        // Primeira tecla depois de tocar no campo começa uma data nova (sem
        // precisar selecionar e apagar a anterior); apagar limpa tudo
        let recomecar = false;

        texto.addEventListener("focus", () => {
            recomecar = true;
        });

        texto.addEventListener("beforeinput", (event) => {
            if (!recomecar) return;

            recomecar = false;

            if (event.inputType.startsWith("delete")) {
                event.preventDefault();
                texto.value = "";
                texto.dispatchEvent(new InputEvent("input", { inputType: "deleteContentBackward" }));
            } else if (event.inputType === "insertText" && event.data) {
                event.preventDefault();
                texto.value = event.data;
                texto.dispatchEvent(new InputEvent("input", { inputType: "insertText", data: event.data }));
            }
        });

        texto.addEventListener("input", (event) => {
            const inserindo = event.inputType?.startsWith("insert");

            let digitos = texto.value.replace(/\D/g, "").slice(0, 8);
            if (inserindo) digitos = completarDigitos(digitos);

            texto.value = [digitos.slice(0, 2), digitos.slice(2, 4), digitos.slice(4)].filter(Boolean).join("/");

            if (inserindo && (digitos.length === 2 || digitos.length === 4)) texto.value += "/";

            let novoValor = "";

            if (digitos.length === 8) {
                const [dia, mes, ano] = [digitos.slice(0, 2), digitos.slice(2, 4), digitos.slice(4)];
                const teste = new Date(Number(ano), Number(mes) - 1, Number(dia));
                const valida = teste.getFullYear() === Number(ano) && teste.getMonth() === Number(mes) - 1 && teste.getDate() === Number(dia);

                if (valida) novoValor = `${ano}-${mes}-${dia}`;
            }

            if (data.value === novoValor) return;

            data.value = novoValor;
            data.dispatchEvent(new Event("input", { bubbles: true }));
            data.dispatchEvent(new Event("change", { bubbles: true }));
        });

        // Saiu com a data incompleta/inválida: volta pro valor que vale (o do nativo)
        texto.addEventListener("blur", sincronizarTextos);

        // Validação do form foca o primeiro campo inválido, que no celular é o nativo invisível
        data.addEventListener("focus", () => {
            if (APP_MOBILE_MQ.matches) texto.focus();
        });

        // disabled muda pelo js/forms.js ao escolher o grupo
        new MutationObserver(sincronizarTextos).observe(data, { attributes: true, attributeFilter: ["disabled"] });
    });

    // Calendário, ou uma data mudando a outra (setupSincronizacaoDatas em js/forms.js)
    form.addEventListener("change", sincronizarTextos);
    sincronizarTextos();
}

// Cadastros: marca com .is-pendente (destaque no celular,
// css/layout/app-mobile.css) os campos obrigatórios liberados e ainda sem
// valor. Acompanha a liberação que os scripts do form fazem: recalcula depois
// de cada change (que chega aqui no form depois dos listeners dos próprios
// campos) e quando disabled/required/hidden mudam direto, sem evento (ex.:
// Observações e Origem na movimentação, liberadas pelo
// frasco-search-movimentacao.js ao escolher frasco).
// "Não informada" (padrão do Estado ao escolher o grupo) conta como sem
// valor até a pessoa mexer no campo - escolher ela de propósito vale.
// Quantidade (não obrigatória, já vem com 1) entra depois do Estado: fica
// destacada até a pessoa mexer nela.
function setupDestaquePendentes() {
    const form = document.querySelector("body.app-cadastro form.form-card");

    if (!form) return;

    const campos = Array.from(form.querySelectorAll(".form-group .form-control"));
    const estadoDente = form.querySelector("#estadoDente");
    const quantidade = form.querySelector("#quantidade");
    const codigo = form.querySelector("input[name='codigo']")?.value;
    const isEdicao = Boolean(codigo) && codigo !== "null";
    const tocados = new Set(isEdicao ? campos : []);

    // Movimentação (frasco-search-movimentacao.js). Ordem do destaque:
    // Escolher Frasco(s) -> [Entrada] Origem -> "+" dos frascos de origem ou
    // Quantidade de dentes (Doação/Outros) -> Observações
    const escolherFrascosBtn = form.querySelector("#escolherFrascosBtn");
    const frascosVazio = form.querySelector("#selectedFlasksEmpty");
    const origemDentes = form.querySelector("#origemDentes");
    const quantidadeDoacao = form.querySelector("#quantidadeDoacao");
    const frascosOrigemSection = form.querySelector("#frascosOrigemSection");
    const selecionarOrigemBtn = form.querySelector("#selecionarFrascosOrigemBtn");
    const origemVazio = form.querySelector("#origemFrascosEmpty");
    const observacoes = form.querySelector("#observacoesMovimentacao");

    // Saída (Origem travada) não tem etapa de origem; na Entrada ela só
    // fecha com frasco de origem escolhido ou a quantidade da doação mexida
    function origemCompleta() {
        if (!origemDentes || origemDentes.disabled) return true;
        if (origemDentes.value === "frascos") return Boolean(origemVazio?.hidden);
        if (origemDentes.value === "doacao") return tocados.has(quantidadeDoacao);
        return false;
    }

    function semValor(campo) {
        return campo.value === "" || (campo.value === "NAO_INFORMADA" && !tocados.has(campo));
    }

    function pendente(campo) {
        if (campo.disabled) return false;

        if (campo === quantidade) {
            const estadoPendente = estadoDente && estadoDente.required && !estadoDente.disabled && semValor(estadoDente);
            return !tocados.has(quantidade) && !estadoPendente;
        }

        // Já vem com 1, como a Quantidade do frasco: destacada até mexer
        if (campo === quantidadeDoacao) return !tocados.has(quantidadeDoacao);

        if (campo === observacoes && !origemCompleta()) return false;

        return campo.required && semValor(campo);
    }

    // Botões que fazem parte do fluxo (escolher frascos): o destaque é o
    // vidro azul (css/layout/app-mobile.css), não o do campo
    const botoes = [
        {
            botao: escolherFrascosBtn,
            pendente: () => !escolherFrascosBtn.disabled && !frascosVazio?.hidden,
        },
        {
            botao: selecionarOrigemBtn,
            pendente: () => !frascosOrigemSection?.hidden && !origemVazio?.hidden,
        },
    ].filter(({ botao }) => botao);

    function atualizar() {
        campos.forEach((campo) => {
            campo.closest(".form-group").classList.toggle("is-pendente", pendente(campo));
        });

        botoes.forEach(({ botao, pendente: estaPendente }) => {
            botao.classList.toggle("is-pendente", estaPendente());
        });
    }

    // Os botões +/- disparam input sintético (setupNumberInputs, js/forms.js),
    // então pras quantidades qualquer input conta como mexer
    [quantidade, quantidadeDoacao].forEach((campo) => {
        campo?.addEventListener("input", () => tocados.add(campo));
    });

    form.addEventListener("change", (event) => {
        // Só mudança feita pela pessoa (as abas de Local disparam um change sintético)
        if (event.isTrusted) tocados.add(event.target);

        // Trocar o Grupo no cadastro volta o Estado pra "Não informada" (js/forms.js)
        if (event.target.id === "tipoDente" && !isEdicao) tocados.delete(estadoDente);

        // Trocar Tipo ou Origem volta a quantidade da doação pra 1 (frasco-search-movimentacao.js)
        if (event.target === origemDentes || event.target.id === "tipoMovimentacao") tocados.delete(quantidadeDoacao);

        atualizar();
    });

    form.addEventListener("input", atualizar);

    // Só esses atributos: o toggle de .is-pendente (class) não realimenta
    new MutationObserver(atualizar).observe(form, {
        subtree: true,
        attributes: true,
        attributeFilter: ["disabled", "required", "hidden"],
    });

    atualizar();
}

/*
    Modais de busca de frasco da movimentação (saída, entrada, outros
    frascos): no celular todos os filtros ficam atrás do ícone de filtro ao
    lado da busca. A fileira de Status/Ordenar (sempre visível no desktop)
    entra no recolhível de Grupo/Estado/Dentição; o modal de outros frascos,
    que não tinha ícone nem recolhível, ganha os dois (--app, escondidos fora
    do celular). Voltando pro desktop a fileira volta pro lugar.
    O ponto do ícone ("tem filtro ativo") no js/frasco-search-movimentacao.js
    só olha Grupo/Estado/Dentição; aqui ele passa a contar também o Status
    diferente de "Todos" quando está escondido. Este listener é registrado
    depois do de lá, então a palavra final é daqui.
*/
function setupFiltrosModaisMovimentacao() {
    const overlays = document.querySelectorAll(".modal-overlay[id^='modalBuscaFrascoMovimentacao']");

    overlays.forEach((overlay) => {
        const corpoFixo = overlay.querySelector(".modal__body-fixed");
        const fileiraSempreVisivel = corpoFixo?.querySelector(":scope > .modal-filters");

        if (!corpoFixo || !fileiraSempreVisivel) return;

        let toggle = overlay.querySelector(".modal-filter-toggle");
        let recolhivel = overlay.querySelector(".modal-filters-collapse");

        if (!toggle || !recolhivel) {
            const busca = corpoFixo.querySelector(".modal-search");
            const linhaBusca = document.createElement("div");
            linhaBusca.className = "modal-search-row";
            busca.before(linhaBusca);
            linhaBusca.appendChild(busca);

            toggle = document.createElement("button");
            toggle.type = "button";
            toggle.className = "modal-filter-toggle modal-filter-toggle--app";
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Mostrar filtros");
            toggle.innerHTML = `
                <i class="icon" data-lucide="filter"></i>
                <span class="modal-filter-toggle__dot" hidden></span>
            `;
            linhaBusca.appendChild(toggle);

            recolhivel = document.createElement("div");
            recolhivel.className = "modal-filters-collapse modal-filters-collapse--app";
            recolhivel.innerHTML = `<div class="modal-filters-collapse__inner"></div>`;
            linhaBusca.after(recolhivel);

            toggle.addEventListener("click", () => {
                const aberto = recolhivel.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", String(aberto));
                toggle.setAttribute("aria-label", aberto ? "Ocultar filtros" : "Mostrar filtros");
            });

            if (window.lucide) lucide.createIcons();
        }

        const interior = recolhivel.querySelector(".modal-filters-collapse__inner");
        const ponto = toggle.querySelector(".modal-filter-toggle__dot");
        const status = fileiraSempreVisivel.querySelector("select[id*='Status']");
        const filtrosDoFrasco = Array.from(interior.querySelectorAll("select"));

        function atualizarPonto() {
            if (!ponto) return;

            const frascoAtivo = filtrosDoFrasco.some((select) => select.value);
            const statusAtivo = APP_MOBILE_MQ.matches && status && status.value !== "todos";

            ponto.hidden = !(frascoAtivo || statusAtivo);
        }

        function posicionar() {
            if (APP_MOBILE_MQ.matches) {
                interior.appendChild(fileiraSempreVisivel);
            } else {
                corpoFixo.appendChild(fileiraSempreVisivel);
            }

            atualizarPonto();
        }

        [...filtrosDoFrasco, status].forEach((select) => select?.addEventListener("change", atualizarPonto));

        posicionar();
        APP_MOBILE_MQ.addEventListener("change", posicionar);
    });
}

// Movimentação no celular: ao fechar um modal de busca de frasco, rola até o
// próximo passo do fluxo de Entrada/Saída - o primeiro destaque de pendente
// (.is-pendente, setupDestaquePendentes) na ordem da página - centralizado.
// A espera deixa o modal sair e o destaque se recalcular com a escolha feita.
function setupRolagemAposModal() {
    const form = document.querySelector("#cadastroMovimentacaoForm");

    if (!form) return;

    function rolarParaPendente() {
        const alvo = Array.from(form.querySelectorAll(".is-pendente")).find((el) => el.getClientRects().length > 0);

        if (!alvo) return;

        const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        alvo.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "center" });
    }

    document.querySelectorAll(".modal-busca-movimentacao").forEach((overlay) => {
        let aberto = overlay.classList.contains("is-open");

        new MutationObserver(() => {
            const agora = overlay.classList.contains("is-open");

            if (aberto && !agora && APP_MOBILE_MQ.matches) setTimeout(rolarParaPendente, 250);

            aberto = agora;
        }).observe(overlay, { attributes: true, attributeFilter: ["class"] });
    });
}

setupPerfilMenu();
setupFolhaAcoesCard();
setupAlcaHeader();
setupRodapeFiltros();
setupAlturaBarraInferior();
setupVoltarCadastro();
setupAbasCadastro();
setupOpcionaisCadastro();
setupDatasDigitaveis();
setupDestaquePendentes();
setupFiltrosModaisMovimentacao();
setupRolagemAposModal();
