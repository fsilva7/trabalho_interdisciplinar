// Service utility functions
window.ServiceUtils = {
    formatPrice: (price) => {
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },
    
    formatDuration: (minutes) => {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h${remainingMinutes}min` : `${hours}h`;
    },

    validateService: (service) => {
        return service && 
               typeof service === 'object' && 
               'id' in service && 
               'nome' in service && 
               'preco' in service && 
               'duracao' in service;
    },

    getServiceById: (serviceId) => {
        for (const category in window.SERVICES) {
            for (const subcategory in window.SERVICES[category]) {
                const service = window.SERVICES[category][subcategory].find(s => s.id === serviceId);
                if (service) return service;
            }
        }
        return null;
    },

    findServiceById: (id) => {
        if (typeof window.SERVICES === 'undefined') return null;
        
        // Procura o serviço em todas as categorias
        for (const sectorType in window.SERVICES) {
            const sector = window.SERVICES[sectorType];
            for (const category in sector) {
                const service = sector[category].find(s => s.id === id);
                if (service) return service;
            }
        }
        return null;
    }
};
