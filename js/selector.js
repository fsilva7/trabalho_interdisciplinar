// Create selector for service type
const createServiceSelector = (sectorType) => {
    const container = document.createElement('div');
    container.className = `service-selector ${sectorType}-selector`;
    
    const services = ServiceUtils.getServicesBySector(sectorType);
    if (!services) {
        ServiceUtils.showError('Tipo de serviço inválido', container);
        return container;
    }
    
    // Add appropriate title for each sector
    const sectorTitle = document.createElement('h2');
    sectorTitle.className = 'sector-title';
    if (sectorType === SERVICE_TYPES.BARBERSHOP) {
        sectorTitle.innerHTML = '<i class="fas fa-cut"></i> Serviços de Barbearia';
    } else if (sectorType === SERVICE_TYPES.SALON) {
        sectorTitle.innerHTML = '<i class="fas fa-spa"></i> Serviços de Beleza';
    }
    container.appendChild(sectorTitle);

    // Estado local para controlar seleções e totais
    const state = {
        totalPrice: 0,
        totalDuration: 0,
        selectedServices: new Set()
    };

    // Create sections for each category
    Object.entries(services).forEach(([category, items]) => {
        const section = document.createElement('div');
        section.className = 'service-category';
        
        const title = document.createElement('h3');
        title.className = 'category-title';
        title.innerHTML = `<i class="${ServiceUtils.getCategoryIcon(category)}"></i> ${category}`;
        section.appendChild(title);

        const serviceList = document.createElement('div');
        serviceList.className = 'service-list';

        // Create service items
        items.forEach(service => {
            const serviceItem = document.createElement('div');
            serviceItem.className = 'service-item';
            
            // Determinar se o serviço é exclusivo (apenas um por categoria)
            const isExclusive = category === 'Combos' || EXCLUSIVE_CATEGORIES.includes(category);

            const input = document.createElement('input');
            input.type = isExclusive ? 'radio' : 'checkbox';
            input.id = service.id;
            input.name = isExclusive ? `category-${category.toLowerCase().replace(/\s+/g, '-')}` : service.id;
            
            // Handle service selection
            input.addEventListener('change', () => {
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
                                        const checkbox = document.getElementById(id);
                                        if (checkbox) {
                                            checkbox.checked = false;
                                            state.selectedServices.delete(id);
                                            state.totalPrice -= existingService.price;
                                            state.totalDuration -= existingService.duration;
                                            checkbox.closest('.service-item').classList.remove('selected');
                                        }
                                    }
                                }
                            });
                        }
                        
                        // Adicionar novo serviço
                        state.selectedServices.add(service.id);
                        state.totalPrice += service.price;
                        state.totalDuration += service.duration;
                        serviceItem.classList.add('selected');
                    } else {
                        input.checked = false;
                        ServiceUtils.showError('Este serviço não pode ser combinado com os já selecionados', container);
                    }
                } else {
                    // Remover serviço
                    state.selectedServices.delete(service.id);
                    state.totalPrice -= service.price;
                    state.totalDuration -= service.duration;
                    serviceItem.classList.remove('selected');
                }
                
                // Atualizar resumo do agendamento
                updateBookingSummary(
                    Array.from(state.selectedServices),
                    state.totalPrice,
                    state.totalDuration
                );
            });

            // Create service label
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

            // Append elements
            serviceItem.appendChild(input);
            serviceItem.appendChild(label);
            serviceList.appendChild(serviceItem);
        });

        // Append to section
        section.appendChild(serviceList);
        container.appendChild(section);
    });

    // Create booking summary area
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'booking-summary';
    summaryDiv.innerHTML = `
        <h3><i class="fas fa-receipt"></i> Resumo do Agendamento</h3>
        <div class="summary-content">
            <p class="empty-selection">Nenhum serviço selecionado</p>
        </div>
    `;
    container.appendChild(summaryDiv);

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
        .filter(Boolean);

    summaryContent.innerHTML = `
        <div class="selected-services">
            ${selectedServices.map(service => `
                <div class="summary-item">
                    <span class="service-name">${service.nome}</span>
                    <div class="service-details">
                        <span class="service-duration">
                            <i class="fas fa-clock"></i> ${service.duracao} min
                        </span>
                        <span class="service-price">
                            <i class="fas fa-tag"></i> R$ ${service.preco.toFixed(2)}
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

    // Update hidden form fields
    document.getElementById('selectedServices').value = JSON.stringify(
        selectedServices.map(s => ({ 
            id: s.id, 
            name: s.nome, 
            price: s.preco, 
            duration: s.duracao 
        }))
    );
    document.getElementById('totalPrice').value = totalPrice;
    document.getElementById('totalDuration').value = totalDuration;
}
