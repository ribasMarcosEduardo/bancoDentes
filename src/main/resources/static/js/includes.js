function applyTheme(theme) {
    // <html> (não só <body>) recebe a classe porque é nela que o script
    // inline no <head> de cada página já aplica o tema salvo antes da
    // primeira renderização (evita o flash de tema errado ao navegar) —
    // as duas fontes (inline no <head> e aqui) precisam concordar.
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);

    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
}

const THEME_ICON_PATHS = {
    moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"></path>',
    sun: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>',
};

function setupThemeToggle() {
    // Hoje existem dois botões (navbar de desktop + menu hambúrguer no
    // mobile), ambos com essa classe, mantidos em sincronia.
    const toggles = document.querySelectorAll(".theme-toggle-btn");

    if (!toggles.length) return;

    // Ícone montado à mão (sem data-lucide): lucide.createIcons() é chamado
    // em outros pontos da página (ex.: filters.js a cada chip criado) e ele
    // reprocessa QUALQUER elemento com data-lucide, mesmo já renderizado —
    // isso trocava o nó no meio da animação e cancelava o "animationend".
    function createThemeIcon(theme, extraClass) {
        const iconName = theme === "dark" ? "sun" : "moon";
        const wrapper = document.createElement("div");

        wrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icon theme-toggle-icon${extraClass ? " " + extraClass : ""}">${THEME_ICON_PATHS[iconName]}</svg>`;

        return wrapper.firstElementChild;
    }

    function renderIcon(toggle, theme, { animate = false } = {}) {
        // Navbar de desktop e menu mobile escondem um dos dois botões
        // via display:none conforme a largura da tela — CSS animation
        // não roda em elemento display:none, então o "animationend" do
        // ícone antigo nunca dispara e ele fica pra sempre no DOM. Na
        // próxima vez que esse botão aparecer (ex.: redimensionou a
        // janela), o ícone velho some junto com o novo — o "fantasma".
        // Pra quem está escondido, troca na hora, sem animação, pra
        // nunca deixar esse resto grudado.
        const isVisible = toggle.getClientRects().length > 0;

        if (!animate || !isVisible) {
            toggle.innerHTML = "";
            toggle.appendChild(createThemeIcon(theme));
            return;
        }

        // querySelector (singular) só pega o primeiro ícone antigo — se o
        // botão for clicado de novo antes da animação de 0.35s acabar, o
        // ícone anterior (que ainda nem virou "antigo" de verdade) ficava
        // pra trás sem ninguém programado pra tirar ele, empilhando um
        // "fantasma" atrás do ícone atual. Marcando TODOS os que sobraram
        // pra sair, cada um se remove sozinho quando terminar sua própria
        // animação, não importa quantos cliques rápidos aconteçam.
        const oldIcons = toggle.querySelectorAll(".theme-toggle-icon");

        oldIcons.forEach((oldIcon) => {
            oldIcon.classList.remove("theme-toggle-icon--enter");
            oldIcon.classList.add("theme-toggle-icon--exit");
            oldIcon.addEventListener("animationend", () => oldIcon.remove(), { once: true });
        });

        const newIcon = createThemeIcon(theme, "theme-toggle-icon--enter");
        toggle.appendChild(newIcon);

        newIcon.addEventListener(
            "animationend",
            () => newIcon.classList.remove("theme-toggle-icon--enter"),
            { once: true }
        );
    }

    function setTheme(theme, options) {
        applyTheme(theme);
        localStorage.setItem("theme", theme);
        toggles.forEach((toggle) => renderIcon(toggle, theme, options));
    }

    // Sem escolha salva ainda, cai na preferência do SO/navegador em vez
    // de sempre nascer clara — mesmo fallback do script inline no <head>
    // de cada página (ver applyTheme acima).
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme") || (prefersDark ? "dark" : "light");
    setTheme(savedTheme);

    toggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
            const isDark = document.body.classList.contains("dark");
            const newTheme = isDark ? "light" : "dark";

            setTheme(newTheme, { animate: true });
        });
    });
}

async function loadIncludes() {
    const includes = document.querySelectorAll("[data-include]");

    for (const element of includes) {
        const file = element.getAttribute("data-include");
        const response = await fetch(file);

        if (response.ok) {
            element.innerHTML = await response.text();
        } else {
            element.innerHTML = "Erro ao carregar componente.";
        }
    }

    lucide.createIcons();
    setupMobileMenu();
    setupThemeToggle();
    setupNavbarDropdowns();
    setupNavbarHeight();
    setupStickyPagination();
    setupScrollToTopButton();

    // setupFrascoSearchModal só existe nas páginas que carregam
    // frasco-search-solicitacao.js ou frasco-search-movimentacao.js (o
    // modal em si só chega ao DOM depois do fetch acima, então precisa
    // rodar por aqui, junto dos outros setups pós-include) — typeof
    // evita ReferenceError nas páginas sem o modal. Os dois arquivos
    // usam o mesmo nome de função de propósito: cada página carrega só
    // um deles, então nunca colidem.
    if (typeof setupFrascoSearchModal === "function") {
        setupFrascoSearchModal();
    }
}

function setupNavbarDropdowns() {
    const dropdowns = document.querySelectorAll(".navbar__dropdown");

    if (!dropdowns.length) return;

    let pinned = null;

    function closeAll(except) {
        dropdowns.forEach((dropdown) => {
            if (dropdown !== except) {
                dropdown.classList.remove("is-open");
            }
        });
    }

    dropdowns.forEach((dropdown) => {
        const btn = dropdown.querySelector(".navbar__dropdown-btn");

        dropdown.addEventListener("mouseenter", () => {
            closeAll(dropdown);
            dropdown.classList.add("is-open");
        });

        dropdown.addEventListener("mouseleave", () => {
            if (pinned !== dropdown) {
                dropdown.classList.remove("is-open");
            }
        });

        // Abre ao focar pelo teclado e fecha quando o foco sai do
        // dropdown inteiro (botão + itens) - necessário pro "Frascos",
        // que é link e navega no clique em vez de abrir o menu.
        // Só nos menus de navegação (o de notificações continua abrindo
        // no clique).
        if (dropdown.closest(".navbar__nav")) {
            dropdown.addEventListener("focusin", () => {
                closeAll(dropdown);
                dropdown.classList.add("is-open");
            });

            dropdown.addEventListener("focusout", (event) => {
                if (!dropdown.contains(event.relatedTarget) && pinned !== dropdown) {
                    dropdown.classList.remove("is-open");
                }
            });
        }

        btn.addEventListener("click", (event) => {
            // Link (Frascos): segue a navegação normalmente
            if (btn.tagName === "A") return;

            event.stopPropagation();

            const wasPinned = pinned === dropdown;

            closeAll(null);
            pinned = null;

            if (!wasPinned) {
                dropdown.classList.add("is-open");
                pinned = dropdown;
            }
        });
    });

    document.addEventListener("click", () => {
        closeAll(null);
        pinned = null;
    });
}

function setupMobileMenu() {
    const overlay = document.querySelector(".mobile-menu-overlay");

    if (!overlay) return;

    const drawers = [
        {
            openBtn: document.querySelector(".mobile-menu-toggle"),
            closeBtn: document.querySelector(".mobile-menu__close"),
            panel: document.querySelector(".mobile-menu"),
        },
        {
            openBtn: document.querySelector(".toolbar__filter-toggle"),
            closeBtn: document.querySelector(".filters-mobile-close"),
            panel: document.querySelector(".filters-sidebar-desktop"),
        },
    ].filter((drawer) => drawer.openBtn && drawer.panel);

    function closeAll() {
        drawers.forEach((drawer) => drawer.panel.classList.remove("is-open"));
        overlay.classList.remove("is-open");
    }

    function open(panel) {
        closeAll();
        panel.classList.add("is-open");
        overlay.classList.add("is-open");
    }

    drawers.forEach((drawer) => {
        drawer.openBtn.addEventListener("click", () => open(drawer.panel));

        if (drawer.closeBtn) {
            drawer.closeBtn.addEventListener("click", closeAll);
        }
    });

    overlay.addEventListener("click", closeAll);
}

function setupNavbarHeight() {
    // A navbar é sticky (top:0) e fica por cima de tudo, então quem
    // também gruda no topo (.toolbar, ver components/toolbar.css) precisa
    // começar abaixo dela. A altura varia (quebra em 2 linhas entre
    // ~1150px e 1000px, display:none abaixo disso), então mede de
    // verdade e expõe em --navbar-height. Escondida, offsetHeight é 0.
    // No celular, nas páginas com o layout de app, quem fica no topo é o
    // .app-header (partials/app_mobile.html) - vale a que estiver visível.
    const barras = [".navbar", ".app-header"]
        .map((seletor) => document.querySelector(seletor))
        .filter(Boolean);

    if (!barras.length) return;

    function update() {
        const altura = Math.max(...barras.map((barra) => barra.offsetHeight));
        document.documentElement.style.setProperty("--navbar-height", `${altura}px`);
    }

    update();
    const resizeObserver = new ResizeObserver(update);
    barras.forEach((barra) => resizeObserver.observe(barra));
}

// Distância do topo da tela em que a .toolbar gruda — lida do CSS
// (navbar + 1rem, ver components/toolbar.css) em vez de fixa aqui.
function getToolbarStickyTop(toolbar) {
    return parseFloat(getComputedStyle(toolbar).top) || 0;
}

// Posição normal (sem o efeito sticky) de um elemento position:sticky, a
// partir do topo da página. Não dá pra usar o offsetTop direto: no Chrome
// (e no Samsung Internet) ele já vem com o deslocamento do "grudar", então
// grudado ele acompanha o scroll, e "scrollY >= offsetTop - top" ficava no
// limite, virando a cada evento - no celular, com scroll fracionário, as
// barras piscavam ao rolar devagar. Mede com o sticky desligado por um
// instante; soma os offsetTop dos pais (ignoram transform, então a
// animação de esconder não atrapalha). Custa um reflow: guardar o
// resultado e refazer só quando algo muda de tamanho.
function getTopoNatural(el) {
    const posicao = el.style.position;
    el.style.position = "static";

    let topo = 0;
    for (let atual = el; atual; atual = atual.offsetParent) {
        topo += atual.offsetTop;
    }

    el.style.position = posicao;
    return topo;
}

function setupStickyPagination() {
    // .pagination (setas + sector-switch + texto "X encontradas") fica
    // sticky logo abaixo da .toolbar (também sticky) — ver .pagination
    // em components/pagination.css. A altura da toolbar varia muito
    // entre páginas e larguras, então em vez de chutar um valor fixo,
    // mede de verdade e mantém em dia com ResizeObserver.
    //
    // Só as setas/sector-switch devem parecer "grudados" — o texto "X
    // encontradas" some nessa hora (classe is-stuck, ver pagination.css)
    // pra sobrar só os controles.
    const toolbar = document.querySelector(".toolbar");
    const pagination = document.querySelector(".pagination");

    if (!toolbar || !pagination) return;

    let stickyTop = 0;

    // Espaço entre a toolbar e a pagination: gap de .main-panel (1.5rem)
    // + margin-top do .list-panel (negativa em telas baixas, ver
    // layout/page.css). Lido do CSS computado em vez de fixo pra
    // acompanhar a media query; 24px (1.5rem) se não der pra medir.
    function gapBelowToolbar() {
        const gap = parseFloat(getComputedStyle(toolbar.parentElement).rowGap);
        const margin = parseFloat(getComputedStyle(pagination.parentElement).marginTop) || 0;
        return (Number.isNaN(gap) ? 24 : gap) + margin;
    }

    // Posições normais (sem sticky) da toolbar e da pagination, guardadas
    // (ver getTopoNatural) e refeitas em updateOffset
    let topoToolbar = 0;
    let topoPagination = 0;

    function updateOffset() {
        // Toolbar que rola com a página (Histórico de Solicitações no
        // celular): a paginação gruda no lugar dela (o mesmo top do
        // sticky de toolbar.css, navbar + 1rem), não abaixo
        const raiz = getComputedStyle(document.documentElement);
        const toolbarGruda = getComputedStyle(toolbar).position === "sticky";

        stickyTop = toolbarGruda
            ? getToolbarStickyTop(toolbar) + toolbar.offsetHeight + gapBelowToolbar()
            : (parseFloat(raiz.getPropertyValue("--navbar-height")) || 0) + parseFloat(raiz.fontSize);
        pagination.style.setProperty("--pagination-sticky-top", `${stickyTop}px`);

        topoToolbar = getTopoNatural(toolbar);
        topoPagination = getTopoNatural(pagination);
    }

    function updateStuckState() {
        const isStuck = window.scrollY >= topoPagination - stickyTop;
        pagination.classList.toggle("is-stuck", isStuck);
    }

    updateOffset();
    updateStuckState();

    // Troca de página com a lista rolada (filters.js): volta até um pouco antes
    // de a paginação grudar - grudada, o texto "X encontrados" some (is-stuck);
    // a folga é o mesmo espaço entre a toolbar e ela. Lista ainda no começo:
    // não mexe. behavior explícito ganha do CSS, então o movimento reduzido é
    // checado aqui.
    window.rolarParaInicioDaLista = () => {
        // Mínimo de 16px: em telas baixas a margem negativa do .list-panel
        // encolhe o gap e a paginação continuaria grudada
        const alvo = Math.max(0, topoPagination - stickyTop - Math.max(gapBelowToolbar(), 16));
        if (window.scrollY <= alvo + 1) return;

        const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: alvo, behavior: reduzido ? "auto" : "smooth" });
    };

    // Observa a navbar também: a altura dela muda o top da toolbar. E o
    // .main-panel: o que entra acima da pagination (ex.: barra de filtros
    // ativos) muda a posição normal dela.
    const resizeObserver = new ResizeObserver(() => {
        updateOffset();
        updateStuckState();
    });
    resizeObserver.observe(toolbar);
    resizeObserver.observe(toolbar.parentElement);

    document.querySelectorAll(".navbar, .app-header").forEach((barra) => resizeObserver.observe(barra));

    window.addEventListener("scroll", updateStuckState, { passive: true });

    // Como em apps de feed: rolando pra baixo com a paginação grudada, toolbar
    // e paginação somem; qualquer rolagem pra cima as traz de volta. Não some
    // com a busca/um select da toolbar em uso.
    let ultimoY = window.scrollY;
    let descidaAcumulada = 0;
    let subidaAcumulada = 0;

    // No celular a barra de endereço do navegador aparece/some ao rolar e muda
    // innerHeight (e mexe no scroll sem o usuário rolar). Os limites abaixo
    // usam a altura da abertura - refeita só ao girar o aparelho - e as
    // mudanças de altura no meio da rolagem são ignoradas (atualizarBarrasOcultas).
    let alturaBase = window.innerHeight;
    let ultimaAltura = window.innerHeight;
    window.addEventListener("orientationchange", () => {
        setTimeout(() => {
            alturaBase = window.innerHeight;
        }, 300);
    });

    // Posição normal guardada (topoToolbar), não o offsetTop, que grudado
    // acompanha o scroll (ver getTopoNatural)
    const toolbarGrudada = () => window.scrollY >= topoToolbar - getToolbarStickyTop(toolbar);

    // Desktop só esconde depois de descer ~30% da tela com a toolbar já grudada
    // (2-3 voltas da rodinha, que rola ~100px cada): o início do sticky não é
    // brusco. No toque segue imediato.
    const limiarDescida = () => window.matchMedia("(pointer: fine)").matches ? alturaBase * 0.3 : 0;

    // Pra mostrar de novo: no mouse, qualquer rolagem pra cima; no toque, ~40px
    // de subida acumulada - pequenas voltas no meio do arrasto do dedo faziam
    // as barras piscarem (aparece, some, aparece)
    const limiarSubida = () => window.matchMedia("(pointer: fine)").matches ? 0 : 40;

    // No layout de app do celular (css/layout/app-mobile.css) a toolbar já
    // nasce grudada no header: sem um piso, o header minimizava logo no
    // começo da lista e deixava o topo vazio. Só minimiza passando de ~20%
    // da tela rolados.
    const inicioMinimo = () =>
        document.body.classList.contains("app-mobile") && window.matchMedia("(max-width: 600px)").matches
            ? alturaBase * 0.2
            : 0;

    function atualizarBarrasOcultas() {
        const y = window.scrollY;

        // Barra de endereço do navegador mudando a altura da tela: o scroll
        // que vem junto não é do usuário
        if (window.innerHeight !== ultimaAltura) {
            ultimaAltura = window.innerHeight;
            ultimoY = y;
            return;
        }

        // Efeito elástico nas pontas (iOS): a página passa do limite e volta
        // sozinha - a volta parecia rolagem pra cima e mostrava as barras
        const maxY = document.documentElement.scrollHeight - window.innerHeight;
        if (y < 0 || y > maxY) return;

        const delta = y - ultimoY;
        if (Math.abs(delta) < 6) return;
        ultimoY = y;

        // Salto maior que a tela = reposicionamento (ex.: rolagem restaurada
        // depois de uma ação), não rolagem do usuário
        if (Math.abs(delta) > window.innerHeight) {
            descidaAcumulada = 0;
            subidaAcumulada = 0;
            return;
        }

        const raiz = document.documentElement;

        // Rolagem do usuário: acaba a exceção do header expandido da abertura
        // já rolada (header-aberto, ver css/layout/app-mobile.css)
        raiz.classList.remove("header-aberto");
        const ativo = document.activeElement;
        const editando = toolbar.contains(ativo) && ativo.matches("input, select, textarea");

        if (!toolbarGrudada() || y < inicioMinimo() || editando) {
            descidaAcumulada = 0;
            subidaAcumulada = 0;
            raiz.classList.remove("barras-ocultas");
            return;
        }

        if (delta < 0) {
            descidaAcumulada = 0;
            subidaAcumulada -= delta;
            if (subidaAcumulada > limiarSubida()) raiz.classList.remove("barras-ocultas");
            return;
        }

        subidaAcumulada = 0;
        descidaAcumulada += delta;
        if (descidaAcumulada > limiarDescida()) raiz.classList.add("barras-ocultas");
    }

    window.addEventListener("scroll", atualizarBarrasOcultas, { passive: true });

    // Abertura já focada num trecho (ex.: "Ver movimentações" de um frasco):
    // a página já aparece cortada logo acima dele, sem rolar na frente do
    // usuário. requestAnimationFrame roda depois de todos os scripts do fim do
    // <body> (filtros e paginação já aplicados, então a altura final da página
    // já vale) e antes do 1º quadro - a pintura fica segura até lá pelo
    // <link rel="expect" blocking="render"> dos painéis. A cascata de entrada
    // da lista (animarEntradaResultados, filters.js) vem no quadro seguinte.
    // Toolbar e paginação já nascem escondidas (script no <head> da página).
    const rolarPara = document.querySelector("[data-rolar-ao-abrir]");
    if (rolarPara) {
        requestAnimationFrame(() => {
            // O que fica por cima: a navbar (desktop/tablet) ou, no celular, a
            // faixa do header minimizado. getBoundingClientRect já considera o
            // header recolhido; o que está escondido mede 0.
            const topo = Math.max(
                0,
                ...Array.from(document.querySelectorAll(".navbar, .app-header"), (barra) => barra.getBoundingClientRect().bottom)
            );
            const alvo = Math.max(rolarPara.getBoundingClientRect().top + window.scrollY - topo - 16, 0);

            // Página curta: sem altura pra chegar ao alvo, completa o que falta embaixo
            const falta = alvo + window.innerHeight - document.documentElement.scrollHeight;
            const pagina = document.querySelector(".page");
            if (falta > 0 && pagina) {
                pagina.style.paddingBottom = `${parseFloat(getComputedStyle(pagina).paddingBottom) + falta}px`;
            }

            document.documentElement.classList.add("barras-ocultas");
            window.scrollTo({ top: alvo, behavior: "instant" });

            // O scroll que essa rolagem dispara não é do usuário: parte daqui
            ultimoY = window.scrollY;
            descidaAcumulada = 0;
            subidaAcumulada = 0;
        });
    }
    window.addEventListener("resize", () => {
        // A media query de altura muda o espaço sem mudar o tamanho da
        // toolbar/navbar necessariamente — recalcula aqui também.
        updateOffset();
        updateStuckState();
    });
}

function setupScrollToTopButton() {
    // Só existe pra abrigar as setas/sector-switch quando eles ficam
    // sticky (ver setupStickyPagination acima) — aparece assim que a
    // toolbar gruda no topo e some quando volta ao início da página.
    const toolbar = document.querySelector(".toolbar");
    const results = document.querySelector(".results");

    if (!toolbar || !results) return;

    // Posição fixa no canto inferior direito, só CSS (scroll-to-top.css):
    // calcular o top via JS a cada scroll fazia o botão tremer
    const button = document.createElement("button");
    button.type = "button";
    button.className = "scroll-to-top";
    button.setAttribute("aria-label", "Voltar ao topo");
    button.innerHTML = '<i class="icon" data-lucide="arrow-up"></i>';
    document.body.appendChild(button);
    lucide.createIcons();

    // A posição normal (sem sticky) da toolbar vem do getTopoNatural,
    // guardada e refeita quando algo muda de tamanho - o offsetTop,
    // grudado, acompanha o scroll (ver getTopoNatural).
    let topoToolbar = getTopoNatural(toolbar);

    const resizeObserver = new ResizeObserver(() => {
        topoToolbar = getTopoNatural(toolbar);
    });
    resizeObserver.observe(toolbar);
    resizeObserver.observe(toolbar.parentElement);
    document.querySelectorAll(".navbar, .app-header").forEach((barra) => resizeObserver.observe(barra));

    //
    // STUCK_HYSTERESIS existe por causa de historico_solicitacoes.css:
    // assim que .toolbar--stuck entra, Pendentes/Concluídas encolhem e
    // a toolbar fica mais baixa — isso encolhe a altura total da
    // página, e se o scroll estiver perto do fim, o navegador força o
    // scroll de volta pra caber no novo limite. Sem essa folga, esse
    // "puxão" de volta cruzava o mesmo threshold no sentido contrário,
    // tirando o --stuck, o que devolvia a altura, e o próximo scroll
    // pra baixo entrava de novo no --stuck — um vaivém sem fim bem no
    // ponto de virada. Uma vez grudado, só solta de novo rolando bem
    // mais pra cima do que o ponto de entrada.
    const STUCK_HYSTERESIS = 100;

    // Tempo do fade dos cards em historico_solicitacoes.css (opacity +
    // transform, ~0.3s) — precisa bater com a transition de lá.
    const STUCK_FADE_MS = 320;

    // Duração da animação de reflow (Exibir mudando de linha, Saldo
    // mudando de largura) — precisa bater com REFLOW_MS abaixo.
    const REFLOW_MS = 200;

    let isStuck = false;
    let reflowTimer = null;
    let reflowCleanupTimer = null;

    // display:flex/contents/order (ver .toolbar--reflowed em
    // historico_solicitacoes.css) trocam a posição do Exibir e a
    // largura do Saldo na hora — não são propriedades animáveis, então
    // uma transition de CSS não pega. Técnica FLIP: mede antes, aplica
    // a troca (instantânea), mede depois, e anima a DIFERENÇA com
    // transform/width, que são propriedades normais e animam liso.
    function reflowToolbar(add) {
        const saldo = toolbar.querySelectorAll(".toolbar-stat")[0];
        const exibir = toolbar.querySelector(".toolbar__row--controls");

        if (!saldo || !exibir) {
            toolbar.classList.toggle("toolbar--reflowed", add);
            return;
        }

        const saldoBefore = saldo.getBoundingClientRect().width;
        const exibirBefore = exibir.getBoundingClientRect();

        toolbar.classList.toggle("toolbar--reflowed", add);

        const saldoAfter = saldo.getBoundingClientRect().width;
        const exibirAfter = exibir.getBoundingClientRect();

        const dx = exibirBefore.left - exibirAfter.left;
        const dy = exibirBefore.top - exibirAfter.top;

        saldo.style.transition = "none";
        saldo.style.width = `${saldoBefore}px`;

        exibir.style.transition = "none";
        exibir.style.transform =
            Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5 ? `translate(${dx}px, ${dy}px)` : "";

        // Força o navegador a aplicar os valores "de antes" acima antes
        // de religar a transição — sem isso, o browser junta tudo numa
        // única atualização de estilo e não anima nada.
        void saldo.offsetWidth;

        requestAnimationFrame(() => {
            saldo.style.transition = `width ${REFLOW_MS}ms ease`;
            saldo.style.width = `${saldoAfter}px`;

            exibir.style.transition = `transform ${REFLOW_MS}ms ease`;
            exibir.style.transform = "translate(0, 0)";
        });

        // Limpa os estilos inline ao final — se sobrar um width/transform
        // fixo, o próximo resize/reflow real não teria efeito.
        clearTimeout(reflowCleanupTimer);
        reflowCleanupTimer = setTimeout(() => {
            saldo.style.width = "";
            saldo.style.transition = "";
            exibir.style.transform = "";
            exibir.style.transition = "";
        }, REFLOW_MS + 50);
    }

    const appMobileMQ = window.matchMedia("(max-width: 600px)");

    function limiarExtraBotao() {
        return document.body.classList.contains("app-mobile") && appMobileMQ.matches
            ? window.innerHeight * 0.55
            : 0;
    }

    function updateButton() {
        button.classList.toggle("is-visible", isStuck && window.scrollY >= limiarExtraBotao());
    }

    function updateVisibility() {
        const threshold = topoToolbar - getToolbarStickyTop(toolbar);

        const nowStuck = isStuck
            ? window.scrollY >= threshold - STUCK_HYSTERESIS
            : window.scrollY >= threshold;

        if (nowStuck === isStuck) {
            updateButton();
            return;
        }
        isStuck = nowStuck;

        updateButton();

        // Reaproveitada por historico_solicitacoes.css: .toolbar--stuck
        // só dispara o fade de Pendentes/Concluídas (opacity+transform),
        // sem reorganizar a toolbar ainda — mudar display/ordem na hora
        // fazia o card "encolher instantâneo" ANTES do fade rodar,
        // porque display:grid/flex trocando é instantâneo (não anima).
        // .toolbar--reflowed (que faz Exibir subir de linha) só entra
        // depois que esse fade termina, com os cards já invisíveis.
        toolbar.classList.toggle("toolbar--stuck", isStuck);

        clearTimeout(reflowTimer);

        if (isStuck) {
            reflowTimer = setTimeout(() => {
                reflowToolbar(true);
            }, STUCK_FADE_MS);
        } else {
            // Desfaz na hora — os cards ainda estão invisíveis nesse
            // instante (o fade de volta começa agora), então a
            // reorganização soltando não aparece.
            reflowToolbar(false);
        }
    }

    updateVisibility();

    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// Notificação "flash": alguma ação (ex.: cadastro de frasco) grava uma
// mensagem aqui antes de redirecionar, e a página de destino a lê, exibe
// e descarta assim que carrega — sobrevive à navegação porque mora no
// sessionStorage, não em variável de JS. Mesmo padrão de flash message
// que o backend Spring/Thymeleaf vai usar no projeto final.
const FLASH_TOAST_KEY = "flashToastMessage";

// location.reload() não dispara View Transition (ver css/layout/panel-transition.css);
// replace na mesma URL sim, e não empilha histórico
function recarregarPagina() {
    location.replace(location.href.split("#")[0]);
}

function showToast(html) {
    // Nem toda página carrega o SweetAlert2 (só as com formulário/ações
    // que precisam dele) — sem essa guarda, uma página sem Swal quebraria
    // ao tentar mostrar um toast pendente do sessionStorage.
    if (typeof Swal === "undefined") return;

    Swal.fire({
        toast: true,
        position: "top",
        icon: "success",
        html,
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
        customClass: {
            // .glass-success (ver glass.css): vidro esverdeado bem
            // desfocado, no lugar do fundo sólido padrão do toast.
            popup: "glass-success",
        },
        didOpen: (toastEl) => {
            toastEl.addEventListener("mouseenter", Swal.stopTimer);
            toastEl.addEventListener("mouseleave", Swal.resumeTimer);
        },
    });
}

function setupFlashToast() {
    const mensagem = sessionStorage.getItem(FLASH_TOAST_KEY);

    if (!mensagem) return;

    // Remove antes de mostrar: um F5 na página de destino não pode fazer
    // a mesma notificação aparecer de novo.
    sessionStorage.removeItem(FLASH_TOAST_KEY);
    showToast(mensagem);
}

// Sem escolha salva ainda, cai na preferência do SO/navegador em vez de
// sempre nascer clara — mesmo fallback usado em setupThemeToggle acima.
const savedTheme = localStorage.getItem("theme")
    || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
applyTheme(savedTheme);

// Libera as transições (html.carregando, ver base/globals.css) depois que
// todos os scripts da página rodaram e o estado inicial foi pintado: o
// DOMContentLoaded espera os <script> síncronos, e o 2º frame garante
// que o navegador já aplicou os estilos sem transição
document.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => document.documentElement.classList.remove("carregando"));
    });
});

// Campos numéricos (quantidades): focar já seleciona o valor, pra digitar por
// cima. No clique, o mouseup desfaria a seleção — por isso é cancelado quando
// foi esse clique que deu o foco (clicar num campo já focado posiciona o cursor).
function setupSelecionarNumeroAoFocar() {
    const isCampoNumero = (el) => el instanceof HTMLInputElement && el.type === "number";
    let focadoPeloClique = null;

    document.addEventListener("mousedown", (event) => {
        focadoPeloClique = isCampoNumero(event.target) && document.activeElement !== event.target
            ? event.target
            : null;
    });

    document.addEventListener("mouseup", (event) => {
        if (focadoPeloClique && event.target === focadoPeloClique) event.preventDefault();
        focadoPeloClique = null;
    });

    document.addEventListener("focusin", (event) => {
        if (isCampoNumero(event.target)) event.target.select();
    });
}

loadIncludes();
setupFlashToast();
setupSelecionarNumeroAoFocar();

// Configuração global do Toast de Sucesso
const Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    customClass: {
        popup: "glass-success"
    },
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

// Configuração global do Toast de Erro
const ToastError = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    customClass: {
        popup: "glass-error"
    },
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});