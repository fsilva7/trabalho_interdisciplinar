// Create selector for service type
window.createServiceSelector = (sectorType) => {
    try {
        const container = document.createElement('div');
        container.className = 'service-selector';

        // Get services for the sector
        const services = window.SERVICES[sectorType];
        if (!services) {
            throw new Error('Serviços não encontrados');
        }

        // Estado local para controlar seleções
        const state = {
            selectedServices: new Set(),
            totalPrice: 0,
            totalDuration: 0
        };
    try {
        console.log('Criando seletor de serviços...');

        const container = document.createElement('div');
        container.className = `service-selector ${sectorType}-selector`;

        // Validate sector type
        if (!sectorType || typeof sectorType !== 'string') {
            console.warn('Tipo de setor inválido:', sectorType);
            sectorType = window.SERVICE_TYPES.BARBERSHOP;
        }

        sectorType = sectorType.toLowerCase();
        console.log('Tipo de setor normalizado:', sectorType);

        // Get services for the sector
        const services = window.SERVICES[sectorType];
        if (!services) {
            throw new Error('Não foi possível obter os serviços');
        }
        if (Object.keys(services).length === 0) {
            throw new Error('Nenhum serviço disponível para o setor: ' + sectorType);
        }

        console.log('Serviços encontrados:', Object.keys(services).length, 'categorias');

        // Estado local para controlar seleções e totais
        const state = {
            totalPrice: 0,
            totalDuration: 0,
            selectedServices: new Set(),
            isProcessingUpdate: false
        };

        // Criar elementos HTML para cada categoria e serviço
        Object.entries(services).forEach(([category, categoryServices]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'service-category';
            
            // Criar título da categoria
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category;
            categoryDiv.appendChild(categoryTitle);

            // Criar lista de serviços
            const servicesList = document.createElement('div');
            servicesList.className = 'services-list';

            // Adicionar cada serviço
            categoryServices.forEach(service => {
                const serviceItem = document.createElement('div');
                serviceItem.className = 'service-item';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = service.id;
                checkbox.name = 'service';

                const label = document.createElement('label');
                label.htmlFor = service.id;

                const labelText = document.createElement('span');
                labelText.className = 'service-name';
                labelText.textContent = service.nome;

                const price = document.createElement('span');
                price.className = 'service-price';
                price.textContent = `R$ ${service.preco.toFixed(2)}`;

                const duration = document.createElement('span');
                duration.className = 'service-duration';
                duration.textContent = `${service.duracao} min`;

                label.appendChild(labelText);
                label.appendChild(price);
                label.appendChild(duration);

                serviceItem.appendChild(checkbox);
                serviceItem.appendChild(label);

                servicesList.appendChild(serviceItem);

                // Event listener para seleção de serviço
                checkbox.addEventListener('change', function() {
                    if (state.isProcessingUpdate) return;
                    state.isProcessingUpdate = true;

                    try {
                        console.log('Alterando serviço:', service.id, 'Checked:', this.checked);

                        if (this.checked) {
                            // Verificar se o serviço pode ser adicionado                        try {
                            if (!window.ServiceUtils.checkServiceCompatibility(state.selectedServices, service, category)) {
                                console.log('Serviço incompatível:', service.id, 'categoria:', category);
                                this.checked = false;
                                serviceItem.classList.remove('selected');
                                window.ServiceUtils.showError('Este serviço não pode ser combinado com os serviços selecionados', container);
                                return;
                            }
                            }catch (compatibilityError) {
                            console.error('Erro ao verificar compatibilidade:', compatibilityError);
                            this.checked = false;
                            serviceItem.classList.remove('selected');
                            window.ServiceUtils.showError('Erro ao verificar compatibilidade do serviço', container);
                            return;
                        }

                            // Adicionar serviço
                            console.log('Adicionando serviço');
                            state.selectedServices.add(service.id);
                            state.totalPrice += service.preco;
                            state.totalDuration += service.duracao;
                            serviceItem.classList.add('selected');
                        }else {
                            // Remover serviço
                            console.log('Removendo serviço');
                            state.selectedServices.delete(service.id);
                            state.totalPrice -= service.preco;
                            state.totalDuration -= service.duracao;
                            serviceItem.classList.remove('selected');
                        }

                        // Debug do estado atual
                        console.log('Estado atualizado:', {
                            selecionados: Array.from(state.selectedServices),
                            totalPreco: state.totalPrice,
                            totalDuracao: state.totalDuration
                        });

                        // Atualizar resumo do agendamento
                        if (typeof window.updateBookingSummary === 'function') {
                            window.updateBookingSummary(
                                Array.from(state.selectedServices),
                                state.totalPrice,
                                state.totalDuration
                            );
                        } else {
                            console.error('updateBookingSummary não está disponível');
                        }
                    } catch (error) {
                        console.error('Erro ao processar seleção:', error);
                        this.checked = false;
                        serviceItem.classList.remove('selected');
                        window.ServiceUtils.showError('Erro ao processar seleção', container);
                    } finally {
                        state.isProcessingUpdate = false;
                    }
                });
            });

            categoryDiv.appendChild(servicesList);
            container.appendChild(categoryDiv);
        });

        console.log('Seletor de serviços criado com sucesso');
        return container;

    } catch (error) {
        console.error('Erro ao criar seletor de serviços:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>Erro ao carregar serviços</p>
            <div class="error-details">${error.message}</div>
            <button onclick="window.location.reload()" class="retry-button">
                <i class="fas fa-sync"></i> Tentar novamente
            </button>
        `;
        return errorDiv;
    }
};

// Função para atualizar o resumo do agendamento
window.updateBookingSummary = function(selectedIds, totalPrice, totalDuration) {
    const summaryContent = document.querySelector('.summary-content');
    if (!summaryContent) return;

    if (!selectedIds || selectedIds.length === 0) {
        summaryContent.innerHTML = `
            <div class="empty-selection">
                <i class="fas fa-info-circle"></i>
                <p>Nenhum serviço selecionado</p>
            </div>
        `;
        return;
    }

    // Buscar serviços diretamente do objeto SERVICES
    const selectedServices = [];
    for (const id of selectedIds) {
        for (const category in window.SERVICES.barbershop) {
            const service = window.SERVICES.barbershop[category].find(s => s.id === id);
            if (service) {
                selectedServices.push(service);
                break;
            }
        }
    }

    let currentCategory = '';    // Gerar HTML básico para cada serviço selecionado
    const servicesHtml = selectedServices.map(service => `
        <div class="summary-item">
            <p>${service.nome} - R$ ${service.preco.toFixed(2)} (${service.duracao} min)</p>
        </div>
    `).join('');    summaryContent.innerHTML = `
        <div class="selected-services">
            ${servicesHtml}
        </div>
        <div class="summary-total">
            <p>Tempo Total: ${totalDuration} min</p>
            <p>Total: R$ ${totalPrice.toFixed(2)}</p>
        </div>
    `;

    // Update hidden form fields    document.getElementById('selectedServices').value = JSON.stringify(selectedServices);
    document.getElementById('totalPrice').value = totalPrice;
    document.getElementById('totalDuration').value = totalDuration;
}    // Função para remover serviço do resumo de forma segura
function removeService(serviceId) {
    if (!serviceId) {
        console.error('ID do serviço não fornecido');
        return;
    }

    try {
        const input = document.getElementById(serviceId);
        if (!input) {
            console.error(`Input não encontrado para o serviço: ${serviceId}`);
            return;
        }

        // Temporariamente desabilitar o input durante a remoção
        input.disabled = true;
        
        // Garantir que o estado é atualizado corretamente
        const serviceItem = input.closest('.service-item');
        if (serviceItem) {
            const service = ServiceUtils.findServiceById(serviceId);
            if (service) {
                const category = ServiceUtils.getServiceCategory(serviceId);
                if (category) {
                    const wasChecked = input.checked;
                    input.checked = false;

                    // Remover classes visuais
                    serviceItem.classList.remove('selected');
                    
                    // Se o serviço estava selecionado, atualizar estado
                    if (wasChecked) {
                        // Usar função existente para manter consistência
                        handleServiceSelection(input, service, category, serviceItem);
                    }
                }
            }
        }
        
        // Reabilitar o input após a operação
        setTimeout(() => {
            input.disabled = false;
        }, 100);

        // Sincronizar estado global se disponível
        if (typeof state !== 'undefined' && state.sync) {
            state.sync();
        }
    } catch (error) {
        console.error('Erro ao remover serviço:', error);
        // Tentar sincronizar o estado em caso de erro
        if (typeof state !== 'undefined' && state.sync) {
            state.sync();
        }
    }
}

// Exportar para uso global
window.removeService = removeService;
