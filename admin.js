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

        const params = new URLSearchParams();
        if (status && status !== 'todos') {
            params.append('status', status);
        }
        if (date) {
            params.append('date', date);
        }

        fetch('backend/list_appointments.php?' + params.toString())
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(appointments => {
                tableBody.innerHTML = '';
                if (!Array.isArray(appointments) || appointments.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="7" class="no-appointments">
                                Nenhum agendamento encontrado
                            </td>
                        </tr>
                    `;
                    return;
                }
                // Ordena do mais recente para o mais antigo (data/hora decrescente)
                appointments.sort((a, b) => {
                    // data: dd/mm/yyyy
                    const [da, ma, ya] = a.data.split('/');
                    const [db, mb, yb] = b.data.split('/');
                    const dateA = new Date(`${ya}-${ma}-${da}T${a.hora || '00:00'}`);
                    const dateB = new Date(`${yb}-${mb}-${db}T${b.hora || '00:00'}`);
                    return dateB - dateA;
                });
                // ...continua renderização...
                let filtered = appointments;
                if (status) {
                    filtered = appointments.filter(app => app.status && app.status.toLowerCase() === status.toLowerCase());
                }
                filtered.forEach((appointment, index) => {
                    const tr = document.createElement('tr');
                    tr.style.setProperty('--row-index', index);
                    tr.innerHTML = `
                        <td>${appointment.nome}</td>
                        <td>${appointment.telefone}</td>
                        <td>${appointment.data}</td>
                        <td>${appointment.hora}</td>
                        <td>${appointment.services ? appointment.services.split(',').map(s => `<span class='service-badge'>${s}</span>`).join(' ') : ''}</td>
                        <td>R$ ${appointment.total_price || ''}</td>
                        <td><span class="status-badge status-${appointment.status.toLowerCase()}">${appointment.status}</span></td>
                    `;
                    tableBody.appendChild(tr);
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
