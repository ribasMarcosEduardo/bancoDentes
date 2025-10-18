document.addEventListener('DOMContentLoaded', () => {
    const btnBlocos = document.getElementById('btn-blocos');
    const btnLista = document.getElementById('btn-lista');
    const container = document.getElementById('conteudo-dinamico');
    const filtroForm = document.getElementById('filtroForm');
    const btnSort = document.getElementById('btnSort'); // Pega o botão de ordenar uma vez
    let sortOrder = 'recente'; // Controla a ordem da ordenação

    filtroForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const activeView = btnBlocos.classList.contains('active') ? 'blocos' : 'lista';
        carregarVisualizacao(activeView);
    });

    if (btnSort) {
        btnSort.addEventListener('click', () => {

            const containerSorteavel = document.getElementById('cardsContainer') || document.getElementById('lista-corpo');

            if (!containerSorteavel) return;

            const itens = Array.from(containerSorteavel.children);

            itens.sort((a, b) => {
                const idA = parseInt(a.dataset.id, 10);
                const idB = parseInt(b.dataset.id, 10);
                return sortOrder === 'recente' ? idB - idA : idA - idB;
            });

            containerSorteavel.innerHTML = '';
            itens.forEach(item => containerSorteavel.appendChild(item));

            sortOrder = sortOrder === 'recente' ? 'antigo' : 'recente';

            btnSort.innerHTML = sortOrder === 'recente'
                ? '<i class="bi bi-sort-down"></i>'
                : '<i class="bi bi-sort-up"></i>';
            btnSort.title = sortOrder === 'recente'
                ? 'Ordenar por Mais Recentes'
                : 'Ordenar por Mais Antigos';
        });
    }

    const carregarVisualizacao = (viewType) => {
        const formData = new FormData(filtroForm);
        const params = new URLSearchParams(formData);
        params.append('view', viewType);

        container.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="min-height: 200px;">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
            </div>`;

        fetch(`/frasco/visualizacao?${params.toString()}`)
            .then(response => response.text())
            .then(html => {
                container.innerHTML = html;
            })
            .catch(error => {
                console.error('Erro na requisição Fetch:', error);
                container.innerHTML = '<div class="alert alert-danger">Ocorreu um erro ao carregar os dados.</div>';
            });
    };

    btnBlocos.addEventListener('click', () => {
        if (!btnBlocos.classList.contains('active')) {
            carregarVisualizacao('blocos');
            btnBlocos.classList.add('active', 'btn-primary');
            btnBlocos.classList.remove('btn-outline-primary');
            btnLista.classList.remove('active', 'btn-primary');
            btnLista.classList.add('btn-outline-primary');
        }
    });

    btnLista.addEventListener('click', () => {
        if (!btnLista.classList.contains('active')) {
            carregarVisualizacao('lista');
            btnLista.classList.add('active', 'btn-primary');
            btnLista.classList.remove('btn-outline-primary');
            btnBlocos.classList.remove('active', 'btn-primary');
            btnBlocos.classList.add('btn-outline-primary');
        }
    });

});