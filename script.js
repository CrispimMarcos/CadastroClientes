$(document).ready(function() {
    console.log('AlaSQL versão:', alasql.version);

    // Cria tabelas de clientes e endereços se não existirem
    alasql('CREATE TABLE IF NOT EXISTS clientes (nome STRING, cpf STRING, dataNascimento STRING, telefone STRING, celular STRING)');
    alasql('CREATE TABLE IF NOT EXISTS enderecos (cep STRING, rua STRING, bairro STRING, cidade STRING, estado STRING, pais STRING, clienteId STRING, principal BOOLEAN)');

    // Função para atualizar a tabela de clientes
    function atualizarTabelaClientes() {
        const clientes = alasql('SELECT * FROM clientes');
        console.log('Clientes:', clientes); // Log para verificar os dados
        const $tbody = $('#clientesTable tbody');
        $tbody.empty();
        
        clientes.forEach(cliente => {
            const $tr = $('<tr>');
            $tr.append(`<td>${cliente.nome}</td>`);
            $tr.append(`<td>${cliente.cpf}</td>`);
            $tr.append(`<td>${cliente.dataNascimento}</td>`);
            $tr.append(`<td>${cliente.telefone}</td>`);
            $tr.append(`<td>${cliente.celular}</td>`);
            $tbody.append($tr);
        });
    }

    // Função para atualizar a tabela de endereços
    function atualizarTabelaEnderecos() {
        const enderecos = alasql('SELECT * FROM enderecos');
        console.log('Endereços:', enderecos); // Log para verificar os dados
        const $tbody = $('#enderecosTable tbody');
        $tbody.empty();
        
        enderecos.forEach(endereco => {
            const $tr = $('<tr>');
            $tr.append(`<td>${endereco.cep}</td>`);
            $tr.append(`<td>${endereco.rua}</td>`);
            $tr.append(`<td>${endereco.bairro}</td>`);
            $tr.append(`<td>${endereco.cidade}</td>`);
            $tr.append(`<td>${endereco.estado}</td>`);
            $tr.append(`<td>${endereco.pais}</td>`);
            $tr.append(`<td>${endereco.clienteId}</td>`);
            $tr.append(`<td>${endereco.principal ? 'Sim' : 'Não'}</td>`);
            $tbody.append($tr);
        });
    }

    // Manipula o envio do formulário de clientes
    $('#clienteForm').on('submit', function(event) {
        event.preventDefault();

        const nome = $('#nome').val();
        const cpf = $('#cpf').val();
        const dataNascimento = $('#dataNascimento').val();
        const telefone = $('#telefone').val();
        const celular = $('#celular').val();

        alasql('INSERT INTO clientes VALUES (?, ?, ?, ?, ?)', [nome, cpf, dataNascimento, telefone, celular]);
        console.log('Cliente cadastrado:', nome, cpf, dataNascimento, telefone, celular); // Log para verificar o cadastro

        $('#clienteForm')[0].reset();
        atualizarTabelaClientes();
    });

    // Manipula o envio do formulário de endereços
    $('#enderecoForm').on('submit', function(event) {
        event.preventDefault();

        const cep = $('#cep').val();
        const rua = $('#rua').val();
        const bairro = $('#bairro').val();
        const cidade = $('#cidade').val();
        const estado = $('#estado').val();
        const pais = $('#pais').val();
        const clienteId = $('#clienteId').val();
        const principal = $('#principal').is(':checked');

        alasql('INSERT INTO enderecos VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [cep, rua, bairro, cidade, estado, pais, clienteId, principal]);
        console.log('Endereço cadastrado:', cep, rua, bairro, cidade, estado, pais, clienteId, principal); // Log para verificar o cadastro

        $('#enderecoForm')[0].reset();
        atualizarTabelaEnderecos();
    });

    // Atualiza as tabelas ao carregar a página
    atualizarTabelaClientes();
    atualizarTabelaEnderecos();
});
