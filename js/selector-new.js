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

        // Criar elementos para cada categoria e serviço
        Object.entries(services).forEach(([category, categoryServices]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'service-category';
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category;
            categoryDiv.appendChild(categoryTitle);

            categoryServices.forEach(service => {
                const serviceItem = document.createElement('div');
                serviceItem.className = 'service-item';
                serviceItem.innerHTML = `
                    <label class="service-label">
                        <input type="checkbox" id="${service.id}" class="service-checkbox">
                        <span class="service-name">${service.nome}</span>
                        <span class="service-details">
                            <span class="service-price">R$ ${service.preco.toFixed(2)}</span>
                            <span class="service-duration">${service.duracao} min</span>
                        </span>
                    </label>
                `;

                const checkbox = serviceItem.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        state.selectedServices.add(service.id);
                        state.totalPrice += service.preco;
                        state.totalDuration += service.duracao;
                        serviceItem.classList.add('selected');
                    } else {
                        state.selectedServices.delete(service.id);
                        state.totalPrice -= service.preco;
                        state.totalDuration -= service.duracao;
                        serviceItem.classList.remove('selected');
                    }

                    // Atualizar resumo do agendamento
                    if (typeof window.updateBookingSummary === 'function') {
                        window.updateBookingSummary(
                            Array.from(state.selectedServices),
                            state.totalPrice,
                            state.totalDuration
                        );
                    }
                });

                categoryDiv.appendChild(serviceItem);
            });

            container.appendChild(categoryDiv);
        });

        return container;
    } catch (error) {
        console.error('Erro ao criar seletor:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>Erro ao carregar serviços</p>
            <p class="error-details">${error.message}</p>
        `;
        return errorDiv;
    }
};
