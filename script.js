document.getElementById('add-transaction-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Previne o comportamento padrão de envio do formulário

    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const type = document.getElementById('type').value;

    if (description.trim() === '' || amount.trim() === '' || category.trim() === '') {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    if (isNaN(parseFloat(amount))) {
        alert('O campo de valor deve ser um número.');
        return;
    }

    fetch('/add_transaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description, amount, category, type })
    }).then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Erro:', error));
});

function updateChart() {
    const selectedPeriod = document.getElementById('period').value;

    fetch(`/transactions?period=${selectedPeriod}`)
        .then(response => response.json())
        .then(data => {
            console.log('Dados recebidos:', data); // Log dos dados recebidos

            // Criar arrays vazios para armazenar os dados dos gráficos
            const labels = [];
            const amounts = [];
            const categories = {};

            // Iterar sobre os dados recebidos para extrair informações necessárias
            data.forEach(transaction => {
                labels.push(transaction.description);
                amounts.push(transaction.amount);

                if (categories[transaction.category]) {
                    categories[transaction.category] += transaction.amount;
                } else {
                    categories[transaction.category] = transaction.amount;
                }
            });

            // Gráfico de despesas (barra)
            const ctxExpenses = document.getElementById('expenses-chart').getContext('2d');
            const expensesChart = new Chart(ctxExpenses, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Despesas',
                        data: amounts,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Cor de fundo
                        borderColor: 'rgba(255, 99, 132, 1)', // Cor da borda
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });

            // Gráfico de categorias (pizza)
            const ctxCategory = document.getElementById('category-chart').getContext('2d');
            const categoryChart = new Chart(ctxCategory, {
                type: 'pie',
                data: {
                    labels: Object.keys(categories),
                    datasets: [{
                        data: Object.values(categories),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            // Adicione mais cores se necessário
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            // Adicione mais cores se necessário
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    // Defina as opções do gráfico de categorias, se necessário
                }
            });
        })
        .catch(error => {
            console.error('Erro ao obter dados do backend:', error);
        });
}

// Gráfico inicial
updateChart();





