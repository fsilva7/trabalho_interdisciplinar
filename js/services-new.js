// Constants
const SERVICE_TYPES = {
    BARBERSHOP: 'barbershop',
    SALON: 'salon'
};

// Icons por categoria
const CATEGORY_ICONS = {
    'Cortes Masculinos': 'fas fa-cut',
    'Barba': 'fas fa-user-alt',
    'Acabamentos': 'fas fa-ruler',
    'Combos': 'fas fa-star',
    'Cortes e Penteados': 'fas fa-paint-brush',
    'Coloração': 'fas fa-palette',
    'Tratamentos': 'fas fa-magic',
    'Manicure e Pedicure': 'fas fa-gem',
    'Estética Facial': 'fas fa-spa',
    'Depilação': 'fas fa-feather',
    'Combos e Pacotes': 'fas fa-gift'
};

// Serviços disponíveis
const SERVICES = {
    [SERVICE_TYPES.BARBERSHOP]: {
        'Cortes Masculinos': [
            { id: 'corte-social', name: 'Corte Social', price: 35.00, duration: 30 },
            { id: 'corte-degrade', name: 'Corte Degradê', price: 45.00, duration: 45 },
            { id: 'corte-maquina', name: 'Corte Máquina', price: 30.00, duration: 30 },
            { id: 'corte-tesoura', name: 'Corte Tesoura', price: 40.00, duration: 40 }
        ],
        'Barba': [
            { id: 'barba-simples', name: 'Barba Simples', price: 25.00, duration: 20 },
            { id: 'barba-desenho', name: 'Barba com Design', price: 35.00, duration: 30 },
            { id: 'barba-completa', name: 'Barba Completa com Hidratação', price: 45.00, duration: 40 }
        ],
        'Acabamentos': [
            { id: 'acabamento-corte', name: 'Acabamento de Corte', price: 20.00, duration: 15 },
            { id: 'acabamento-barba', name: 'Acabamento de Barba', price: 15.00, duration: 15 },
            { id: 'pezinho', name: 'Pezinho', price: 10.00, duration: 10 }
        ],
        'Combos': [
            { id: 'combo-simples', name: 'Corte + Barba Simples', price: 55.00, duration: 50 },
            { id: 'combo-premium', name: 'Corte + Barba com Design', price: 70.00, duration: 70 },
            { id: 'combo-completo', name: 'Corte + Barba + Acabamento', price: 85.00, duration: 80 }
        ]
    },    [SERVICE_TYPES.SALON]: {
        'Cortes e Penteados': [
            { id: 'corte-feminino', name: 'Corte Feminino', price: 70.00, duration: 60 },
            { id: 'corte-infantil', name: 'Corte Infantil', price: 45.00, duration: 45 },
            { id: 'corte-ponta', name: 'Corte nas Pontas', price: 40.00, duration: 30 },
            { id: 'escova', name: 'Escova', price: 50.00, duration: 45 },
            { id: 'escova-modeladora', name: 'Escova Modeladora', price: 65.00, duration: 60 },
            { id: 'prancha', name: 'Prancha', price: 45.00, duration: 40 },
            { id: 'penteado', name: 'Penteado', price: 120.00, duration: 90 },
            { id: 'penteado-noiva', name: 'Penteado de Noiva', price: 250.00, duration: 120 }
        ],
        'Coloração': [
            { id: 'coloracao-raiz', name: 'Coloração Raiz', price: 120.00, duration: 120 },
            { id: 'coloracao-completa', name: 'Coloração Completa', price: 180.00, duration: 150 },
            { id: 'mechas', name: 'Mechas/Luzes', price: 250.00, duration: 180 },
            { id: 'balayage', name: 'Balayage', price: 350.00, duration: 240 },
            { id: 'morena-iluminada', name: 'Morena Iluminada', price: 380.00, duration: 240 },
            { id: 'loiro-platinado', name: 'Loiro Platinado', price: 400.00, duration: 300 },
            { id: 'tonalizante', name: 'Tonalizante', price: 100.00, duration: 90 }
        ],
        'Tratamentos': [
            { id: 'hidratacao', name: 'Hidratação Profunda', price: 90.00, duration: 60 },
            { id: 'reconstrucao', name: 'Reconstrução Capilar', price: 120.00, duration: 90 },
            { id: 'cauterizacao', name: 'Cauterização', price: 150.00, duration: 120 },
            { id: 'botox', name: 'Botox Capilar', price: 180.00, duration: 120 },
            { id: 'queratinizacao', name: 'Queratinização', price: 160.00, duration: 120 },
            { id: 'detox-capilar', name: 'Detox Capilar', price: 80.00, duration: 60 },
            { id: 'olaplex', name: 'Tratamento Olaplex', price: 200.00, duration: 120 }
        ],
        'Manicure e Pedicure': [
            { id: 'manicure', name: 'Manicure', price: 35.00, duration: 40 },
            { id: 'pedicure', name: 'Pedicure', price: 45.00, duration: 50 },
            { id: 'pes-maos', name: 'Pés e Mãos', price: 75.00, duration: 80 },
            { id: 'spa-maos', name: 'Spa das Mãos', price: 60.00, duration: 60 },
            { id: 'spa-pes', name: 'Spa dos Pés', price: 80.00, duration: 70 },
            { id: 'unhas-gel', name: 'Unhas em Gel', price: 120.00, duration: 90 },
            { id: 'unhas-fibra', name: 'Unhas em Fibra', price: 150.00, duration: 120 },
            { id: 'manutencao-unhas', name: 'Manutenção de Unhas', price: 80.00, duration: 60 }
        ],
        'Estética Facial': [
            { id: 'limpeza-pele', name: 'Limpeza de Pele', price: 120.00, duration: 90 },
            { id: 'microagulhamento', name: 'Microagulhamento', price: 250.00, duration: 60 },
            { id: 'peeling', name: 'Peeling Facial', price: 180.00, duration: 60 },
            { id: 'hidratacao-facial', name: 'Hidratação Facial', price: 90.00, duration: 45 },
            { id: 'design-sobrancelhas', name: 'Design de Sobrancelhas', price: 50.00, duration: 30 },
            { id: 'henna', name: 'Aplicação de Henna', price: 60.00, duration: 40 }
        ],
        'Depilação': [
            { id: 'depilacao-perna', name: 'Depilação Perna Completa', price: 80.00, duration: 60 },
            { id: 'depilacao-virilha', name: 'Depilação Virilha', price: 65.00, duration: 45 },
            { id: 'depilacao-axilas', name: 'Depilação Axilas', price: 30.00, duration: 20 },
            { id: 'depilacao-buco', name: 'Depilação Buço', price: 20.00, duration: 15 },
            { id: 'depilacao-facial', name: 'Depilação Facial Completa', price: 50.00, duration: 40 }
        ],
        'Combos e Pacotes': [
            { id: 'combo-noiva', name: 'Pacote Noiva', price: 600.00, duration: 360 },
            { id: 'combo-formanda', name: 'Pacote Formanda', price: 450.00, duration: 240 },
            { id: 'combo-spa', name: 'Day Spa Completo', price: 350.00, duration: 240 },
            { id: 'combo-depilacao', name: 'Pacote Depilação Completa', price: 200.00, duration: 150 },
            { id: 'combo-maos-pes', name: 'Spa Mãos e Pés Completo', price: 180.00, duration: 150 }
        ]
    }
};

// Categorias que só permitem um serviço por vez
const EXCLUSIVE_CATEGORIES = [
    'Cortes Masculinos',
    'Barba',
    'Cortes e Penteados',
    'Coloração'
];

class ServiceUtils {
    static getCategoryIcon(category) {
        return CATEGORY_ICONS[category] || 'fas fa-plus';
    }

    static findServiceById(id) {
        for (const sector of Object.values(SERVICES)) {
            for (const category of Object.values(sector)) {
                const service = category.find(s => s.id === id);
                if (service) {
                    return {
                        ...service,
                        nome: service.name,
                        preco: service.price,
                        duracao: service.duration
                    };
                }
            }
        }
        return null;
    }

    static getServiceCategory(serviceId) {
        for (const sector of Object.values(SERVICES)) {
            for (const [category, services] of Object.entries(sector)) {
                if (services.some(s => s.id === serviceId)) {
                    return category;
                }
            }
        }
        return null;
    }

    static checkServiceCompatibility(selectedServices, newService, category) {
        // Prevenir duplicatas
        if (selectedServices.has(newService.id)) {
            return false;
        }

        // Regras para combos
        if (category === 'Combos') {
            return selectedServices.size === 0;
        }

        // Não pode selecionar outros serviços se já tem combo
        if (Array.from(selectedServices).some(id => id.includes('combo'))) {
            return false;
        }

        // Verificar categorias exclusivas
        if (EXCLUSIVE_CATEGORIES.includes(category)) {
            for (const selectedId of selectedServices) {
                const selectedService = this.findServiceById(selectedId);
                if (selectedService) {
                    const selectedCategory = this.getServiceCategory(selectedId);
                    if (selectedCategory === category) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    static showError(message, container) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'service-error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        container.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    static getServicesBySector(sector) {
        return SERVICES[sector];
    }
}

// Exportar para uso global
window.SERVICE_TYPES = SERVICE_TYPES;
window.ServiceUtils = ServiceUtils;
window.SERVICES = SERVICES;
