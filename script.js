document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('appointmentForm');
    const telefoneInput = document.getElementById('telefone');
    const dataInput = document.getElementById('data');
    const horaInput = document.getElementById('hora');
    const confirmationMessage = document.getElementById('confirmationMessage');    // Inicializar Flatpickr para seleção de data
    flatpickr(dataInput, {
        dateFormat: "Y-m-d",
        minDate: "today",
        disable: [
            function(date) {
                // Desabilitar domingos (0) e sábados (6)
                return (date.getDay() === 0);
            }
        ],
        locale: {
            firstDayOfWeek: 0
        },
        onChange: function(selectedDates, dateStr) {
            generateTimeSlots(dateStr);
        }
    });

    // Gerar opções de horário para dropdown customizado
    function generateTimeSlots(selectedDate) {
        const dropdownMenu = document.getElementById('dropdownHorarios');
        const dropdownToggle = document.getElementById('dropdownMenuButton');
        const horaInput = document.getElementById('hora');
        // Horários fixos das 09:00 às 16:00
        const horarios = [
            '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
        ];
        dropdownMenu.innerHTML = '';
        dropdownToggle.textContent = 'Selecione um horário';
        horaInput.value = '';

        const today = new Date();
        // Corrigir para comparar apenas datas, não datas e horas
        const selected = new Date(selectedDate + 'T00:00:00');
        const isToday = today.toISOString().slice(0, 10) === selectedDate;
        let hasOption = false;

        horarios.forEach(timeStr => {
            let show = true;
            if (isToday) {
                const [h, m] = timeStr.split(':').map(Number);
                // Corrigir: só mostrar horários futuros para hoje
                if (h < today.getHours() || (h === today.getHours() && m <= today.getMinutes())) {
                    show = false;
                }
            }
            if (show) {
                hasOption = true;
                const option = document.createElement('a');
                option.className = 'dropdown-item';
                option.textContent = timeStr;
                option.href = '#';
                option.onclick = function(e) {
                    e.preventDefault();
                    dropdownToggle.textContent = timeStr;
                    horaInput.value = timeStr;
                    dropdownMenu.classList.remove('show');
                };
                dropdownMenu.appendChild(option);
            }
        });
        if (!hasOption) {
            const noOption = document.createElement('span');
            noOption.className = 'dropdown-item disabled';
            noOption.textContent = 'Nenhum horário disponível';
            dropdownMenu.appendChild(noOption);
        }
    }

    // Dropdown toggle (corrigido para funcionar após DOM pronto)
    const toggle = document.getElementById('dropdownMenuButton');
    const menu = document.getElementById('dropdownHorarios');
    if (toggle && menu) {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            menu.classList.toggle('show');
        });
        document.addEventListener('click', function(e) {
            if (!toggle.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
    }

    // Atualizar Flatpickr para não permitir datas passadas
    flatpickr(dataInput, {
        dateFormat: "Y-m-d",
        minDate: "today",
        disable: [
            function(date) {
                // Desabilitar domingos (0)
                return (date.getDay() === 0);
            }
        ],
        locale: {
            firstDayOfWeek: 0
        },
        onChange: function(selectedDates, dateStr) {
            generateTimeSlots(dateStr);
        }
    });

    // Adicionar animação ao formulário
    form.classList.add('fade-in');

    // Máscara para o telefone
    telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            if (value.length > 2) {
                value = '(' + value.substring(0,2) + ') ' + value.substring(2);
            }
            if (value.length > 9) {
                value = value.substring(0,9) + '-' + value.substring(9);
            }
            e.target.value = value;
        }
    });

    // Validação personalizada do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            nome: document.getElementById('nome').value,
            telefone: telefoneInput.value.replace(/\D/g, ''),
            data: dataInput.value,
            hora: horaInput.value
        };

        // Validar telefone
        if (formData.telefone.length < 10 || formData.telefone.length > 11) {
            showError('Por favor, insira um número de telefone válido');
            return;
        }

        // Validar data e hora
        const dataHora = new Date(formData.data + 'T' + formData.hora);
        const agora = new Date();
        
        if (dataHora < agora) {
            showError('Por favor, selecione uma data e hora futura');
            return;
        }

        const hora = parseInt(formData.hora.split(':')[0]);
        if (hora < 8 || hora >= 18) {
            showError('Por favor, selecione um horário entre 8:00 e 18:00');
            return;
        }

        // Desabilitar o botão durante o envio
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agendando...';

        fetch('backend/create_appointment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                form.reset();
                showConfirmation();
                
                // Scroll suave até a mensagem de confirmação
                confirmationMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(data.error || 'Erro ao realizar agendamento');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            showError('Erro ao realizar agendamento: ' + error.message);
        })
        .finally(() => {
            // Restaurar o botão
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        });
    });

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        form.insertBefore(errorDiv, form.firstChild);

        setTimeout(() => {
            errorDiv.classList.add('fade-out');
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
    }

    function showConfirmation() {
        confirmationMessage.style.display = 'block';
        confirmationMessage.classList.add('fade-in');
        
        setTimeout(() => {
            confirmationMessage.classList.add('fade-out');
            setTimeout(() => {
                confirmationMessage.style.display = 'none';
                confirmationMessage.classList.remove('fade-out', 'fade-in');
            }, 300);
        }, 5000);
    }

    // Adicionar animação aos campos do formulário
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('input-focused');
        });
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('input-focused');
        });
    });

    // Função para carregar e exibir agendamentos
    function carregarAgendamentos() {
        const lista = document.getElementById('appointmentsList');
        if (!lista) return;
        lista.innerHTML = '<p>Carregando agendamentos...</p>';
        fetch('backend/list_appointments.php')
            .then(res => res.json())
            .then(agendamentos => {
                if (!Array.isArray(agendamentos) || agendamentos.length === 0) {
                    lista.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
                    return;
                }
                lista.innerHTML = '';
                agendamentos.forEach(ag => {
                    const item = document.createElement('div');
                    item.className = 'appointment-item';
                    item.innerHTML = `
                        <strong>${ag.nome}</strong> - ${ag.telefone}<br>
                        <span>${ag.data} às ${ag.hora} | ${ag.servico} | <b>${ag.status}</b></span>
                        <button class="delete-btn" data-id="${ag.id}"><i class="fas fa-trash"></i> Excluir</button>
                    `;
                    lista.appendChild(item);
                });
            })
            .catch(() => {
                lista.innerHTML = '<p>Erro ao carregar agendamentos.</p>';
            });
    }

    // Evento para deletar agendamento
    if (document.getElementById('appointmentsList')) {
        document.getElementById('appointmentsList').addEventListener('click', function(e) {
            if (e.target.closest('.delete-btn')) {
                const btn = e.target.closest('.delete-btn');
                const id = btn.getAttribute('data-id');
                if (confirm('Tem certeza que deseja excluir este agendamento?')) {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Excluindo...';
                    fetch('backend/delete_appointment.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            carregarAgendamentos();
                        } else {
                            alert('Erro ao excluir: ' + (data.error || 'Erro desconhecido'));
                            btn.disabled = false;
                            btn.innerHTML = '<i class="fas fa-trash"></i> Excluir';
                        }
                    })
                    .catch(() => {
                        alert('Erro ao excluir agendamento.');
                        btn.disabled = false;
                        btn.innerHTML = '<i class="fas fa-trash"></i> Excluir';
                    });
                }
            }
        });
        // Carregar agendamentos ao abrir a página
        carregarAgendamentos();
    }

    // Corrigir: garantir que generateTimeSlots seja chamado ao abrir a página com a data atual
    if (dataInput.value) {
        generateTimeSlots(dataInput.value);
    } else {
        const hoje = new Date();
        const dataHoje = hoje.toISOString().slice(0, 10);
        dataInput.value = dataHoje;
        generateTimeSlots(dataHoje);
    }
});