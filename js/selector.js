// Create selector for service type
const createServiceSelector = (sectorType) => {
    const container = document.createElement('div');
    container.className = `service-selector ${sectorType}-selector`;
    
    const services = ServiceUtils.getServicesBySector(sectorType);
    if (!services) {
        ServiceUtils.showError('Tipo de serviço inválido', container);
        return container;
    }
    
    // Estado local para controlar seleções e totais
    const state = {
        totalPrice: 0,
        totalDuration: 0,
        selectedServices: new Set()
    };

    // Função para atualizar o estado visual do item
    const updateItemState = (serviceItem, input, isSelected) => {
        if (isSelected) {
            serviceItem.classList.add('selected');
        } else {
            serviceItem.classList.remove('selected');
            input.checked = false;
        }
    };

    // Função para gerenciar a seleção de serviços
    const handleServiceSelection = (input, service, category, serviceItem) => {
        const isExclusive = category === 'Combos' || EXCLUSIVE_CATEGORIES.includes(category);
        
        if (input.checked) {
            if (ServiceUtils.checkServiceCompatibility(state.selectedServices, service, category)) {
                if (isExclusive) {
                    // Limpar outros serviços da mesma categoria
                    const currentServices = Array.from(state.selectedServices);
                    currentServices.forEach(id => {
                        const existingService = ServiceUtils.findServiceById(id);
                        if (existingService) {
                            const existingCategory = ServiceUtils.getServiceCategory(id);
                            if (existingCategory === category || 
                                (category === 'Combos' && !id.includes('combo'))) {
                                const currentItem = document.querySelector(`[data-service-id="${id}"]`);
                                const currentInput = document.getElementById(id);
                                if (currentInput && currentItem) {
                                    state.selectedServices.delete(id);
                                    state.totalPrice -= existingService.price;
                                    state.totalDuration -= existingService.duration;
                                    updateItemState(currentItem, currentInput, false);
                                }
                            }
                        }
                    });
                }
                
                // Adicionar novo serviço
                state.selectedServices.add(service.id);
                state.totalPrice += service.price;
                state.totalDuration += service.duration;
                updateItemState(serviceItem, input, true);
            } else {
                input.checked = false;
                ServiceUtils.showError('Este serviço não pode ser combinado com os já selecionados', container);
            }
        } else {
            // Remover serviço
            state.selectedServices.delete(service.id);
            state.totalPrice -= service.price;
            state.totalDuration -= service.duration;
            updateItemState(serviceItem, input, false);
        }
        
        // Atualizar resumo do agendamento
        updateBookingSummary(
            Array.from(state.selectedServices),
            state.totalPrice,
            state.totalDuration
        );
    };

    // Criar seções para cada categoria
    Object.entries(services).forEach(([category, items]) => {
        const section = document.createElement('div');
        section.className = 'service-category';
        
        const title = document.createElement('h3');
        const icon = ServiceUtils.getCategoryIcon(category);
        title.innerHTML = `<i class="${icon}"></i> ${category}`;
        section.appendChild(title);

        const serviceList = document.createElement('div');
        serviceList.className = 'service-list';

        // Criar itens de serviço
        items.forEach(service => {
            const serviceItem = document.createElement('div');
            serviceItem.className = 'service-item';
            serviceItem.dataset.serviceId = service.id;
            
            const isExclusive = category === 'Combos' || EXCLUSIVE_CATEGORIES.includes(category);
            
            const input = document.createElement('input');
            input.type = isExclusive ? 'radio' : 'checkbox';
            input.id = service.id;
            input.name = isExclusive ? `category-${category.toLowerCase().replace(/\s+/g, '-')}` : service.id;

            const label = document.createElement('label');
            label.htmlFor = service.id;
            label.innerHTML = `
                <div class="service-info">
                    <span class="service-name">${service.name}</span>
                    <div class="service-details">
                        <span class="service-duration">
                            <i class="fas fa-clock"></i> ${service.duration} min
                        </span>
                        <span class="service-price">
                            <i class="fas fa-tag"></i> R$ ${service.price.toFixed(2)}
                        </span>
                    </div>
                </div>
            `;

            // Adicionar event listeners
            input.addEventListener('change', () => {
                handleServiceSelection(input, service, category, serviceItem);
            });

            // Permitir clique em todo o item
            serviceItem.addEventListener('click', (e) => {
                if (e.target !== input) {
                    input.checked = !input.checked;
                    handleServiceSelection(input, service, category, serviceItem);
                }
            });

            serviceItem.appendChild(input);
            serviceItem.appendChild(label);
            serviceList.appendChild(serviceItem);
        });

        section.appendChild(serviceList);
        container.appendChild(section);
    });

    return container;
};

// Função para atualizar o resumo do agendamento
function updateBookingSummary(selectedIds, totalPrice, totalDuration) {
    const summaryContent = document.querySelector('.summary-content');
    if (!summaryContent) return;

    if (selectedIds.length === 0) {
        summaryContent.innerHTML = '<p class="empty-selection">Nenhum serviço selecionado</p>';
        return;
    }

    const selectedServices = selectedIds
        .map(id => ServiceUtils.findServiceById(id))
        .filter(Boolean);    summaryContent.innerHTML = `
        <div class="selected-services">
            ${selectedServices.map(service => `
                <div class="summary-item">
                    <span class="service-name">${service.name}</span>
                    <div class="service-details">
                        <span class="service-duration">
                            <i class="fas fa-clock"></i> ${service.duration} min
                        </span>
                        <span class="service-price">
                            <i class="fas fa-tag"></i> R$ ${service.price.toFixed(2)}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="summary-total">
            <div class="total-duration">
                <i class="fas fa-hourglass-half"></i> Tempo Total: ${totalDuration} min
            </div>
            <div class="total-price">
                <i class="fas fa-money-bill-wave"></i> Total: R$ ${totalPrice.toFixed(2)}
            </div>
        </div>
    `;

    // Update hidden form fields    document.getElementById('selectedServices').value = JSON.stringify(selectedServices);
    document.getElementById('totalPrice').value = totalPrice;
    document.getElementById('totalDuration').value = totalDuration;
}

// Exportar para uso global
window.createServiceSelector = createServiceSelector;
