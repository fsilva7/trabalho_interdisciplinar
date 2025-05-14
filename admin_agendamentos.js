// Redireciona para login se não estiver logado
if (!localStorage.getItem('adminLogged')) {
    window.location.href = 'login.html';
}

function renderAgendamentos() {
    fetch('backend/list_appointments.php')
        .then(res => res.json())
        .then(agendamentos => {
            const tbody = document.getElementById('adminAgendamentosBody');
            tbody.innerHTML = '';
            if (!Array.isArray(agendamentos) || agendamentos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">Nenhum agendamento encontrado.</td></tr>';
                return;
            }
            agendamentos.forEach(ag => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${ag.nome}</td>
                    <td>${ag.telefone}</td>
                    <td>${ag.data}</td>
                    <td>${ag.hora}</td>
                    <td class="status-${ag.status.toLowerCase()}">${ag.status}</td>
                    <td>
                        <button class="admin-action-btn confirm" data-id="${ag.id}" data-status="Confirmado">Confirmar</button>
                        <button class="admin-action-btn cancel" data-id="${ag.id}" data-status="Cancelado">Cancelar</button>
                        <button class="admin-action-btn pendente" data-id="${ag.id}" data-status="Pendente">Pendente</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        });
}

document.addEventListener('DOMContentLoaded', function() {
    renderAgendamentos();
    document.getElementById('logoutBtn').onclick = function(e) {
        e.preventDefault();
        localStorage.removeItem('adminLogged');
        window.location.href = 'login.html';
    };
    // Botão para ir ao painel administrativo
    const painelBtn = document.createElement('a');
    painelBtn.href = 'admin.html';
    painelBtn.className = 'back-link';
    painelBtn.innerHTML = '<i class="fas fa-cogs"></i> Painel Administrativo';
    document.querySelector('nav').appendChild(painelBtn);
    document.getElementById('adminAgendamentosBody').onclick = function(e) {
        if (e.target.classList.contains('admin-action-btn')) {
            const id = e.target.getAttribute('data-id');
            const status = e.target.getAttribute('data-status');
            fetch('backend/update_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            })
            .then(res => res.json())
            .then(() => renderAgendamentos());
        }
    };
});
