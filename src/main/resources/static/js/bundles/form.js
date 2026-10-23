(function () {
    const base = document.currentScript.src;

    [
        "../vendor/lucide.min.js",
        "../vendor/sweetalert2.min.js",
        "../includes.js",
        "../forms.js"
    ].forEach((src) => {
        document.write(`<script src="${new URL(src, base).href}"><\/script>`);
    });
})();
