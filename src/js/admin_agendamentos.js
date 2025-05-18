// Redireciona para login se não estiver logado
if (!localStorage.getItem('adminLogged')) {
    window.location.href = 'login.html';
}

// Configuração do flatpickr para o filtro de data
flatpickr("#dateFilter", {
    locale: "pt",
    dateFormat: "d/m/Y",
    allowInput: true,
    altInput: true,
    altFormat: "d/m/Y",
});

// Estado global
let agendamentos = [];
let currentPage = 1;
const itemsPerPage = 10;
let sortConfig = {
    column: null,
    direction: 'asc'
};

// Carregar e renderizar agendamentos
async function loadAppointments() {
    try {
        const response = await fetch('backend/list_appointments.php');
        agendamentos = await response.json();
        
        if (!Array.isArray(agendamentos)) {
            agendamentos = [];
        }
        
        updateDashboardStats();
        applyFiltersAndSort();
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        alert('Houve um erro ao carregar os agendamentos. Por favor, tente novamente.');
    }
}

// Atualizar estatísticas do dashboard
function updateDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = agendamentos.reduce((acc, appointment) => {
        // Total de agendamentos
        acc.total++;

        // Agendamentos de hoje
        if (appointment.data === today) {
            acc.today++;
        }

        // Agendamentos confirmados
        if (appointment.status.toLowerCase() === 'confirmado') {
            acc.confirmed++;
        }

        // Valor total
        acc.totalValue += parseFloat(appointment.total_price || 0);

        return acc;
    }, { total: 0, today: 0, confirmed: 0, totalValue: 0 });

    document.getElementById('totalAgendamentos').textContent = stats.total;
    document.getElementById('agendamentosHoje').textContent = stats.today;
    document.getElementById('agendamentosConfirmados').textContent = stats.confirmed;
    document.getElementById('valorTotal').textContent = stats.totalValue.toFixed(2);
}

// Aplicar filtros e ordenação
function applyFiltersAndSort() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value.toLowerCase();
    const dateFilter = document.getElementById('dateFilter').value;

    let filteredAppointments = agendamentos.filter(appointment => {
        const matchesSearch = !searchQuery || 
            appointment.nome.toLowerCase().includes(searchQuery) ||
            appointment.telefone.includes(searchQuery);

        const matchesStatus = !statusFilter || 
            appointment.status.toLowerCase() === statusFilter;

        const matchesDate = !dateFilter || 
            appointment.data === formatDateForComparison(dateFilter);

        return matchesSearch && matchesStatus && matchesDate;
    });

    if (sortConfig.column) {
        filteredAppointments.sort((a, b) => {
            let aValue = a[sortConfig.column];
            let bValue = b[sortConfig.column];

            // Tratar datas
            if (sortConfig.column === 'data') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            const direction = sortConfig.direction === 'asc' ? 1 : -1;

            if (aValue instanceof Date) {
                return direction * (aValue - bValue);
            }
            
            if (typeof aValue === 'string') {
                return direction * aValue.localeCompare(bValue);
            }
            
            return direction * (aValue - bValue);
        });
    }

    renderAppointmentsTable(filteredAppointments);
    renderPagination(filteredAppointments.length);
}

// Renderizar tabela de agendamentos
function renderAppointmentsTable(filteredAppointments) {
    const tbody = document.getElementById('adminAgendamentosBody');
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedAppointments = filteredAppointments.slice(start, end);

    if (paginatedAppointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhum agendamento encontrado.</td></tr>';
        return;
    }

    tbody.innerHTML = paginatedAppointments.map(appointment => `
        <tr>
            <td>${appointment.nome}</td>
            <td>${appointment.telefone}</td>
            <td>${formatDateToBrazilian(appointment.data)}</td>
            <td>${appointment.hora}</td>
            <td>${Array.isArray(appointment.servicos) ? appointment.servicos.join(', ') : (appointment.servicos || 'N/A')}</td>
            <td>R$ ${parseFloat(appointment.total_price || 0).toFixed(2)}</td>
            <td>
                <span class="status-badge status-${appointment.status.toLowerCase()}">
                    ${appointment.status}
                </span>
            </td>
            <td>
                <div class="actions-menu">
                    <button class="action-button" onclick="toggleActionsDropdown(this)">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="actions-dropdown">
                        <div class="action-item" onclick="showDetailsModal('${appointment.id}')">
                            <i class="fas fa-info-circle"></i> Detalhes
                        </div>
                        <div class="action-item" onclick="showStatusModal('${appointment.id}')">
                            <i class="fas fa-edit"></i> Alterar Status
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    `).join('');
}

// Renderizar paginação
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    let paginationHTML = '';
    
    if (totalPages > 1) {
        if (currentPage > 1) {
            paginationHTML += `
                <button onclick="changePage(${currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
        }

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - 2 && i <= currentPage + 2)
            ) {
                paginationHTML += `
                    <button class="${i === currentPage ? 'active' : ''}"
                            onclick="changePage(${i})">
                        ${i}
                    </button>
                `;
            } else if (
                i === currentPage - 3 ||
                i === currentPage + 3
            ) {
                paginationHTML += `<span>...</span>`;
            }
        }

        if (currentPage < totalPages) {
            paginationHTML += `
                <button onclick="changePage(${currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }
    }

    pagination.innerHTML = paginationHTML;
}

// Mudar página
function changePage(page) {
    currentPage = page;
    applyFiltersAndSort();
}

// Modal de detalhes
function showDetailsModal(appointmentId) {
    const appointment = agendamentos.find(a => a.id === appointmentId);
    if (!appointment) return;

    const modalContent = document.querySelector('#detailsModal .appointment-details');
    modalContent.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Nome:</span>
            <span class="detail-value">${appointment.nome}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Telefone:</span>
            <span class="detail-value">${appointment.telefone}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Data:</span>
            <span class="detail-value">${formatDateToBrazilian(appointment.data)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Hora:</span>
            <span class="detail-value">${appointment.hora}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Serviços:</span>
            <span class="detail-value">${Array.isArray(appointment.servicos) ? appointment.servicos.join(', ') : (appointment.servicos || 'N/A')}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Valor Total:</span>
            <span class="detail-value">R$ ${parseFloat(appointment.total_price || 0).toFixed(2)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Duração:</span>
            <span class="detail-value">${appointment.total_duration || 0} minutos</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value">
                <span class="status-badge status-${appointment.status.toLowerCase()}">
                    ${appointment.status}
                </span>
            </span>
        </div>
        ${appointment.observacoes ? `
        <div class="detail-row">
            <span class="detail-label">Observações:</span>
            <span class="detail-value">${appointment.observacoes}</span>
        </div>
        ` : ''}
    `;

    toggleModal('detailsModal', true);
}

// Modal de status
let currentAppointmentId = null;

function showStatusModal(appointmentId) {
    currentAppointmentId = appointmentId;
    const appointment = agendamentos.find(a => a.id === appointmentId);
    if (!appointment) return;

    document.getElementById('newStatus').value = appointment.status.toLowerCase();
    document.getElementById('statusNote').value = appointment.observacoes || '';
    toggleModal('statusModal', true);
}

// Salvar alterações de status
function saveStatusChanges() {
    if (!currentAppointmentId) return;

    const newStatus = document.getElementById('newStatus').value;
    const statusNote = document.getElementById('statusNote').value;

    fetch('backend/update_status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id: currentAppointmentId, 
            status: newStatus,
            observacoes: statusNote
        })
    })
    .then(res => res.json())
    .then(() => {
        loadAppointments();
        toggleModal('statusModal', false);
    })
    .catch(error => {
        console.error('Erro ao atualizar status:', error);
        alert('Houve um erro ao atualizar o status. Por favor, tente novamente.');
    });
}

// Exportar dados
function exportData() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value.toLowerCase();
    const dateFilter = document.getElementById('dateFilter').value;

    let dataToExport = agendamentos;

    if (searchQuery || statusFilter || dateFilter) {
        dataToExport = agendamentos.filter(appointment => {
            const matchesSearch = !searchQuery || 
                appointment.nome.toLowerCase().includes(searchQuery) ||
                appointment.telefone.includes(searchQuery);

            const matchesStatus = !statusFilter || 
                appointment.status.toLowerCase() === statusFilter;

            const matchesDate = !dateFilter || 
                appointment.data === formatDateForComparison(dateFilter);

            return matchesSearch && matchesStatus && matchesDate;
        });
    }

    const csv = [
        ['Nome', 'Telefone', 'Data', 'Hora', 'Serviços', 'Valor', 'Status', 'Observações', 'Duração'],
        ...dataToExport.map(appointment => [
            appointment.nome,
            appointment.telefone,
            formatDateToBrazilian(appointment.data),
            appointment.hora,
            Array.isArray(appointment.servicos) ? appointment.servicos.join(', ') : (appointment.servicos || 'N/A'),
            `R$ ${parseFloat(appointment.total_price || 0).toFixed(2)}`,
            appointment.status,
            appointment.observacoes || '',
            `${appointment.total_duration || 0} minutos`
        ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `agendamentos_${formatDateToBrazilian(new Date().toISOString().split('T')[0])}.csv`;
    link.click();
}

// Utilitários
function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    modal.classList.toggle('show', show);

    if (show) {
        // Fechar modal ao clicar fora
        modal.onclick = function(event) {
            if (event.target === modal) {
                toggleModal(modalId, false);
            }
        };
    }
}

function toggleActionsDropdown(button) {
    const dropdown = button.nextElementSibling;
    dropdown.classList.toggle('show');

    // Fechar outros dropdowns abertos
    document.querySelectorAll('.actions-dropdown.show').forEach(openDropdown => {
        if (openDropdown !== dropdown) {
            openDropdown.classList.remove('show');
        }
    });
}

function formatDateToBrazilian(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
}

function formatDateForComparison(brDate) {
    const [day, month, year] = brDate.split('/');
    return `${year}-${month}-${day}`;
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados iniciais
    loadAppointments();

    // Event listeners
    document.getElementById('searchInput').addEventListener('input', applyFiltersAndSort);
    document.getElementById('statusFilter').addEventListener('change', applyFiltersAndSort);
    document.getElementById('dateFilter').addEventListener('change', applyFiltersAndSort);
    document.getElementById('exportButton').addEventListener('click', exportData);
    document.getElementById('saveStatus').addEventListener('click', saveStatusChanges);

    // Logout
    document.getElementById('logoutBtn').onclick = function(e) {
        e.preventDefault();
        localStorage.removeItem('adminLogged');
        window.location.href = 'login.html';
    };

    // Fechar modais
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            toggleModal(modal.id, false);
        });
    });

    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.actions-menu')) {
            document.querySelectorAll('.actions-dropdown.show').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });

    // Ordenação
    document.querySelectorAll('th').forEach(th => {
        if (th.querySelector('.fa-sort')) {
            th.addEventListener('click', () => {
                const column = th.textContent.trim().toLowerCase().split(' ')[0];
                if (sortConfig.column === column) {
                    sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    sortConfig.column = column;
                    sortConfig.direction = 'asc';
                }
                applyFiltersAndSort();
            });
        }
    });
});
