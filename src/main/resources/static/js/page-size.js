function setupPageSizeSelect() {
    const wrapper = document.querySelector(".page-size-control__select");
    const select = wrapper ? wrapper.querySelector(".form-control") : null;

    if (!select) return;

    let isOpen = false;

    function close() {
        isOpen = false;
        wrapper.classList.remove("is-open");
    }

    // :focus não serve pra saber se o dropdown nativo está aberto — ele
    // continua focado depois de escolher uma opção, então a seta ficava
    // "presa" girada. Aqui simulamos o estado real: o segundo mousedown
    // num select que já estava focado é o clique que fecha ele de volta.
    select.addEventListener("mousedown", () => {
        const wasFocused = document.activeElement === select;

        isOpen = wasFocused ? !isOpen : true;
        wrapper.classList.toggle("is-open", isOpen);
    });

    select.addEventListener("blur", close);
    select.addEventListener("change", close);
}

setupPageSizeSelect();
