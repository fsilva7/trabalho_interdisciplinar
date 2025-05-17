document.addEventListener('DOMContentLoaded', function() {
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const refreshButton = document.getElementById('refreshButton');
    const tableBody = document.getElementById('appointmentsTableBody');

    // Inicializar Flatpickr para o filtro de data
    flatpickr(dateFilter, {
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr) {
            loadAppointments();
        }
    });

    // Configurar data inicial como hoje
    const hoje = new Date().toISOString().split('T')[0];
    dateFilter.value = hoje;

    // Carregar agendamentos
    function loadAppointments() {
        console.log('Carregando agendamentos...');
        const status = statusFilter.value;
        const date = dateFilter.value;

        fetch('backend/list_appointments.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(appointments => {
                console.log('Agendamentos recebidos:', appointments);
                tableBody.innerHTML = '';                // Filtrar agendamentos
                let filteredAppointments = appointments;
                if (status !== 'todos') {
                    filteredAppointments = appointments.filter(app => 
                        app.status.toLowerCase() === status.toLowerCase()
                    );
                }
                if (date) {
                    filteredAppointments = filteredAppointments.filter(app => 
                        app.data === formatDate(date)
                    );
                }

                if (filteredAppointments.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="7" class="no-appointments">
                                Nenhum agendamento encontrado
                            </td>
                        </tr>
                    `;
                    return;
                }                filteredAppointments.forEach((appointment, index) => {
                    const tr = document.createElement('tr');
                    tr.style.setProperty('--row-index', index);
                    tr.innerHTML = `
                        <td>${appointment.nome}</td>
                        <td>${appointment.telefone}</td>
                        <td>${appointment.data}</td>
                        <td>${appointment.hora}</td>
                        <td>${appointment.servico}</td>
                        <td class="status-cell status-${appointment.status.toLowerCase()}">
                            <span class="status-indicator"></span>
                            <select class="status-select" data-id="${appointment.id}">
                                <option value="Pendente" ${appointment.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                                <option value="Confirmado" ${appointment.status === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
                                <option value="Cancelado" ${appointment.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                            </select>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn delete-btn" data-id="${appointment.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    tableBody.appendChild(tr);

                    // Adicionar event listener para mudança de status
                    const statusSelect = tr.querySelector('.status-select');
                    statusSelect.addEventListener('change', function(e) {
                        updateStatus(appointment.id, e.target.value);
                    });

                    // Adicionar event listener para deletar
                    const deleteBtn = tr.querySelector('.delete-btn');
                    deleteBtn.addEventListener('click', function() {
                        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
                            deleteAppointment(appointment.id);
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Erro ao carregar agendamentos:', error);
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="color: red;">
                            Erro ao carregar agendamentos: ${error.message}
                        </td>
                    </tr>
                `;
            });
    }

    // Atualizar status do agendamento
    function updateStatus(id, newStatus) {
        fetch('backend/update_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, status: newStatus })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const statusCell = document.querySelector(`select[data-id="${id}"]`).parentElement;
                statusCell.className = `status-cell status-${newStatus.toLowerCase()}`;
            } else {
                alert('Erro ao atualizar status: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao atualizar status');
        });
    }

    // Deletar agendamento
    function deleteAppointment(id) {
        fetch('backend/delete_appointment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadAppointments();
            } else {
                alert('Erro ao deletar agendamento: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao deletar agendamento');
        });
    }

    // Formatar data para o formato brasileiro
    function formatDate(date) {
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    }

    // Event listeners para filtros
    statusFilter.addEventListener('change', loadAppointments);
    dateFilter.addEventListener('change', loadAppointments);
    refreshButton.addEventListener('click', loadAppointments);

    // Carregar agendamentos iniciais
    loadAppointments();
});
