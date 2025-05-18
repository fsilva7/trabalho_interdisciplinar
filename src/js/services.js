// Namespace global para a aplicação
window.SALON_APP = window.SALON_APP || {};

// Constants
window.SERVICE_TYPES = {
    BARBERSHOP: 'barbershop',
    SALON: 'salon'
};

window.SERVICES = {
    barbershop: {
        'Cortes Masculinos': [
            { id: 'corte-1', nome: 'Corte Social', preco: 35.00, duracao: 30 },
            { id: 'corte-2', nome: 'Degradê', preco: 40.00, duracao: 40 },
            { id: 'corte-3', nome: 'Navalhado', preco: 45.00, duracao: 45 }
        ],
        'Barba': [
            { id: 'barba-1', nome: 'Barba Simples', preco: 25.00, duracao: 20 },
            { id: 'barba-2', nome: 'Barba Completa', preco: 35.00, duracao: 30 }
        ],
        'Acabamentos': [
            { id: 'acab-1', nome: 'Pezinho', preco: 15.00, duracao: 15 },
            { id: 'acab-2', nome: 'Sobrancelha', preco: 20.00, duracao: 20 }
        ],
        'Combos': [
            { id: 'combo-1', nome: 'Corte + Barba', preco: 55.00, duracao: 60 },
            { id: 'combo-2', nome: 'Corte + Barba + Sobrancelha', preco: 70.00, duracao: 75 }
        ]
    },
    salon: {
        'Cortes e Penteados': [
            { id: 'corte-f1', nome: 'Corte Feminino', preco: 60.00, duracao: 45 },
            { id: 'corte-f2', nome: 'Escova', preco: 50.00, duracao: 40 }
        ],
        'Coloração': [
            { id: 'cor-1', nome: 'Coloração', preco: 120.00, duracao: 90 },
            { id: 'cor-2', nome: 'Mechas', preco: 180.00, duracao: 120 }
        ],
        'Tratamentos': [
            { id: 'trat-1', nome: 'Hidratação', preco: 80.00, duracao: 40 },
            { id: 'trat-2', nome: 'Reconstrução', preco: 100.00, duracao: 60 }
        ],
        'Manicure e Pedicure': [
            { id: 'mani-1', nome: 'Manicure', preco: 35.00, duracao: 40 },
            { id: 'mani-2', nome: 'Pedicure', preco: 40.00, duracao: 45 },
            { id: 'mani-3', nome: 'Manicure e Pedicure', preco: 70.00, duracao: 80 }
        ],
        'Depilação': [
            { id: 'dep-1', nome: 'Axila', preco: 25.00, duracao: 20 },
            { id: 'dep-2', nome: 'Perna Completa', preco: 70.00, duracao: 60 }
        ],
        'Combos e Pacotes': [
            { id: 'combo-f1', nome: 'Dia da Noiva', preco: 350.00, duracao: 240 },
            { id: 'combo-f2', nome: 'Pacote Completo', preco: 200.00, duracao: 180 }
        ]
    }
};

window.EXCLUSIVE_CATEGORIES = ['Combos', 'Combos e Pacotes'];

// Classe utilitária para gerenciamento de serviços
window.ServiceUtils = class ServiceUtils {
    static getServicesBySector(sectorType) {
        if (!sectorType) return null;
        return window.SERVICES[sectorType.toLowerCase()];
    }

    static findServiceById(id) {
        if (!id) return null;
        for (const sectorServices of Object.values(window.SERVICES)) {
            for (const categoryServices of Object.values(sectorServices)) {
                const service = categoryServices.find(s => s.id === id);
                if (service) return service;
            }
        }
        return null;
    }

    static getServiceCategory(id) {
        if (!id) return null;
        for (const sectorServices of Object.values(window.SERVICES)) {
            for (const [category, services] of Object.entries(sectorServices)) {
                if (services.some(s => s.id === id)) return category;
            }
        }
        return null;
    }

    static checkServiceCompatibility(selectedServices, newService, category) {
        // Se não tem categoria, permite a seleção
        if (!category) return true;

        // Se é um combo, só pode ser selecionado se não houver outros serviços
        if (category === 'Combos' || category === 'Combos e Pacotes') {
            return selectedServices.size === 0;
        }

        // Se já tem algum combo selecionado, não permite selecionar outros serviços
        for (const serviceId of selectedServices) {
            const serviceCategory = this.getServiceCategory(serviceId);
            if (serviceCategory === 'Combos' || serviceCategory === 'Combos e Pacotes') {
                return false;
            }
        }

        // Se é uma categoria exclusiva, só permite um serviço da mesma categoria
        if (window.EXCLUSIVE_CATEGORIES.includes(category)) {
            for (const serviceId of selectedServices) {
                const serviceCategory = this.getServiceCategory(serviceId);
                if (serviceCategory === category) {
                    return false;
                }
            }
        }

        return true;
    }

    static showError(message, container) {
        if (!container || !message) return;
        const errorDiv = document.createElement('div');
        errorDiv.className = 'service-error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        container.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
};

// Indicar que os serviços foram carregados
console.log('Serviços carregados com sucesso');
