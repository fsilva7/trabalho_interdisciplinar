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
    constructor() {
        this.dropdownMenu = document.getElementById('dropdownHorarios');
        this.dropdownToggle = document.getElementById('dropdownMenuButton');
        this.horaInput = document.getElementById('hora');
        this.dataInput = document.getElementById('data');
    }

    initialize() {
        if (!this.dropdownMenu || !this.dropdownToggle || !this.horaInput || !this.dataInput) return;

        // Initialize date picker
        flatpickr(this.dataInput, {
            dateFormat: "Y-m-d",
            minDate: "today",
            disable: [
                function(date) {
                    return date.getDay() === 0; // Disable Sundays
                }
            ],
            locale: {
                firstDayOfWeek: 0
            },
            onChange: (selectedDates, dateStr) => this.updateTimeSlots(dateStr)
        });

        // Initialize dropdown behavior
        this.dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.dropdownMenu.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.dropdownToggle.contains(e.target) && !this.dropdownMenu.contains(e.target)) {
                this.dropdownMenu.classList.remove('show');
            }
        });

        // Set initial date and generate time slots
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        this.dataInput.value = todayStr;
        this.updateTimeSlots(todayStr);
    }    updateTimeSlots(selectedDate) {
        this.dropdownMenu.innerHTML = '';
        this.dropdownToggle.textContent = 'Selecione um horário';
        this.dropdownToggle.classList.remove('has-value');
        this.horaInput.value = '';

        const today = new Date();
        const selected = new Date(selectedDate + 'T00:00:00');
        const isToday = today.toISOString().slice(0, 10) === selectedDate;        // Get service duration from form
        const totalDurationInput = document.getElementById('totalDuration');
        const duration = totalDurationInput && totalDurationInput.value ? parseInt(totalDurationInput.value) : 30;
        const interval = Math.max(30, Math.ceil(duration / 30) * 30); // Round up to nearest 30 minutes

        // Define business hours
        const startHour = 9; // Start at 9 AM
        const endHour = selected.getDay() === 6 ? 13 : 19; // End at 1 PM on Saturdays, 7 PM other days
        let hasOption = false;

        // Generate time slots
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minutes = 0; minutes < 60; minutes += 30) {
                const slotTime = new Date(selected);
                slotTime.setHours(hour, minutes, 0, 0);
                
                // Skip past times for today
                if (isToday && slotTime <= today) continue;
                
                // Calculate service end time
                const endTime = new Date(slotTime);
                endTime.setMinutes(endTime.getMinutes() + interval);
                
                // Skip if service would end after business hours
                if (endTime.getHours() >= endHour && 
                    (endTime.getHours() > endHour || endTime.getMinutes() > 0)) continue;
                
                // Format time string
                const timeStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                
                hasOption = true;
                this.addTimeSlotOption(timeStr);
            }
        }

        if (!hasOption) {
            this.showNoSlotsMessage(duration > 120);
        }
    }    addTimeSlotOption(timeStr) {
        const option = document.createElement('a');
        option.className = 'dropdown-item';
        option.textContent = timeStr;
        option.href = '#';
        
        option.addEventListener('click', (e) => {
            e.preventDefault();
            this.dropdownToggle.textContent = timeStr;
            this.dropdownToggle.classList.add('has-value');
            this.horaInput.value = timeStr;
            this.dropdownMenu.classList.remove('show');
        });
        
        option.addEventListener('click', (e) => {
            e.preventDefault();
            // Atualizar o texto do botão
            this.dropdownToggle.textContent = timeStr;
            this.dropdownToggle.classList.add('has-value');
            // Atualizar o valor do input oculto
            this.horaInput.value = timeStr;
            // Fechar o dropdown
            this.dropdownMenu.classList.remove('show');
        });
        
        this.dropdownMenu.appendChild(option);
                item.classList.remove('selected');
            });
        };
        
        option.addEventListener('click', (e) => {
            e.preventDefault();
            clearSelection();
            option.classList.add('selected');            this.dropdownToggle.textContent = timeStr;
            this.dropdownToggle.classList.add('has-value');
            this.horaInput.value = timeStr;
            this.dropdownMenu.classList.remove('show');
            
            // Dispatch change event to trigger any form validation
            const event = new Event('change');
            this.horaInput.dispatchEvent(event);
        });
        
        this.dropdownMenu.appendChild(option);
    }

    showNoSlotsMessage(isLongDuration) {
        const noOption = document.createElement('span');
        noOption.className = 'dropdown-item disabled';
        noOption.textContent = isLongDuration ? 
            'Duração do serviço excede o horário disponível' : 
            'Nenhum horário disponível para hoje';
        this.dropdownMenu.appendChild(noOption);
    }
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const timeSlotManager = new TimeSlotManager();
    timeSlotManager.initialize();

    // Expose for global access if needed
    window.timeSlotManager = timeSlotManager;
});
