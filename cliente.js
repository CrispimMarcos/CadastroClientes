$(document).ready(function() {
    alasql('USE clientes_db');
    
    const urlParams = new URLSearchParams(window.location.search);
    const cpf = urlParams.get('cpf');
    
    if (cpf) {
        const cliente = alasql('SELECT * FROM clientes WHERE cpf = ?', [cpf])[0];
        if (cliente) {
            atualizarTabelaClientes(cliente);
            $('#enderecoForm').on('submit', function(event) {
                event.preventDefault();
                
                const cep = $('#cep').val();
                const logradouro = $('#logradouro').val();
                const bairro = $('#bairro').val();
                const cidade = $('#cidade').val();
                const estado = $('#estado').val();
                const pais = $('#pais').val();
                                
                if (cep && logradouro && bairro && cidade && estado && pais) {
                    const enderecos = alasql('SELECT id FROM enderecos WHERE cpf = ?', [cpf]);
                    if (enderecos.length === 0) {
                        alasql('INSERT INTO enderecos (cpf, cep, logradouro, bairro, cidade, estado, pais, enderecoPrincipal) VALUES (?, ?, ?, ?, ?, ?, ?, true)', 
                        [cliente.cpf, cep, logradouro, bairro, cidade, estado, pais]);
                    } else {
                        alasql('INSERT INTO enderecos (cpf, cep, logradouro, bairro, cidade, estado, pais, enderecoPrincipal) VALUES (?, ?, ?, ?, ?, ?, ?, false)', 
                        [cliente.cpf, cep, logradouro, bairro, cidade, estado, pais]);
                    }
                    alert('Endereço adicional cadastrado com sucesso!');
                    location.reload(); 
                } else {
                    alert('Por favor, preencha todos os campos do formulário de endereço.');
                }
            });
        } else {
            alert('Cliente não encontrado.');
            window.location.href = 'index.html';
        }
    } else {
        alert('CPF não fornecido.');
        window.location.href = 'index.html';
    }

    function atualizarTabelaClientes(cliente) {
        $('#cpfCliente').val(cliente.cpf);
        $('#nome').val(cliente.nome);
        $('#dataNascimento').val(cliente.dataNascimento);
        $('#telefone').val(cliente.telefone);
        $('#celular').val(cliente.celular);
        atualizarEnderecoPrincipal(cliente.cpf);
        
        const enderecos = alasql('SELECT * FROM enderecos WHERE cpf = ? AND enderecoPrincipal = false', [cliente.cpf]);
        const $tbodyEnderecos = $('#enderecosTable tbody');
        $tbodyEnderecos.empty();
        
        enderecos.forEach(endereco => {
            const $trEndereco = $('<tr>');
            $trEndereco.append(`<td>${endereco.cep}</td>`);
            $trEndereco.append(`<td>${endereco.logradouro}</td>`);
            $trEndereco.append(`<td>${endereco.bairro}</td>`);
            $trEndereco.append(`<td>${endereco.cidade}</td>`);
            $trEndereco.append(`<td>${endereco.estado}</td>`);
            $trEndereco.append(`<td>${endereco.pais}</td>`);
            $trEndereco.append(`
                <td>
                    <button class="btn btn-primary btn-sm principal-btn" data-id="${endereco.id}">Principal</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${endereco.id}">Excluir</button>
                </td>
            `);
            $tbodyEnderecos.append($trEndereco);
        });
        
        $tbodyEnderecos.off('click', '.delete-btn').on('click', '.delete-btn', function() {
            const id = $(this).data('id');

            alasql('DELETE FROM enderecos WHERE id = ?', [id]);
            alert('Endereço excluído com sucesso!');
            $(this).closest('tr').remove();
            atualizarTabelaClientes(cliente); // Atualiza a tabela após a exclusão
        });

        $tbodyEnderecos.off('click', '.principal-btn').on('click', '.principal-btn', function() {
            const id = $(this).data('id');
            alasql('UPDATE enderecos SET enderecoPrincipal = false WHERE cpf = ?', [cliente.cpf]);
            alasql('UPDATE enderecos SET enderecoPrincipal = true WHERE id = ?', [id]);
            alert('Endereço principal atualizado com sucesso!');
            atualizarEnderecoPrincipal(cliente.cpf);
            atualizarTabelaClientes(cliente);
        });
    }

});
$('#exportBtn').on('click', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const cpf = urlParams.get('cpf');
    const clientes = alasql('SELECT * FROM clientes where cpf = ?', [cpf]);
    const enderecos = alasql('SELECT * FROM enderecos where cpf = ?', [cpf]);
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

function atualizarEnderecoPrincipal(cpf) {
    const enderecoPrincipal = alasql('SELECT * FROM enderecos WHERE cpf = ? AND enderecoPrincipal = true', [cpf])[0];
    if (enderecoPrincipal) {
        $('#enderecoPrincipal').val(`${enderecoPrincipal.logradouro}, ${enderecoPrincipal.bairro}, ${enderecoPrincipal.cidade}, ${enderecoPrincipal.estado}, ${enderecoPrincipal.pais}, CEP: ${enderecoPrincipal.cep}`);
    }
}
