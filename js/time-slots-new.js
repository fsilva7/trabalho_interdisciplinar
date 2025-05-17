// Time slot management
function updateAvailableTimeSlots(selectedDate) {
    const dropdownMenu = document.getElementById('dropdownHorarios');
    const dropdownToggle = document.getElementById('dropdownMenuButton');
    const horaInput = document.getElementById('hora');
    
    if (!dropdownMenu || !dropdownToggle || !horaInput) return;

    // Limpar horários anteriores
    dropdownMenu.innerHTML = '';
    dropdownToggle.textContent = 'Selecione um horário';
    dropdownToggle.classList.remove('has-value');
    horaInput.value = '';

    const today = new Date();
    const selected = new Date(selectedDate + 'T00:00:00');
    const isToday = today.toISOString().slice(0, 10) === selectedDate;

    // Pegar duração total dos serviços
    const totalDurationInput = document.getElementById('totalDuration');
    const duration = totalDurationInput && totalDurationInput.value ? parseInt(totalDurationInput.value) : 30;
    const interval = Math.max(30, Math.ceil(duration / 30) * 30);

    // Horário de funcionamento
    const startHour = 9;
    const endHour = selected.getDay() === 6 ? 13 : 19;
    let hasOption = false;

    // Gerar horários disponíveis
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minutes = 0; minutes < 60; minutes += 30) {
            const slotTime = new Date(selected);
            slotTime.setHours(hour, minutes, 0, 0);
            
            if (isToday && slotTime <= today) continue;
            
            const endTime = new Date(slotTime);
            endTime.setMinutes(endTime.getMinutes() + interval);
            
            if (endTime.getHours() >= endHour && 
                (endTime.getHours() > endHour || endTime.getMinutes() > 0)) continue;
            
            const timeStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            
            // Criar opção de horário
            const option = document.createElement('a');
            option.className = 'dropdown-item';
            option.href = '#';
            option.textContent = timeStr;
            
            option.addEventListener('click', (e) => {
                e.preventDefault();
                dropdownToggle.textContent = timeStr;
                dropdownToggle.classList.add('has-value');
                horaInput.value = timeStr;
                dropdownMenu.classList.remove('show');
            });
            
            dropdownMenu.appendChild(option);
            hasOption = true;
        }
    }

    if (!hasOption) {
        const noOption = document.createElement('div');
        noOption.className = 'dropdown-item disabled';
        noOption.textContent = duration > 120 
            ? 'Não há horários disponíveis para serviços longos nesta data' 
            : 'Não há horários disponíveis nesta data';
        dropdownMenu.appendChild(noOption);
    }
}

// Configurar comportamento do dropdown
document.addEventListener('DOMContentLoaded', () => {
    const dropdownToggle = document.getElementById('dropdownMenuButton');
    const dropdownMenu = document.getElementById('dropdownHorarios');
    
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
});
