// Landing page (index.html) — não usa includes.js: a navbar daqui é
// própria (.lp-nav), não o partial do dashboard.
//
// Nada aqui escuta o evento "scroll" da janela: tudo que depende da
// rolagem (barra rolada, link ativo, animações de entrada) usa
// IntersectionObserver, que o navegador agrupa e só dispara quando um
// limite é cruzado — em vez de rodar a cada frame de scroll.

lucide.createIcons();

(function () {
    const nav = document.getElementById("lpNav");
    const toggle = document.getElementById("lpNavToggle");
    const menu = document.getElementById("lpNavMenu");
    const hasObserver = "IntersectionObserver" in window;

    if (!nav) return;

    // ======================================================
    // Barra transparente no hero -> vidro claro ao rolar
    // ======================================================
    //
    // Um "sentinela" invisível de 24px colado no topo do documento: quando
    // ele sai da tela, a página foi rolada. O menu mobile aberto também
    // força o estado "rolado" — o painel é vidro claro, então a barra em
    // cima dele precisa ficar clara junto (logo colorida, ícone azul).

    let atTop = true;

    function updateScrolled() {
        const menuOpen = menu && menu.classList.contains("is-open");
        nav.classList.toggle("is-scrolled", !atTop || menuOpen);
    }

    if (hasObserver) {
        const sentinel = document.createElement("div");
        sentinel.className = "lp-scroll-sentinel";
        sentinel.setAttribute("aria-hidden", "true");
        document.body.prepend(sentinel);

        new IntersectionObserver(([entry]) => {
            atTop = entry.isIntersecting;
            updateScrolled();
        }).observe(sentinel);
    } else {
        atTop = false;
        updateScrolled();
    }

    // ======================================================
    // Menu mobile
    // ======================================================

    function setMenu(open) {
        if (!menu || !toggle) return;

        menu.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");

        // Ícone montado à mão: lucide.createIcons() troca o <i> por um
        // <svg>, então pra mudar de ícone é preciso recriar o <i>.
        toggle.innerHTML = '<i class="icon" data-lucide="' + (open ? "x" : "menu") + '"></i>';
        lucide.createIcons();

        updateScrolled();
    }

    if (toggle && menu) {
        toggle.addEventListener("click", () => {
            setMenu(!menu.classList.contains("is-open"));
        });

        menu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => setMenu(false));
        });

        // composedPath() e não nav.contains(event.target): o clique no
        // toggle recria o ícone (innerHTML em setMenu), então quando o
        // evento chega aqui o alvo (<svg>) já saiu do DOM e o contains()
        // daria false — fechando o menu no mesmo clique que o abriu.
        document.addEventListener("click", (event) => {
            if (menu.classList.contains("is-open") && !event.composedPath().includes(nav)) {
                setMenu(false);
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && menu.classList.contains("is-open")) {
                setMenu(false);
                toggle.focus();
            }
        });

        // Voltou pro desktop com o menu aberto: fecha pra não ficar
        // preso no estado "rolado".
        window.matchMedia("(min-width: 1121px)").addEventListener("change", (event) => {
            if (event.matches) setMenu(false);
        });
    }

    // ======================================================
    // Link ativo conforme a seção visível
    // ======================================================

    const links = document.querySelectorAll(".lp-nav__link, .lp-nav__menu-link");
    const sections = Array.from(links)
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter((section, index, list) => section && list.indexOf(section) === index);

    // O hero entra na observação só pra "limpar" o destaque: nenhum link
    // aponta pra #inicio, então quando ele volta ao meio da tela todos
    // os links ficam inativos.
    const hero = document.getElementById("inicio");
    if (hero) sections.unshift(hero);

    function setActive(id) {
        links.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
        });
    }

    if (hasObserver && sections.length) {
        // Faixa estreita no meio da tela: a seção "ativa" é a que está
        // cruzando essa linha, não a primeira que encosta no topo.
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        }, { rootMargin: "-45% 0px -50% 0px" });

        sections.forEach((section) => sectionObserver.observe(section));
    }

    // ======================================================
    // Animações de entrada (scroll reveal)
    // ======================================================
    //
    // Motivo: hierarquia/leitura. Cada seção se monta na ordem em que deve
    // ser lida (rótulo -> título -> texto -> cards), em vez de tudo surgir
    // de uma vez. Roda uma vez por elemento e só com transform/opacity.
    //
    // A lista fica aqui (e não como atributos espalhados no HTML) pra que
    // ajustar o que anima seja uma edição num lugar só. Itens irmãos do
    // mesmo seletor entram em cascata (--reveal-i), com teto pra que
    // listas longas não demorem demais.
    //
    // Tipos: "up" (sobe + aparece, padrão), "media" (moldura de imagem:
    // sobe + a foto dentro faz um zoom-out suave).

    const REVEALS = [
        [".lp-section__head > *", "up"],
        [".lp-split__text > *", "up"],
        [".lp-split__media > .lp-media", "media"],
        [".lp-timeline-card", "up", 3],
        [".lp-compare__card", "up"],
        [".lp-step", "up"],
        [".lp-system", "up"],
        [".lp-system__intro > *", "up", 2],
        [".lp-role", "up", 3],
        [".lp-campus__photo", "media"],
        [".lp-campus__panel", "up", 2],
        [".lp-stat", "up", 3],
        [".lp-about__text", "up"],
        [".lp-about__facts > li", "up", 1],
        [".lp-mission", "up", 2],
        [".lp-cta", "up"]
    ];

    const MAX_STAGGER = 6;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motionOn = document.documentElement.classList.contains("lp-motion");

    if (motionOn && hasObserver && !reduceMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-revealed");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

        REVEALS.forEach(([selector, type, baseDelay = 0]) => {
            const counters = new Map();

            document.querySelectorAll(selector).forEach((element) => {
                if (element.hasAttribute("data-reveal")) return;

                // Índice entre irmãos do MESMO grupo (mesmo pai), pra que a
                // cascata recomece a cada lista/seção.
                const index = counters.get(element.parentElement) || 0;
                counters.set(element.parentElement, index + 1);

                element.setAttribute("data-reveal", type);
                element.style.setProperty("--reveal-i", Math.min(index + baseDelay, MAX_STAGGER + baseDelay));
                revealObserver.observe(element);
            });
        });
    } else {
        // Sem animação (movimento reduzido ou navegador antigo): tira a
        // classe pra que nada fique escondido esperando um reveal.
        document.documentElement.classList.remove("lp-motion");
    }

    // ======================================================
    // Carregamento das imagens
    // ======================================================
    //
    // Motivo: estado. Enquanto a foto não chega, a moldura mostra um
    // brilho de "carregando" no lugar de um buraco vazio, e a foto entra
    // com fade em vez de pipocar.

    document.querySelectorAll(".lp-media img").forEach((img) => {
        const frame = img.closest(".lp-media");
        if (img.complete && img.naturalWidth > 0) return;

        frame.classList.add("is-loading");

        const done = () => frame.classList.remove("is-loading");
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
    });

    // Fundo do hero: é background-image (não <img>), então pré-carrega a
    // mesma URL e só revela a camada quando a foto estiver pronta — até lá
    // aparece o azul institucional com o gradiente por cima.
    const heroMedia = document.querySelector(".lp-hero__media");

    if (heroMedia) {
        const match = getComputedStyle(heroMedia).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
        const reveal = () => heroMedia.classList.add("is-loaded");

        if (match) {
            const preload = new Image();
            preload.addEventListener("load", reveal, { once: true });
            preload.addEventListener("error", reveal, { once: true });
            preload.src = match[1];
            if (preload.complete) reveal();
        } else {
            reveal();
        }
    }
})();
