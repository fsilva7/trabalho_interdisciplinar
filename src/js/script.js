document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando aplicação...');
    
    // Verificar dependências necessárias
    const dependencies = ['ServiceUtils', 'SERVICES', 'SERVICE_TYPES', 'createServiceSelector'];
    for (const dep of dependencies) {
        if (typeof window[dep] === 'undefined') {
            console.error(`Dependência ${dep} não está carregada`);
            const servicesSection = document.querySelector('.services-section');
            if (servicesSection) {
                servicesSection.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Erro ao carregar dependências. Por favor, recarregue a página.</p>
                        <p class="error-details">Componente faltando: ${dep}</p>
                        <button onclick="window.location.reload()" class="retry-button">
                            <i class="fas fa-sync"></i> Tentar novamente
                        </button>
                    </div>
                `;
            }
            return;
        }
    }
    console.log('Todas as dependências carregadas com sucesso');

    const form = document.getElementById('appointmentForm');
    const telefoneInput = document.getElementById('telefone');
    const dataInput = document.getElementById('data');
    const horaInput = document.getElementById('hora');
    const selectedServicesInput = document.getElementById('selectedServices');
    const totalPriceInput = document.getElementById('totalPrice');
    const totalDurationInput = document.getElementById('totalDuration');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const summaryContent = document.querySelector('.summary-content');

    // Phone number formatting and validation
    if (telefoneInput) {
        const formatPhoneNumber = (value) => {
            value = value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 0) {
                value = '(' + value;
                if (value.length > 3) {
                    value = value.slice(0, 3) + ') ' + value.slice(3);
                }
                if (value.length > 10) {
                    value = value.slice(0, 10) + '-' + value.slice(10);
                }
            }
            return value;
        };

        telefoneInput.addEventListener('input', (e) => {
            e.target.value = formatPhoneNumber(e.target.value);
        });

        telefoneInput.addEventListener('blur', (e) => {
            const value = e.target.value.replace(/\D/g, '');
            if (value.length !== 11) {
                e.target.setCustomValidity('Por favor, insira um número de telefone válido com 11 dígitos');
            } else {
                e.target.setCustomValidity('');
            }
        });
    }      // Initialize service selector based on URL parameter
    const params = new URLSearchParams(window.location.search);
    const sector = params.get('setor') || 'barbearia';  // Default para barbearia
    const servicesSection = document.querySelector('.services-section');

    if (!servicesSection) {
        console.error('Seção de serviços não encontrada');
        return;
    }

    // Show loading indicator
    servicesSection.innerHTML = `
        <div class="loading-message">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Carregando serviços...</p>
        </div>
    `;

    try {
        // Verify all dependencies are loaded again
        if (typeof window.ServiceUtils === 'undefined') {
            throw new Error('ServiceUtils não está carregado');
        }
        if (typeof window.SERVICES === 'undefined') {
            throw new Error('SERVICES não está carregado');
        }
        if (typeof window.SERVICE_TYPES === 'undefined') {
            throw new Error('SERVICE_TYPES não está carregado');
        }
        if (typeof window.createServiceSelector === 'undefined') {
            throw new Error('createServiceSelector não está carregado');
        }

        // Configurar tema e tipo de serviço
        let serviceType;
        if (sector === 'barbearia') {
            document.body.classList.add('barbershop-theme');
            document.body.classList.remove('salon-theme');
            serviceType = window.SERVICE_TYPES.BARBERSHOP;
        } else if (sector === 'salao') {
            document.body.classList.add('salon-theme');
            document.body.classList.remove('barbershop-theme');
            serviceType = window.SERVICE_TYPES.SALON;
        }

        console.log('Criando seletor para:', serviceType);
        const selector = window.createServiceSelector(serviceType);
        if (!selector) {
            throw new Error('Falha ao criar seletor de serviços');
        }

        // Clear any existing content and add the selector
        servicesSection.innerHTML = '';
        servicesSection.appendChild(selector);
        console.log('Seletor de serviços criado com sucesso');

    } catch (error) {
        console.error('Erro ao criar seletor de serviços:', error);
        servicesSection.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Não foi possível carregar os serviços. Por favor, tente novamente mais tarde.</p>
                <p class="error-details">${error.message}</p>
            </div>
        `;
    }

    // Initialize datepicker
    if (dataInput) {
        const fp = flatpickr(dataInput, {
            dateFormat: "Y-m-d",
            minDate: "today",
            locale: {
                firstDayOfWeek: 0
            },
            onChange: function(selectedDates, dateStr) {
                updateAvailableTimeSlots(dateStr);
            }
        });

        // Set initial date to today
        const hoje = new Date();
        const dataHoje = hoje.toISOString().slice(0, 10);
        dataInput.value = dataHoje;
        updateAvailableTimeSlots(dataHoje);
    }

    // Handle form submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (form.checkValidity()) {
                const appointmentData = {
                    nome: document.getElementById('nome').value,
                    telefone: telefoneInput.value,
                    data: dataInput.value,
                    hora: horaInput.value,                    servicos: Array.from(document.querySelectorAll('.service-item.selected')).map(item => {
                        const serviceId = item.querySelector('input[type="checkbox"]').id;
                        const service = window.ServiceUtils.findServiceById(serviceId);
                        console.log('Serviço encontrado:', serviceId, service);
                        return service;
                    }).filter(Boolean),
                    totalPrice: parseFloat(totalPriceInput.value),
                    totalDuration: parseInt(totalDurationInput.value)
                };

                console.log('Dados do agendamento:', appointmentData);
                
                // Show confirmation message
                if (confirmationMessage) {
                    form.style.display = 'none';
                    confirmationMessage.style.display = 'flex';
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 3000);
                }
            }
        });
    }

    // Function to update booking summary
    function updateBookingSummary(selectedIds, totalPrice, totalDuration) {
        const summaryContent = document.querySelector('.summary-content');
        if (!summaryContent) return;

        if (!selectedIds || selectedIds.length === 0) {
            summaryContent.innerHTML = `
                <div class="empty-selection">
                    <i class="fas fa-info-circle"></i>
                    <p>Nenhum serviço selecionado</p>
                    <p class="hint">Selecione os serviços desejados para ver o resumo</p>
                </div>
            `;
            document.getElementById('selectedServices').value = '[]';
            document.getElementById('totalPrice').value = '0';
            document.getElementById('totalDuration').value = '0';
            return;
        }

        const selectedServices = selectedIds
            .map(id => window.ServiceUtils.findServiceById(id))
            .filter(Boolean);

        const servicesHtml = selectedServices.map(service => `
            <div class="summary-item" data-service-id="${service.id}">
                <div class="service-info">
                    <span class="service-name">${service.nome}</span>
                    <div class="service-details">
                        <span class="service-duration" title="Duração">
                            <i class="fas fa-clock"></i> ${service.duracao} min
                        </span>
                        <span class="service-price" title="Preço">
                            <i class="fas fa-tag"></i> R$ ${service.preco.toFixed(2)}
                        </span>
                    </div>
                </div>
                <button class="remove-service" onclick="window.removeService('${service.id}')" title="Remover serviço">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        summaryContent.innerHTML = `
            <div class="selected-services">
                ${servicesHtml}
            </div>
            <div class="summary-total">
                <div class="total-duration" title="Tempo total estimado">
                    <i class="fas fa-hourglass-half"></i> Tempo Total: ${totalDuration} min
                </div>
                <div class="total-price" title="Valor total">
                    <i class="fas fa-money-bill-wave"></i> Total: R$ ${totalPrice.toFixed(2)}
                </div>
            </div>
        `;

        // Update hidden form fields
        document.getElementById('selectedServices').value = JSON.stringify(selectedServices);
        document.getElementById('totalPrice').value = totalPrice;
        document.getElementById('totalDuration').value = totalDuration;
    }

    // Function to remove a service from selection
    window.removeService = function(serviceId) {
        const checkbox = document.getElementById(serviceId);
        if (checkbox) {
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('change'));
        }
    };
});
