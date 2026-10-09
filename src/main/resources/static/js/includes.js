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

        btn.addEventListener("click", (event) => {
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

    const TOOLBAR_STICKY_TOP = 16; // 1rem — precisa bater com .toolbar { top: 1rem } em toolbar.css
    const GAP_BELOW_TOOLBAR = 24; // 1.5rem — gap entre linhas de .main-panel

    let stickyTop = 0;

    function updateOffset() {
        stickyTop = TOOLBAR_STICKY_TOP + toolbar.offsetHeight + GAP_BELOW_TOOLBAR;
        pagination.style.setProperty("--pagination-sticky-top", `${stickyTop}px`);
    }

    // offsetTop reflete a posição normal (sem sticky) de .pagination no
    // fluxo do documento, mesmo enquanto ela está grudada — dá pra
    // comparar direto com o scroll atual pra saber se ela já colou.
    function updateStuckState() {
        const isStuck = window.scrollY >= pagination.offsetTop - stickyTop;
        pagination.classList.toggle("is-stuck", isStuck);
    }

    updateOffset();
    updateStuckState();

    new ResizeObserver(updateOffset).observe(toolbar);
    window.addEventListener("scroll", updateStuckState, { passive: true });
    window.addEventListener("resize", updateStuckState);
}

function setupScrollToTopButton() {
    // Só existe pra abrigar as setas/sector-switch quando eles ficam
    // sticky (ver setupStickyPagination acima) — aparece assim que a
    // toolbar gruda no topo e some quando volta ao início da página.
    const toolbar = document.querySelector(".toolbar");
    const results = document.querySelector(".results");
    const dashboard = document.querySelector(".dashboard");

    if (!toolbar || !results) return;

    const TOOLBAR_STICKY_TOP = 16; // 1rem — precisa bater com .toolbar { top: 1rem } em toolbar.css
    const BUTTON_SIZE = 48; // precisa bater com width/height de .scroll-to-top
    const EDGE_GAP = 20; // 1.25rem — mesma distância usada nos outros FABs (mobile-menu-toggle etc.)
    const DASHBOARD_EDGE_GAP = EDGE_GAP / 3; // 2/3 menor — perto do fim do .dashboard, folga total incomoda

    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "scroll-to-top";
    button.setAttribute("aria-label", "Voltar ao topo");
    button.innerHTML = '<i class="icon" data-lucide="arrow-up"></i>';
    document.body.appendChild(button);
    lucide.createIcons();

    // Posição vertical vem toda daqui (não de "bottom" fixo no CSS) pra
    // dar pra travar o botão sem ultrapassar o fim do .dashboard (todo
    // o conteúdo da página, sidebar incluída) — numa página curta, o
    // fim dele pode chegar antes de onde o botão ficaria normalmente
    // perto do rodapé da tela. Alinhamento horizontal continua com
    // .results, que é quem define a borda esquerda visível da lista.
    function updatePosition() {
        // No mobile o hambúrguer vira um FAB fixo no canto (ver
        // .mobile-menu-toggle em layout/mobile-menu.css) — nessa faixa,
        // quem posiciona o botão é o CSS (ver @media max-width:1000px
        // em components/scroll-to-top.css), grudado do lado esquerdo
        // dele. Só precisa limpar left/top daqui pra não brigar com o
        // right/bottom do CSS (inline style sempre vence a folha de
        // estilo pra mesma propriedade).
        const isMobileMenuActive = mobileMenuToggle && getComputedStyle(mobileMenuToggle).display !== "none";

        if (isMobileMenuActive) {
            button.style.top = "";
            button.style.left = "";
            return;
        }

        const resultsRect = results.getBoundingClientRect();
        const bottomBoundary = dashboard ? dashboard.getBoundingClientRect().bottom : resultsRect.bottom;

        const preferredTop = window.innerHeight - EDGE_GAP - BUTTON_SIZE;
        const maxTop = bottomBoundary - BUTTON_SIZE - DASHBOARD_EDGE_GAP;

        button.style.top = `${Math.min(preferredTop, maxTop)}px`;
        button.style.left = `${resultsRect.left}px`;
    }

    // offsetTop reflete a posição "normal" (sem sticky) da toolbar no
    // fluxo do documento, mesmo enquanto ela está grudada — por isso
    // dá pra comparar direto com o scroll atual pra saber se ela já
    // colou no topo, sem precisar de sentinela.
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

    function updateVisibility() {
        const threshold = toolbar.offsetTop - TOOLBAR_STICKY_TOP;

        const nowStuck = isStuck
            ? window.scrollY >= threshold - STUCK_HYSTERESIS
            : window.scrollY >= threshold;

        if (nowStuck === isStuck) return;
        isStuck = nowStuck;

        button.classList.toggle("is-visible", isStuck);

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

    function updateAll() {
        updatePosition();
        updateVisibility();
    }

    updateAll();

    // A posição precisa recalcular a cada scroll (não só resize) porque
    // maxTop depende de onde .results está na tela nesse momento.
    window.addEventListener("scroll", updateAll, { passive: true });
    window.addEventListener("resize", updateAll);

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

loadIncludes();
setupFlashToast();

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