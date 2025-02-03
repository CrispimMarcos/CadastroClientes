$(document).ready(function() {
    alasql('USE clientes_db;');

    function atualizarUsuarios() {
        const usuarios = alasql('SELECT * FROM users');
    }

    $('#loginForm').on('submit', function(event) {
        event.preventDefault();
        const username = $('#username').val();
        const password = $('#password').val();

        if (username && password) {
            const user = alasql('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
            if (user.length > 0) {
                sessionStorage.setItem('authenticatedUser', JSON.stringify({ username }));
                alert('Login bem-sucedido!');
                window.location.href = 'index.html';
            } else {
                alert('Usuário ou senha incorretos!');
            }
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });

    $('#registerBtn').on('click', function() {
        const username1 = prompt('Digite um nome de usuário:');
        const password1 = prompt('Digite uma senha:');
        if (username1 && password1) {
            const userExists = alasql('SELECT * FROM users WHERE username = ?', [username1]);

            if (userExists.length === 0) {
                alasql('INSERT INTO users (username, password) VALUES (?, ?)', [username1, password1]);
                alert('Usuário registrado com sucesso!');
                atualizarUsuarios();
            } else {
                alert('Usuário já existe!');
            }
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });

    $('#configBtn').on('click', function() {
        $('#configMenu').toggle();
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

    $('#uploadFileBtn').on('click', function() {
        $('#importInput').click();
    });

    $('#importInput').on('change', function() {
        const file = this.files[0];

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
            };
            reader.readAsText(file);
        } else {
            alert('Por favor, selecione um arquivo JSON para importar.');
        }
    });

    atualizarUsuarios();
});
