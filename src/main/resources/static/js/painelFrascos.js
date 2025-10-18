document.addEventListener('DOMContentLoaded', () => {
    const btnBlocos = document.getElementById('btn-blocos');
    const btnLista = document.getElementById('btn-lista');
    const container = document.getElementById('conteudo-dinamico');
    const paginacaoContainer = document.getElementById('paginacao-container');
    const filtroForm = document.getElementById('filtroForm');
    const btnSort = document.getElementById('btnSort');

    let sortOrder = 'recente';
    let cacheDeItensBlocos = [];

    const displayPageBlocos = (currentPage = 1, itemsPerPage = 15) => {
        if (!cacheDeItensBlocos.length) return;

        const parent = container.querySelector('#cardsContainer');
        if (!parent) return;

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        parent.innerHTML = '';
        cacheDeItensBlocos.slice(start, end).forEach(item => parent.appendChild(item));

        const pageCount = Math.ceil(cacheDeItensBlocos.length / itemsPerPage);
        if (pageCount <= 1) return paginacaoContainer.innerHTML = '';

        const ul = document.createElement('ul');
        ul.className = 'pagination justify-content-center';
        ul.innerHTML = `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>
            </li>
            ${Array.from({ length: pageCount }, (_, i) => `
                <li class="page-item ${i + 1 === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i + 1}">${i + 1}</a>
                </li>
            `).join('')}
            <li class="page-item ${currentPage === pageCount ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a>
            </li>
        `;
        paginacaoContainer.innerHTML = '';
        paginacaoContainer.appendChild(ul);

        paginacaoContainer.onclick = e => {
            const link = e.target.closest('.page-link');
            if (link && !link.closest('.page-item').classList.contains('disabled')) {
                e.preventDefault();
                displayPageBlocos(parseInt(link.dataset.page, 10));
            }
        };
    };

    const inicializarDataTables = () => {
        paginacaoContainer.innerHTML = '';
        if (!$.fn.dataTable.isDataTable('#tabela-frascos')) {
            $('#tabela-frascos').DataTable({
                language: { url: '//cdn.datatables.net/plug-ins/1.13.8/i18n/pt-BR.json' },
                pageLength: 15,
                destroy: true,
                responsive: true,
                searching: false,
                ordering: true,
                order: [[0, sortOrder === 'recente' ? 'desc' : 'asc']],
                lengthChange: false,
                info: false
            });
        } else {
            const table = $('#tabela-frascos').DataTable();
            table.order([0, sortOrder === 'recente' ? 'desc' : 'asc']).draw();
        }
    };

    const carregarVisualizacao = viewType => {
        const params = new URLSearchParams(new FormData(filtroForm));
        params.append('view', viewType);
        container.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height:200px;">
            <div class="spinner-border text-secondary" role="status"></div>
        </div>`;
        fetch(`/frasco/visualizacao?${params.toString()}`)
            .then(r => r.text())
            .then(html => {
                container.innerHTML = html;
                if (viewType === 'lista') inicializarDataTables();
                else {
                    cacheDeItensBlocos = Array.from(container.querySelectorAll('.frasco-card'));
                    // Aplica ordenação inicial
                    cacheDeItensBlocos.sort((a, b) => {
                        const idA = parseInt(a.dataset.id, 10);
                        const idB = parseInt(b.dataset.id, 10);
                        return sortOrder === 'recente' ? idB - idA : idA - idB;
                    });
                    displayPageBlocos();
                }
            })
            .catch(console.error);
    };

    const alternarVisualizacao = viewType => {
        carregarVisualizacao(viewType);
        const addBtn = viewType === 'blocos' ? btnBlocos : btnLista;
        const removeBtn = viewType === 'blocos' ? btnLista : btnBlocos;
        addBtn.classList.add('active', 'btn-secondary');
        addBtn.classList.remove('btn-outline-secondary');
        removeBtn.classList.remove('active', 'btn-secondary');
        removeBtn.classList.add('btn-outline-secondary');
    };

    filtroForm.addEventListener('submit', e => {
        e.preventDefault();
        alternarVisualizacao(btnBlocos.classList.contains('active') ? 'blocos' : 'lista');
    });

    btnBlocos.addEventListener('click', () => {
        if (!btnBlocos.classList.contains('active')) alternarVisualizacao('blocos');
    });

    btnLista.addEventListener('click', () => {
        if (!btnLista.classList.contains('active')) alternarVisualizacao('lista');
    });

    if (btnSort) {
        btnSort.addEventListener('click', () => {
            sortOrder = sortOrder === 'recente' ? 'antigo' : 'recente';
            const isLista = !!document.getElementById('tabela-frascos');

            if (isLista) {
                $('#tabela-frascos').DataTable().order([0, sortOrder === 'recente' ? 'desc' : 'asc']).draw();
            } else {
                cacheDeItensBlocos.sort((a, b) => {
                    const idA = parseInt(a.dataset.id, 10);
                    const idB = parseInt(b.dataset.id, 10);
                    return sortOrder === 'recente' ? idB - idA : idA - idB;
                });
                displayPageBlocos();
            }

            btnSort.innerHTML = sortOrder === 'recente' ? '<i class="bi bi-sort-down"></i>' : '<i class="bi bi-sort-up"></i>';
            btnSort.title = sortOrder === 'recente' ? 'Ordenar por Mais Antigos' : 'Ordenar por Mais Recentes';
        });
    }

    if (document.getElementById('tabela-frascos')) inicializarDataTables();
    else {
        cacheDeItensBlocos = Array.from(container.querySelectorAll('.frasco-card'));
        cacheDeItensBlocos.sort((a, b) => parseInt(b.dataset.id, 10) - parseInt(a.dataset.id, 10));
        displayPageBlocos();
    }
});
