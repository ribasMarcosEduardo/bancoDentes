(function () {
    const base = document.currentScript.src;

    [
        "https://unpkg.com/lucide@latest",
        "../vendor/sweetalert2.min.js",
        "../includes.js",
        "../forms.js"
    ].forEach((src) => {
        document.write(`<script src="${new URL(src, base).href}"><\/script>`);
    });
})();
