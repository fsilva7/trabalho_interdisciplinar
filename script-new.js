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
    }
    
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

    // Initialize selected services
    let selectedServices = new Set();
    let totalPrice = 0;
    let totalDuration = 0;

    // Create service selection interface
    const servicosPorSetor = window.serviceCategories;
    const servicesContainer = document.createElement('div');
    servicesContainer.className = 'services-container';

    Object.entries(servicosPorSetor[sector]).forEach(([categoria, servicos]) => {
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
                
                // Update time slots when services change
                if (window.timeSlotManager && dataInput.value) {
                    window.timeSlotManager.updateTimeSlots(dataInput.value);
                }
            });

            servicesList.appendChild(serviceCard);
        });

        categoryContainer.appendChild(servicesList);
        servicesContainer.appendChild(categoryContainer);
    });

    servicesSection.appendChild(servicesContainer);

    function updateBookingSummary() {
        const summary = [];
        let services = [];

        selectedServices.forEach(id => {
            Object.values(servicosPorSetor[sector]).forEach(categoria => {
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

        selectedServicesInput.value = JSON.stringify(services);
        totalPriceInput.value = totalPrice;
        totalDurationInput.value = totalDuration;

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

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (selectedServices.size === 0) {
            showError('Por favor, selecione pelo menos um serviço');
            return;
        }

        const formData = {
            nome: document.getElementById('nome').value,
            telefone: telefoneInput.value.replace(/\D/g, ''),
            data: dataInput.value,
            hora: horaInput.value,
            servicos: selectedServices,
            totalPrice: totalPrice,
            totalDuration: totalDuration
        };

        // Basic validations
        if (!formData.nome || formData.nome.trim().length < 3) {
            showError('Por favor, insira um nome válido');
            return;
        }

        if (formData.telefone.length !== 11) {
            showError('Por favor, insira um número de telefone válido com 11 dígitos');
            return;
        }

        if (!formData.data || !formData.hora) {
            showError('Por favor, selecione uma data e horário');
            return;
        }

        // Disable submit button during submission
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
                selectedServices.clear();
                totalPrice = 0;
                totalDuration = 0;
                updateBookingSummary();
                showConfirmation();
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
});
