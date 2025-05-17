// Função para inicializar a aplicação
window.initializeApp = function() {
    try {
        console.log('Iniciando aplicação...');
        
        // Verificar dependências necessárias
        if (!window.ServiceUtils) throw new Error('ServiceUtils não está disponível');
        if (!window.SERVICES) throw new Error('SERVICES não está disponível');
        if (!window.SERVICE_TYPES) throw new Error('SERVICE_TYPES não está disponível');

        const servicesSection = document.querySelector('.services-section');
        if (!servicesSection) throw new Error('Seção de serviços não encontrada');

        // Mostrar indicador de carregamento
        servicesSection.innerHTML = `
            <div class="loading-message">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Carregando serviços...</p>
            </div>
        `;

        // Obter parâmetros e configurar setor
        const params = new URLSearchParams(window.location.search);
        const sector = params.get('setor') || 'barbearia';
        const serviceType = sector === 'barbearia' ? 'barbershop' : 'salon';
        
        console.log('Setor:', sector, 'Tipo:', serviceType);

        // Configurar tema
        document.body.classList.remove('barbershop-theme', 'salon-theme');
        document.body.classList.add(sector === 'barbearia' ? 'barbershop-theme' : 'salon-theme');

        // Criar seletor de serviços
        console.log('Criando seletor de serviços...');
        const selector = window.createServiceSelector(serviceType);
        if (!selector) {
            throw new Error('Falha ao criar seletor de serviços');
        }

        // Adicionar seletor à página
        servicesSection.innerHTML = '';
        servicesSection.appendChild(selector);
        console.log('Seletor de serviços criado com sucesso');

    } catch (error) {
        console.error('Erro na inicialização:', error);
        const servicesSection = document.querySelector('.services-section');
        if (servicesSection) {
            servicesSection.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Não foi possível carregar os serviços. Por favor, tente novamente mais tarde.</p>
                    <p class="error-details">${error.message}</p>
                    <button onclick="window.location.reload()" class="retry-button">
                        <i class="fas fa-sync"></i> Tentar novamente
                    </button>
                </div>
            `;
        }
    }
};
