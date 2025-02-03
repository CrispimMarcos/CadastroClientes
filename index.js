$(document).ready(function() {
    alasql(`
        USE clientes_db;
    `);
    
    $('#cpf').mask('000.000.000-00');


    function atualizarTabelaClientes() {
        const clientes = alasql('SELECT cpf, nome, dataNascimento, telefone, celular FROM clientes');

        const $tbodyClientes = $('#clientesTable tbody');
        $tbodyClientes.empty();

        clientes.forEach(cliente => {
            const enderecoPrincipal = alasql('SELECT * FROM enderecos WHERE cpf = ? AND enderecoPrincipal = true', [cliente.cpf])[0];
            const $trClientes = $('<tr>');
            $trClientes.append(`<td>${cliente.nome}</td>`);
            $trClientes.append(`<td>${cliente.cpf}</td>`);
            $trClientes.append(`<td>${cliente.dataNascimento}</td>`);
            $trClientes.append(`<td>${cliente.telefone}</td>`);
            $trClientes.append(`<td>${cliente.celular}</td>`);
            $trClientes.append(`<td>${enderecoPrincipal ? enderecoPrincipal.cep : ''}</td>`);
            $trClientes.append(`<td>${enderecoPrincipal ? enderecoPrincipal.logradouro : ''}</td>`);
            $trClientes.append(`<td>${enderecoPrincipal ? enderecoPrincipal.bairro : ''}</td>`);
            $trClientes.append(`<td>${enderecoPrincipal ? enderecoPrincipal.cidade : ''}</td>`);
            $trClientes.append(`<td>${enderecoPrincipal ? enderecoPrincipal.estado : ''}</td>`);
            $trClientes.append(`<td>${enderecoPrincipal ? enderecoPrincipal.pais : ''}</td>`);
            $trClientes.append(`
                <td>
                    <button class="btn btn-primary btn-sm ver-cliente" data-id="${cliente.cpf}"><i class="fas fa-eye"></i> Ver</button>
                    <button class="btn btn-danger btn-sm excluir-cliente" data-id="${cliente.cpf}"><i class="fas fa-trash-alt"></i> Excluir</button>
                </td>
            `);
            $tbodyClientes.append($trClientes);
        });

        $('.excluir-cliente').on('click', function() {
            const cpf = $(this).data('id');
            const cpfString = cpf.toString();

            if (cpf) {
                const affectedRowsClientes = alasql('DELETE FROM clientes WHERE cpf = ?', [cpfString]);
                const affectedRowsEnderecos = alasql('DELETE FROM enderecos WHERE cpf = ?', [cpfString]);
                
                if (affectedRowsClientes > 0 && affectedRowsEnderecos >= 0) {
                    alert('Cliente e endereços excluídos com sucesso!');
                } else {
                    alert('Erro: Cliente não encontrado ou exclusão falhou.');
                }
            } else {
                alert('Erro ao tentar excluir: CPF não encontrado.');
            }

            atualizarTabelaClientes();
        });

        $('.ver-cliente').on('click', function() {
            const cpf = $(this).data('id');
            window.location.href = `cliente.html?cpf=${cpf}`;
        });
    }

    atualizarTabelaClientes();

    const authenticatedUserJson = sessionStorage.getItem('authenticatedUser');
    const authenticatedUser = authenticatedUserJson ? JSON.parse(authenticatedUserJson) : null;

    if (authenticatedUser) {
        $('#usernameDisplay').text(`Bem-vindo, ${authenticatedUser.username}!`);

        $('#clienteForm').on('submit', function(event) {
            event.preventDefault();

            const nome = $('#nome').val();
            const cpf = $('#cpf').val();
            const dataNascimento = $('#dataNascimento').val();
            const telefone = $('#telefone').val();
            const celular = $('#celular').val();
            const cep = $('#cep').val();
            const logradouro = $('#logradouro').val();
            const bairro = $('#bairro').val();
            const cidade = $('#cidade').val();
            const estado = $('#estado').val();
            const pais = $('#pais').val();

            if (cpf.length !== 14) {
                alert('CPF inválido. Por favor, insira um CPF válido.');
                return;
            }
            if (alasql('SELECT * FROM clientes WHERE cpf = ?', [cpf]).length > 0) {
                alert('CPF já cadastrado. Por favor, insira um CPF diferente.');
            } else {
                alasql('INSERT INTO clientes (cpf, nome, dataNascimento, telefone, celular) VALUES (?, ?, ?, ?, ?)', 
                [cpf, nome, dataNascimento, telefone, celular]);
                alasql('INSERT INTO enderecos (cpf, cep, logradouro, bairro, cidade, estado, pais, enderecoPrincipal) VALUES (?, ?, ?, ?, ?, ?, ?, true)', 
                [cpf, cep, logradouro, bairro, cidade, estado, pais]);
                alert('Cliente e endereço cadastrados com sucesso!');
                atualizarTabelaClientes();
            }
        });
    } else {
        alert('Usuário não autenticado. Redirecionando para a tela de login...');
        window.location.href = 'login.html';
    }

    $('#exportBtn').on('click', function() {
        const clientes = alasql('SELECT * FROM clientes');
        const enderecos = alasql('SELECT * FROM enderecos');
        const data = { clientes, enderecos };
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clientes_enderecos.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    $('#importBtn').on('click', function() {
        const fileInput = $('#importInput')[0];
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const json = event.target.result;
                const data = JSON.parse(json);
    
                data.clientes.forEach(cliente => {
                    alasql('INSERT INTO clientes VALUES ?', [cliente]);
                });
    
                data.enderecos.forEach(endereco => {
                    alasql('INSERT INTO enderecos VALUES ?', [endereco]);
                });
    
                alert('Banco de dados importado com sucesso!');
                atualizarTabelaClientes();
                
                fileInput.value = '';
            };
            reader.readAsText(file);
        } else {
            alert('Por favor, selecione um arquivo JSON para importar.');
        }
    });
    $('#downloadTemplateBtn').on('click', function() {
        const template = {
            "clientes": [
                {
                    "cpf": "123.456.789-00",
                    "nome": "João da Silva",
                    "dataNascimento": "1980-05-15",
                    "telefone": "11 2345-6789",
                    "celular": "11 98765-4321"
                },
                {
                    "cpf": "987.654.321-00",
                    "nome": "Maria de Souza",
                    "dataNascimento": "1990-10-25",
                    "telefone": "21 8765-4321",
                    "celular": "21 91234-5678"
                }
            ],
            "enderecos": [
                {
                    "id": 1,
                    "cpf": "123.456.789-00",
                    "cep": "12345-678",
                    "logradouro": "Rua das Flores",
                    "bairro": "Centro",
                    "cidade": "São Paulo",
                    "estado": "SP",
                    "pais": "Brasil",
                    "enderecoPrincipal": true
                },
                {
                    "id": 2,
                    "cpf": "987.654.321-00",
                    "cep": "87654-321",
                    "logradouro": "Avenida das Palmeiras",
                    "bairro": "Jardim",
                    "cidade": "Rio de Janeiro",
                    "estado": "RJ",
                    "pais": "Brasil",
                    "enderecoPrincipal": true
                }
            ]
        };
        const json = JSON.stringify(template, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'modelo_clientes_enderecos.json';
        a.click();
        URL.revokeObjectURL(url);
    });
    
});

function buscarEndereco() {
    const cep = $('#cep').val().replace(/\D/g, ''); 
    if (cep.length === 8) {
        $.getJSON(`https://viacep.com.br/ws/${cep}/json/`, function(data) {
            if (!("erro" in data)) {
                $('#bairro').val(data.bairro);
                $('#cidade').val(data.localidade);
                $('#estado').val(data.uf);
                $('#pais').val('Brasil');
                $('#logradouro').val(data.logradouro);
            } else {
                alert("CEP não encontrado.");
            }
        }).fail(function() {
            alert("Erro ao consultar o CEP.");
        });
    } else {
        alert("Por favor, insira um CEP válido.");
    }
}
