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
    const navbar = document.querySelector(".navbar");

    if (!navbar) return;

    function update() {
        document.documentElement.style.setProperty("--navbar-height", `${navbar.offsetHeight}px`);
    }

    update();
    new ResizeObserver(update).observe(navbar);
}

// Distância do topo da tela em que a .toolbar gruda — lida do CSS
// (navbar + 1rem, ver components/toolbar.css) em vez de fixa aqui.
function getToolbarStickyTop(toolbar) {
    return parseFloat(getComputedStyle(toolbar).top) || 0;
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

    function updateOffset() {
        stickyTop = getToolbarStickyTop(toolbar) + toolbar.offsetHeight + gapBelowToolbar();
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

    // Observa a navbar também: a altura dela muda o top da toolbar.
    const resizeObserver = new ResizeObserver(() => {
        updateOffset();
        updateStuckState();
    });
    resizeObserver.observe(toolbar);

    const navbar = document.querySelector(".navbar");
    if (navbar) resizeObserver.observe(navbar);

    window.addEventListener("scroll", updateStuckState, { passive: true });

    // Como em apps de feed: rolando pra baixo com a paginação grudada, toolbar
    // e paginação somem; qualquer rolagem pra cima as traz de volta. Não some
    // com a busca/um select da toolbar em uso.
    let ultimoY = window.scrollY;
    let descidaAcumulada = 0;

    // Desktop só esconde depois de uma descida contínua maior, pra não ser
    // brusco logo no começo da rolagem; no toque segue imediato
    const LIMIAR_DESCIDA = window.matchMedia("(pointer: fine)").matches ? 80 : 0;

    function atualizarBarrasOcultas() {
        const y = window.scrollY;
        const delta = y - ultimoY;
        if (Math.abs(delta) < 6) return;
        ultimoY = y;

        // Salto maior que a tela = reposicionamento (ex.: rolagem restaurada
        // depois de uma ação), não rolagem do usuário
        if (Math.abs(delta) > window.innerHeight) {
            descidaAcumulada = 0;
            return;
        }

        const raiz = document.documentElement;
        const ativo = document.activeElement;
        const editando = toolbar.contains(ativo) && ativo.matches("input, select, textarea");

        if (delta < 0 || !pagination.classList.contains("is-stuck") || editando) {
            descidaAcumulada = 0;
            raiz.classList.remove("barras-ocultas");
            return;
        }

        descidaAcumulada += delta;
        if (descidaAcumulada > LIMIAR_DESCIDA) raiz.classList.add("barras-ocultas");
    }

    window.addEventListener("scroll", atualizarBarrasOcultas, { passive: true });
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
        const threshold = toolbar.offsetTop - getToolbarStickyTop(toolbar);

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