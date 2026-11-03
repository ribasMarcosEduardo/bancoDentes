(function () {
    const base = document.currentScript.src;

    [
        "../vendor/lucide.min.js",
        "../vendor/sweetalert2.min.js",
        "../includes.js",
        "../filters.js",
        "../results.js",
        "../search.js",
        "../requests.js",
        "../page-size.js"
    ].forEach((src) => {
        document.write(`<script src="${new URL(src, base).href}"><\/script>`);
    });
})();
