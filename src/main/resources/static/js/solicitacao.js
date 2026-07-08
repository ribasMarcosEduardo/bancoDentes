document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // Controle dos botões + e - da quantidade
    const qtyInput = document.getElementById('quantidade');
    const btnUp = document.querySelector('[data-number-action="up"]');
    const btnDown = document.querySelector('[data-number-action="down"]');

    if (btnUp && btnDown && qtyInput) {
        btnUp.addEventListener('click', () => {
            if(!qtyInput.disabled) {
                qtyInput.value = parseInt(qtyInput.value || 0) + 1;
                atualizarFeedback();
            }
        });

        btnDown.addEventListener('click', () => {
            if(!qtyInput.disabled && qtyInput.value > 1) {
                qtyInput.value = parseInt(qtyInput.value || 0) - 1;
                atualizarFeedback();
            }
        });
    }

    // Inicializa o estado do formulário
    atualizarCampos(false);
    atualizarFeedback();
});

function atualizarFeedback() {
    const creditoInput = document.getElementById('creditoEstudante');
    const qtyInput = document.getElementById('quantidade');
    const feedbackText = document.getElementById('creditoFeedbackText');

    if (!creditoInput || !qtyInput || !feedbackText) return;

    const credito = parseInt(creditoInput.value) || 0;
    const qtd = parseInt(qtyInput.value) || 0;

    if (qtd > credito) {
        feedbackText.style.display = 'block';
        feedbackText.innerHTML = `<i data-lucide="alert-circle" style="width: 16px; height: 16px; margin-bottom: -3px; margin-right: 4px;"></i> Saldo insuficiente (Você tem: ${credito})`;
        if (window.lucide) lucide.createIcons();
    } else {
        feedbackText.style.display = 'none';
    }
}

function atualizarCampos(limpar = false) {
    const tipoDenteInput = document.getElementById('tipoDente');
    if (!tipoDenteInput) return;

    const valor = tipoDenteInput.value.trim().toUpperCase();
    const isMisto = valor === 'MISTO';
    const isMolar = valor === 'MOLAR';
    const isPreMolar = valor === 'PRE_MOLAR';
    const hasValue = valor !== '';

    const estadoSection = document.getElementById('estadoFrascoSection');
    const atributosSection = document.getElementById('atributosFrascoSection');

    const qtyGroup = document.getElementById('quantidadeGroup');
    const estadoGroup = document.getElementById('estadoGroup');

    const denticao = document.getElementById('denticao');
    const maxilar = document.getElementById('maxilar');
    const estado = document.getElementById('estadoDente');
    const quantidade = document.getElementById('quantidade');

    const posicaoContainer = document.getElementById('posicaoContainer');
    const molarCheckboxes = document.getElementById('molarCheckboxes');
    const preMolarCheckboxes = document.getElementById('preMolarCheckboxes');
    const checkboxes = document.querySelectorAll('#posicaoContainer input[type="checkbox"]');
    const controlBtns = document.querySelectorAll('.quantidade-control');

    // Habilita a quantidade se tiver qualquer coisa selecionada
    if (hasValue) {
        estadoSection.classList.remove('form-section--disabled');
        qtyGroup.classList.remove('form-group--disabled');
        quantidade.disabled = false;
        controlBtns.forEach(btn => btn.disabled = false);
    } else {
        estadoSection.classList.add('form-section--disabled');
        qtyGroup.classList.add('form-group--disabled');
        quantidade.disabled = true;
        controlBtns.forEach(btn => btn.disabled = true);
    }

    if (isMisto) {
        atributosSection.classList.add('form-section--disabled');
        denticao.disabled = true; denticao.required = false;
        maxilar.disabled = true; maxilar.required = false;

        estadoGroup.classList.add('form-group--disabled');
        estado.disabled = true; estado.required = false;

        posicaoContainer.style.display = 'none';
    } else if (hasValue) {
        atributosSection.classList.remove('form-section--disabled');
        denticao.disabled = false; denticao.required = true;
        maxilar.disabled = false; maxilar.required = true;

        estadoGroup.classList.remove('form-group--disabled');
        estado.disabled = false; estado.required = true;

        posicaoContainer.style.display = (isMolar || isPreMolar) ? 'block' : 'none';
        molarCheckboxes.style.display = isMolar ? 'flex' : 'none';
        preMolarCheckboxes.style.display = isPreMolar ? 'flex' : 'none';
    } else {
        atributosSection.classList.add('form-section--disabled');
        denticao.disabled = true; denticao.required = false;
        maxilar.disabled = true; maxilar.required = false;

        estadoGroup.classList.add('form-group--disabled');
        estado.disabled = true; estado.required = false;
        posicaoContainer.style.display = 'none';
    }

    if (limpar) {
        if (isMisto) {
            denticao.value = '';
            maxilar.value = '';
            estado.value = '';
        }
        checkboxes.forEach(cb => cb.checked = false);
    }
}

function validarESubmeter() {
    const creditoInput = document.getElementById('creditoEstudante');
    const qtyInput = document.getElementById('quantidade');
    const tipoDenteInput = document.getElementById('tipoDente');
    const justificativaInput = document.getElementById('justificativa');

    const credito = parseInt(creditoInput ? creditoInput.value : 0) || 0;
    const quantidade = parseInt(qtyInput ? qtyInput.value : 0) || 0;
    const tipoDente = tipoDenteInput ? tipoDenteInput.value : "";
    const justificativa = justificativaInput ? justificativaInput.value.trim() : "";

    if (!tipoDente) return mostrarErro('Selecione o tipo do dente.');

    if (credito < quantidade) {
        return mostrarErro(`Seus créditos são insuficientes para solicitar ${quantidade} dente(s).`);
    }

    if (justificativa.length < 5) {
        return mostrarErro('Por favor, informe uma justificativa válida (mínimo 5 caracteres).');
    }

    document.getElementById('formSolicitacao').submit();
}

function mostrarErro(msg) {
    if (window.Swal) {
        Swal.fire({
            icon: 'error',
            title: 'Atenção',
            text: msg,
            confirmButtonColor: '#d33'
        });
    } else {
        alert(msg); // Fallback caso o SweetAlert não carregue
    }
}