// Função para atualizar o resumo do agendamento
window.updateBookingSummary = function(selectedIds, totalPrice, totalDuration) {
    const summaryContent = document.querySelector('.summary-content');
    if (!summaryContent) return;

    // Se não há serviços selecionados
    if (!selectedIds || selectedIds.length === 0) {
        summaryContent.innerHTML = `
            <div class="empty-selection">
                <i class="fas fa-info-circle"></i>
                <p>Nenhum serviço selecionado</p>
                <p class="hint">Selecione os serviços desejados para ver o resumo</p>
            </div>
        `;
        document.getElementById('selectedServices').value = '[]';
        document.getElementById('totalPrice').value = '0';
        document.getElementById('totalDuration').value = '0';
        return;
    }

    // Encontrar os serviços selecionados
    const selectedServices = [];
    selectedIds.forEach(id => {
        for (const category in window.SERVICES.barbershop) {
            const services = window.SERVICES.barbershop[category];
            const found = services.find(s => s.id === id);
            if (found) {
                selectedServices.push(found);
                break;
            }
        }
    });

    // Pegar data e hora selecionadas
    const dataInput = document.getElementById('data');
    const horaInput = document.getElementById('hora');
    const dataAgendamento = dataInput ? dataInput.value : '';
    const horaAgendamento = horaInput ? horaInput.value : '';

    // Formatar a data para exibição (converter de YYYY-MM-DD para DD/MM/YYYY)
    const dataFormatada = dataAgendamento ? 
        dataAgendamento.split('-').reverse().join('/') : '';

    // Criar o HTML do resumo
    let html = `
        ${(dataFormatada || horaAgendamento) ? `
            <div class="appointment-datetime">
                ${dataFormatada ? `
                    <div class="date-info">
                        <i class="fas fa-calendar"></i>
                        <span>Data: ${dataFormatada}</span>
                    </div>
                ` : ''}
                ${horaAgendamento ? `
                    <div class="time-info">
                        <i class="fas fa-clock"></i>
                        <span>Horário: ${horaAgendamento}</span>
                    </div>
                ` : ''}
            </div>
        ` : ''}
        <div class="selected-services">
    `;

    // Adicionar cada serviço
    selectedServices.forEach(service => {
        html += `
            <div class="service-item">
                <div class="service-info">
                    <span class="service-name">${service.nome}</span>
                    <div class="service-details">
                        <span class="service-duration" title="Duração">
                            <i class="fas fa-clock"></i> ${service.duracao} min
                        </span>
                        <span class="service-price" title="Preço">
                            <i class="fas fa-tag"></i> R$ ${service.preco.toFixed(2)}
                        </span>
                    </div>
                </div>
                <button class="remove-service" onclick="window.removeService('${service.id}')" title="Remover serviço">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });

    // Adicionar o total
    html += `
        </div>
        <div class="summary-total">
            <div class="total-duration" title="Tempo total estimado">
                <i class="fas fa-hourglass-half"></i>
                <span>Tempo Total: ${totalDuration} min</span>
            </div>
            <div class="total-price" title="Valor total">
                <i class="fas fa-money-bill-wave"></i>
                <span>Total: R$ ${totalPrice.toFixed(2)}</span>
            </div>
        </div>
    `;

    // Atualizar o conteúdo
    summaryContent.innerHTML = html;

    // Atualizar campos ocultos do formulário
    document.getElementById('selectedServices').value = JSON.stringify(selectedServices);
    document.getElementById('totalPrice').value = totalPrice.toString();
    document.getElementById('totalDuration').value = totalDuration.toString();
};
