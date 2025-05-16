document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('appointmentForm');
    const telefoneInput = document.getElementById('telefone');
    const dataInput = document.getElementById('data');
    const horaInput = document.getElementById('hora');
    const selectedServicesInput = document.getElementById('selectedServices');
    const totalPriceInput = document.getElementById('totalPrice');
    const totalDurationInput = document.getElementById('totalDuration');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const summaryContent = document.querySelector('.summary-content');
    
    // Initialize service selector based on URL parameter
    const params = new URLSearchParams(window.location.search);
    const sector = params.get('setor');
    const servicesSection = document.querySelector('.services-section');
      if (sector === 'barbearia') {
        document.body.classList.add('barbershop-theme');
        servicesSection.appendChild(createServiceSelector(SERVICE_TYPES.BARBERSHOP));
    } else if (sector === 'salao') {
        document.body.classList.add('salon-theme');
        servicesSection.appendChild(createServiceSelector(SERVICE_TYPES.SALON));
    }

    // Function to update booking summary
    function updateBookingSummary(services, price, duration) {
        const summary = [];
        services.forEach(service => {
            summary.push(`
                <div class="summary-item">
                    <span class="service-name">${service.name}</span>
                    <span class="service-price">R$ ${service.price.toFixed(2)}</span>
                </div>
            `);
        });

        summaryContent.innerHTML = `
            <div class="summary-services">
                ${summary.join('')}
            </div>
            <div class="summary-total">
                <div class="total-duration">
                    <i class="fas fa-clock"></i> Duração Total: ${duration} min
                </div>
                <div class="total-price">
                    <i class="fas fa-tag"></i> Total: R$ ${price.toFixed(2)}
                </div>
            </div>
        `;

        selectedServicesInput.value = JSON.stringify(services);
        totalPriceInput.value = price;
        totalDurationInput.value = duration;
    }

    // Inicializar Flatpickr para seleção de data
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
    }    // Os serviços foram movidos para services.js
    const servicosPorSetor = window.serviceCategories;

    // Initialize selected services
    let selectedServices = new Set();
    let totalPrice = 0;
    let totalDuration = 0;

    // Create service selection interface
    const setor = params.get('setor') || 'barbearia';
    const servicesContainer = document.createElement('div');
    servicesContainer.className = 'services-container';

    Object.entries(servicosPorSetor[setor]).forEach(([categoria, servicos]) => {
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'service-category';
        categoryContainer.innerHTML = `<h3>${categoria.charAt(0).toUpperCase() + categoria.slice(1)}</h3>`;

        const servicesList = document.createElement('div');
        servicesList.className = 'services-list';

        servicos.forEach(servico => {
            const serviceCard = document.createElement('div');
            serviceCard.className = 'service-card';
            serviceCard.innerHTML = `
                <div class="service-info">
                    <h4>${servico.nome}</h4>
                    <p class="price">R$ ${servico.preco.toFixed(2)}</p>
                    <p class="duration"><i class="fas fa-clock"></i> ${servico.duracao} min</p>
                </div>
                <button class="select-service" data-id="${servico.id}">
                    <i class="fas fa-plus"></i>
                </button>
            `;

            serviceCard.querySelector('button').addEventListener('click', () => {
                const button = serviceCard.querySelector('button');
                if (selectedServices.has(servico.id)) {
                    selectedServices.delete(servico.id);
                    totalPrice -= servico.preco;
                    totalDuration -= servico.duracao;
                    button.innerHTML = '<i class="fas fa-plus"></i>';
                    serviceCard.classList.remove('selected');
                } else {
                    selectedServices.add(servico.id);
                    totalPrice += servico.preco;
                    totalDuration += servico.duracao;
                    button.innerHTML = '<i class="fas fa-check"></i>';
                    serviceCard.classList.add('selected');
                }
                updateBookingSummary();
            });

            servicesList.appendChild(serviceCard);
        });

        categoryContainer.appendChild(servicesList);
        servicesContainer.appendChild(categoryContainer);
    });

    document.querySelector('.services-section').appendChild(servicesContainer);

    function updateBookingSummary() {
        const summary = [];
        let services = [];

        selectedServices.forEach(id => {
            Object.values(servicosPorSetor[setor]).forEach(categoria => {
                const servico = categoria.find(s => s.id === id);
                if (servico) {
                    services.push({
                        id: servico.id,
                        name: servico.nome,
                        price: servico.preco,
                        duration: servico.duracao
                    });
                }
            });
        });

        document.getElementById('selectedServices').value = JSON.stringify(services);
        document.getElementById('totalPrice').value = totalPrice;
        document.getElementById('totalDuration').value = totalDuration;

        const summaryContent = document.querySelector('.summary-content');
        if (services.length === 0) {
            summaryContent.innerHTML = '<p>Nenhum serviço selecionado</p>';
            return;
        }

        summaryContent.innerHTML = `
            <div class="selected-services">
                ${services.map(s => `
                    <div class="summary-item">
                        <span class="service-name">${s.name}</span>
                        <span class="service-price">R$ ${s.price.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="summary-total">
                <div class="total-duration">
                    <i class="fas fa-clock"></i> Duração Total: ${totalDuration} min
                </div>
                <div class="total-price">
                    <i class="fas fa-tag"></i> Total: R$ ${totalPrice.toFixed(2)}
                </div>
            </div>
        `;
    }

    // Ajustar slots disponíveis com base na duração total dos serviços selecionados
    const slotDuration = setor === 'barbearia' ? 30 : 60;
});