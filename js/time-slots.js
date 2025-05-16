// Time slot management
class TimeSlotManager {
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
        const isToday = today.toISOString().slice(0, 10) === selectedDate;

        // Get service duration from form
        const duration = parseInt(document.getElementById('totalDuration')?.value) || 30;
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
        
        // Remove selection from all options
        const clearSelection = () => {
            this.dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
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
