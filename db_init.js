$(document).ready(function() {
    alasql(`
        CREATE LOCALSTORAGE DATABASE IF NOT EXISTS clientes_db;
        ATTACH LOCALSTORAGE DATABASE clientes_db;
        USE clientes_db;
        CREATE TABLE IF NOT EXISTS users (
            username STRING PRIMARY KEY,
            password STRING
        );
        CREATE TABLE IF NOT EXISTS clientes (
            cpf STRING PRIMARY KEY,
            nome STRING, 
            dataNascimento DATE, 
            telefone STRING, 
            celular STRING
        );
        CREATE TABLE IF NOT EXISTS enderecos (
            id INT PRIMARY KEY AUTO_INCREMENT,
            cpf STRING, 
            cep STRING, 
            logradouro STRING, 
            bairro STRING, 
            cidade STRING, 
            estado STRING, 
            pais STRING, 
            enderecoPrincipal BOOLEAN,
            FOREIGN KEY (cpf) REFERENCES clientes(cpf)
        );
    `);
    console.log('Banco de dados e tabelas criados');
});
