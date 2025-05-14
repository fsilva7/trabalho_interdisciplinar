document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('appointmentForm');
    const telefoneInput = document.getElementById('telefone');
    const dataInput = document.getElementById('data');
    const horaInput = document.getElementById('hora');
    const confirmationMessage = document.getElementById('confirmationMessage');    // Inicializar Flatpickr para seleção de data
    flatpickr(dataInput, {
        dateFormat: "Y-m-d",
        minDate: "today",
        disable: [
            function(date) {
                // Desabilitar domingos (0) e sábados (6)
                return (date.getDay() === 0);
            }
        ],
        locale: {
            firstDayOfWeek: 0
        },
        onChange: function(selectedDates, dateStr) {
            generateTimeSlots(dateStr);
        }
    });

    // Gerar slots de horário
    function generateTimeSlots(selectedDate) {
        const horariosGrid = document.getElementById('horariosGrid');
        const startHour = 8;
        const endHour = 18;
        const interval = 30; // minutos
        
        horariosGrid.innerHTML = '';
        
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += interval) {
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'horario-btn';
                button.textContent = timeStr;
                
                button.addEventListener('click', function() {
                    const allButtons = horariosGrid.querySelectorAll('.horario-btn');
                    allButtons.forEach(btn => btn.classList.remove('selected'));
                    this.classList.add('selected');
                    horaInput.value = timeStr;
                });
                
                horariosGrid.appendChild(button);
            }
        }
    }

    // Adicionar animação ao formulário
    form.classList.add('fade-in');

    // Máscara para o telefone
    telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            if (value.length > 2) {
                value = '(' + value.substring(0,2) + ') ' + value.substring(2);
            }
            if (value.length > 9) {
                value = value.substring(0,9) + '-' + value.substring(9);
            }
            e.target.value = value;
        }
    });

    // Validação personalizada do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            nome: document.getElementById('nome').value,
            telefone: telefoneInput.value.replace(/\D/g, ''),
            data: dataInput.value,
            hora: horaInput.value,
            servico: document.getElementById('servico').value,
            status: 'Pendente'
        };

        // Validar telefone
        if (formData.telefone.length < 10 || formData.telefone.length > 11) {
            showError('Por favor, insira um número de telefone válido');
            return;
        }

        // Validar data e hora
        const dataHora = new Date(formData.data + 'T' + formData.hora);
        const agora = new Date();
        
        if (dataHora < agora) {
            showError('Por favor, selecione uma data e hora futura');
            return;
        }

        const hora = parseInt(formData.hora.split(':')[0]);
        if (hora < 8 || hora >= 18) {
            showError('Por favor, selecione um horário entre 8:00 e 18:00');
            return;
        }

        // Desabilitar o botão durante o envio
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agendando...';

        fetch('backend/create_appointment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                form.reset();
                showConfirmation();
                
                // Scroll suave até a mensagem de confirmação
                confirmationMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(data.error || 'Erro ao realizar agendamento');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            showError('Erro ao realizar agendamento: ' + error.message);
        })
        .finally(() => {
            // Restaurar o botão
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        });
    });

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        form.insertBefore(errorDiv, form.firstChild);

        setTimeout(() => {
            errorDiv.classList.add('fade-out');
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
    }

    function showConfirmation() {
        confirmationMessage.style.display = 'block';
        confirmationMessage.classList.add('fade-in');
        
        setTimeout(() => {
            confirmationMessage.classList.add('fade-out');
            setTimeout(() => {
                confirmationMessage.style.display = 'none';
                confirmationMessage.classList.remove('fade-out', 'fade-in');
            }, 300);
        }, 5000);
    }

    // Adicionar animação aos campos do formulário
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('input-focused');
        });
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('input-focused');
        });
    });
});