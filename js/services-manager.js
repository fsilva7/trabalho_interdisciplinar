// Gerenciador de serviços
class ServicesManager {
    constructor() {
        // Inicializar quando o DOM estiver pronto
        document.addEventListener('DOMContentLoaded', () => {
            // Verify dependencies are loaded before initializing
            if (!window.ServiceUtils || !window.SERVICES || !window.SERVICE_TYPES) {
                console.error('Dependências necessárias não carregadas. Tentando novamente em 500ms...');
                setTimeout(() => this.init(), 500);
                return;
            }
            this.init();
        });
    }

    init() {
        try {
            // Obter parâmetros da URL e seção de serviços
            const params = new URLSearchParams(window.location.search);
            const sector = params.get('setor') || 'barbearia';
            const servicesSection = document.querySelector('.services-section');

            if (!servicesSection) {
                throw new Error('Seção de serviços não encontrada');
            }

            // Show loading indicator
            servicesSection.innerHTML = `
                <div class="loading-message">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Carregando serviços...</p>
                </div>
            `;

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

            if (!serviceType) {
                throw new Error('Tipo de serviço inválido');
            }

            // Check if createServiceSelector is available
            if (typeof window.createServiceSelector !== 'function') {
                throw new Error('createServiceSelector não está disponível');
            }

            // Criar e adicionar o seletor de serviços
            console.log('Criando seletor para:', serviceType);
            const selector = window.createServiceSelector(serviceType);
            if (!selector) {
                throw new Error('Falha ao criar seletor de serviços');
            }

            // Clear loading message and add selector
            servicesSection.innerHTML = '';
            servicesSection.appendChild(selector);
            console.log('Seletor de serviços criado com sucesso');

        } catch (error) {
            console.error('Erro ao inicializar serviços:', error);
            this.showError('Não foi possível carregar os serviços: ' + error.message);
        }
    }

    showError(message) {
        const servicesSection = document.querySelector('.services-section');
        if (servicesSection) {
            servicesSection.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${message}</p>
                    <button onclick="window.location.reload()" class="retry-button">
                        <i class="fas fa-sync"></i> Tentar novamente
                    </button>
                </div>
            `;
        }
    }
}

// Instanciar o gerenciador
const servicesManager = new ServicesManager();
