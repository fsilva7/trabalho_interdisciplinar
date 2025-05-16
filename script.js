document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('appointmentForm');
    const telefoneInput = document.getElementById('telefone');
    const dataInput = document.getElementById('data');
    const horaInput = document.getElementById('hora');
    const selectedServicesInput = document.getElementById('selectedServices');
    const totalPriceInput = document.getElementById('totalPrice');
    const totalDurationInput = document.getElementById('totalDuration');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const summaryContent = document.querySelector('.summary-content');

    // Phone number formatting and validation
    if (telefoneInput) {
        const formatPhoneNumber = (value) => {
            value = value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 0) {
                value = '(' + value;
                if (value.length > 3) {
                    value = value.slice(0, 3) + ') ' + value.slice(3);
                }
                if (value.length > 10) {
                    value = value.slice(0, 10) + '-' + value.slice(10);
                }
            }
            return value;
        };

        telefoneInput.addEventListener('input', (e) => {
            e.target.value = formatPhoneNumber(e.target.value);
        });

        telefoneInput.addEventListener('blur', (e) => {
            const value = e.target.value.replace(/\D/g, '');
            if (value.length !== 11) {
                e.target.setCustomValidity('Por favor, insira um número de telefone válido com 11 dígitos');
            } else {
                e.target.setCustomValidity('');
            }
        });
    }
    
    // Initialize service selector based on URL parameter
    const params = new URLSearchParams(window.location.search);
    const sector = params.get('setor');
    const servicesSection = document.querySelector('.services-section');
    
    if (sector === 'barbearia') {
        document.body.classList.add('barbershop-theme');
        servicesSection.appendChild(createServiceSelector(SERVICE_TYPES.BARBERSHOP));
    } else if (sector === 'salao') {
        document.body.classList.add('salon-theme');
        servicesSection.appendChild(createServiceSelector(SERVICE_TYPES.SALON));
    }

    // Initialize datepicker
    if (dataInput) {
        const fp = flatpickr(dataInput, {
            dateFormat: "Y-m-d",
            minDate: "today",
            locale: {
                firstDayOfWeek: 0
            },
            onChange: function(selectedDates, dateStr) {
                updateAvailableTimeSlots(dateStr);
            }
        });

        // Set initial date to today
        const hoje = new Date();
        const dataHoje = hoje.toISOString().slice(0, 10);
        dataInput.value = dataHoje;
        updateAvailableTimeSlots(dataHoje);
    }

    // Handle form submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (form.checkValidity()) {
                const appointmentData = {
                    nome: document.getElementById('nome').value,
                    telefone: telefoneInput.value,
                    data: dataInput.value,
                    hora: horaInput.value,
                    servicos: Array.from(document.querySelectorAll('.service-item.selected')).map(item => {
                        const serviceId = item.dataset.serviceId;
                        return ServiceUtils.findServiceById(serviceId);
                    }),
                    totalPrice: parseFloat(totalPriceInput.value),
                    totalDuration: parseInt(totalDurationInput.value)
                };

                console.log('Dados do agendamento:', appointmentData);
                
                // Show confirmation message
                if (confirmationMessage) {
                    form.style.display = 'none';
                    confirmationMessage.style.display = 'flex';
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 3000);
                }
            }
        });
    }
});
