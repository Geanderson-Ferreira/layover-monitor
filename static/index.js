//Verifica se o conteúdo da DOM foi carregado para iniciar os scripts.
document.addEventListener('DOMContentLoaded', function () {

    const tabela = document.getElementById('mainTable');
    const loadingSpinner = document.getElementById('loading-spinner');

    showLoadingSpinner();
    
    disableSearchButton();

    fetch('/get-dados')
        .then((response) => response.json())
        .then((dados) => {                                                                  
            if (dados && dados.length > 0) {
                displayData(dados)
            } else {
                console.log('Não tivemos registros hoje.');  //Tratar o caso de não haver registros *PENDENTE
                hideLoadingSpinner();
                enableSearchButton();
            }
        })

    .catch((error) => {
        console.error('Erro ao buscar os dados:', error);
    });

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

    function showLoadingSpinner() {
        loadingSpinner.style.display = 'block';
    }

    function hideLoadingSpinner() {
        loadingSpinner.style.display = 'none';
    }

    function disableSearchButton() {
        const searchButton = document.getElementById('filterButton')
        searchButton.disabled = true;
    }

    function enableSearchButton() {
        const searchButton = document.getElementById('filterButton')
        searchButton.disabled = false;
    }

    function displayData(data) {
        
        hideLoadingSpinner();

        enableSearchButton();

        //Seleciona o elemento onde o 'filho' será inserido
        const mainTable = document.getElementById('mainTable');

        //limpa os resultados antigos, se houver
        mainTable.innerHTML = '';

        data.forEach(reservation => {

            //console.log(dado.hotel_name)

            const reservationRow = document.createElement('tr');

            reservationRow.innerHTML = `
                <td>${reservation.hotel_name}</td>
                <td id="voucher-id">${reservation.voucher_id}</td>
                <td>${reservation.voucher_disruption_date}</td>
                <td>${reservation.voucher_departure_date}</td>
                <td id="table-guest-name">${reservation.voucher_pax}</td>
                <td id="airline-name">${reservation.airline_name}</td>
                <td>${reservation.voucher_room_rate}</td>
                <td>${reservation.hotel_allowances_total}</td>
                <td>${reservation.voucher_pax_total}</td>
                <td>${reservation.has_children}</td>
                <td>voucherPDF</td>
                <td>${reservation.status_opera}</td>
            `;

            //insere os dados no elemento table
            mainTable.appendChild(reservationRow);

            //após inserir formata as iniciais em maiúsculo
            // Capitaliza o nome do hóspede após inserir no DOM
            const guestNameCell = reservationRow.querySelector('#table-guest-name');
            const trimmedText = guestNameCell.textContent.trim();
            if (trimmedText) {
                guestNameCell.textContent = capitalizeName(trimmedText);
            }

            //Cria o elemento com o nome do hotel
            const hotelHeaderName = document.getElementById('hotelHeaderName')
            hotelHeaderName.innerText = `${reservation.hotel_name}`

        }) 
    }

    // Função para capitalizar o nome
    function capitalizeName(name) {
        return name.toLowerCase().replace(/(?:^|\s)\S/g, function(char) {
            return char.toUpperCase();
        });
    }

    function getLocalDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day); // O mês é zero-indexado, por isso subtraímos 1
    }
    

    async function displayReservationsByDate() {

        //Seleciona o elemento onde o 'filho' será inserido
        const mainTable = document.getElementById('mainTable');

        //limpa os resultados antigos, se houver
        mainTable.innerHTML = '';

        showLoadingSpinner();
        disableSearchButton();

        let checkinValue =  document.getElementById('checkin').value;
        let checkoutValue = document.getElementById('checkout').value;

        let checkinDate = getLocalDate(checkinValue);
        let checkoutDate = getLocalDate(checkoutValue);

        //calcula diferença
       /* const differenceInTime = new Date(checkoutValue).getTime() - new Date(checkinValue).getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);*/

        const differenceInTime = checkoutDate.getTime() - checkinDate.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);

        const maxRangeToSearch = 5

        if (differenceInDays > maxRangeToSearch) {
            alert(`O preríodo de busca não pode ser superior a ${maxRangeToSearch} dias!`);

            //define a data de checkout no max range baseado na data de checkin informado
            const maxCheckoutDate = new Date(checkinDate);
            maxCheckoutDate.setDate(maxCheckoutDate.getDate() + maxRangeToSearch)

            // Atualiza o valor do campo checkout no input
            checkoutValue = maxCheckoutDate.toISOString().split('T')[0];
            console.log(checkoutValue)
            document.getElementById('checkout').value = checkoutValue
            
        }

        await fetch(`/get-dados?checkin=${checkinValue}&checkout=${checkoutValue}`)
        .then((response) => response.json())
        .then(data => {  
            displayData(data)
        })
    }

    //função que monta o filtro:
    function getFilterPreferences() {

        //Montando filtro
        
        let guestName       = document.getElementById('guestName').value.trim().toLowerCase();
        let voucherNumber   = document.getElementById('voucherNumber').value.trim().toLowerCase();
        let selectedCompany = document.getElementById('selectedCompany').value.trim().toLowerCase();
        
        console.log(
            guestName,
            voucherNumber,
            selectedCompany,
        )

        const rows = document.querySelectorAll('tbody tr'); // Query que eleciona as Rows do tbody
        rows.forEach(row => { 

            //para cada row, extraímos os valores de:
            const guest = row.querySelector('#table-guest-name').innerText.trim().toLowerCase();
            const voucher = row.querySelector('#voucher-id').innerText.trim().toLowerCase();
            const company = row.querySelector('#airline-name').innerText.trim().toLowerCase();
         
            //Depois fazemos a validação com o que passamos nos campos e filtro

            const matchesGuestName        = guestName === '' || guest.includes(guestName);
            const matchesVoucherNumber    = voucherNumber === '' || voucher.includes(voucherNumber);
            const matchesCompany          = selectedCompany === '' || company.includes(selectedCompany);
          
            if ( matchesGuestName && matchesVoucherNumber && matchesCompany ) {
                row.style.display = ''; // Exibir
            } else {
                row.style.display = 'none'; // Ocultar
            }

        })

    }

    document.getElementById('filterButton').addEventListener('click', function(event) {
        event.preventDefault(); //previque que a página atualize
        displayReservationsByDate();
    })

    document.getElementById('guestName').addEventListener('input', function(event) {
        event.preventDefault(); //previque que a página atualize
        getFilterPreferences();
    })

    document.getElementById('voucherNumber').addEventListener('input', function(event) {
        event.preventDefault(); //previque que a página atualize
        getFilterPreferences();
    })

    document.getElementById('selectedCompany').addEventListener('change', function(event) {
        event.preventDefault(); //previque que a página atualize
        getFilterPreferences();
    })
});