//Verifica se o conteúdo da DOM foi carregado para iniciar os scripts.
document.addEventListener('DOMContentLoaded', function () {


    flatpickr(".date-picker", {
        locale: {
            firstDayOfWeek: 0, // O primeiro dia da semana é domingo
            weekdays: {
                shorthand: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
                longhand: ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]
            },
            months: {
                shorthand: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
                longhand: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
            }
        },
        dateFormat: "Y-m-d", // Formato da data
        altInput: true, // Mostra um campo alternativo mais legível
        altFormat: "j F, Y", // Formato legível
    });

    // Função para capitalizar o nome
    function capitalizeName(name) {
        return name.toLowerCase().replace(/(?:^|\s)\S/g, function(char) {
            return char.toUpperCase();
        });
    }

    // Seleciona todas as células com a classe 'unformattedName'
    const unformattedNames = document.querySelectorAll('.unformattedName');
    unformattedNames.forEach(function(cell) {
        const trimmedText = cell.textContent.trim();
        // Capitaliza o texto se não for vazio
        if (trimmedText) {
            // Exibe o texto antes e depois da capitalização no console para verificação
            cell.textContent = capitalizeName(trimmedText);
        }
    });


    //função que monta o filtro:
    function getFilterPreferences() {

        //Montando filtro
        
        let selectedHotel   = document.getElementById('selectedHotel').value.replace(' ', '').toLowerCase();
        let guestName       = document.getElementById('guestName').value.trim().toLowerCase();
        let voucherNumber   = document.getElementById('voucherNumber').value.trim().toLowerCase();
        let selectedCompany = document.getElementById('selectedCompany').value.trim().toLowerCase();
        let checkinDate     = document.getElementById('checkin').value;
        let checkoutDate    = document.getElementById('checkout').value
        


        console.log(selectedHotel)

        const rows = document.querySelectorAll('tbody tr'); // Query que eleciona as Rows do tbody
        rows.forEach(row => { 

            //para cada row, extraímos os valores de:
            const hotel = row.querySelector('#hotel-name').textContent.replace(' ','').toLowerCase();
            const guest = row.querySelector('.unformattedName').innerText.trim().toLowerCase();
            const voucher = row.querySelector('#voucher-id').innerText.trim().toLowerCase();
            const company = row.querySelector('#airline-name').innerText.trim().toLowerCase();
            const inDateRaw = row.querySelector('#voucher-disruption-date').innerText.trim().split(' ')[0] // Split para pegar apenas data
            const outDateRaw = row.querySelector('#voucher-departure-date').innerText.trim().split(' ')[0] // Removendo assim o horário

            const inDateParts = inDateRaw.split('/');
            const outDateParts = outDateRaw.split('/');

            inDate = `${inDateParts[2]}-${inDateParts[0]}-${inDateParts[1]}`
            outDate = `${outDateParts[2]}-${outDateParts[0]}-${outDateParts[1]}`


            console.log(hotel)

            /*console.log(
                hotel,guest,voucher,company,inDate,outDate
            )*/

            const matchesHotel            = selectedHotel === '' || hotel.includes(selectedHotel);
            const matchesGuestName        = guestName === '' || guest.includes(guestName);
            const matchesVoucherNumber    = voucherNumber === '' || voucher.includes(voucherNumber);
            const matchesCompany          = selectedCompany === '' || company.includes(selectedCompany);
            const matchesCheckin          = checkinDate === '' || new Date(inDate) >= new Date(checkinDate);
            const matchesCheckout         = checkoutDate === '' || new Date(outDate) <= new Date(checkoutDate);

            if (matchesHotel && matchesGuestName && matchesVoucherNumber && matchesCompany && matchesCheckin && matchesCheckout) {
                row.style.display = ''; // Exibir
            } else {
                row.style.display = 'none'; // Ocultar
            }

        })

    }

    document.getElementById('filterButton').addEventListener('click', function(event) {
        // event.preventDefault(); //previque que a página atualize
        getFilterPreferences();
        // fetchData()
    })

    document.getElementById('guestName').addEventListener('input', function(event) {
        event.preventDefault(); //previque que a página atualize
        getFilterPreferences();
    })

    document.getElementById('voucherNumber').addEventListener('input', function(event) {
        event.preventDefault(); //previque que a página atualize
        getFilterPreferences();
    })
});



