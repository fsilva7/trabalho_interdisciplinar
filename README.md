Para utilizar a aplicação, é necessário criar um banco de dados com o nome agendamentos no phpMyAdmin. Após criar o banco, crie uma tabela chamada users com os seguintes campos:

id: tipo INT, chave primária (PRIMARY), com auto incremento (A_I);

nome: tipo VARCHAR;

email: tipo VARCHAR, com índice único (UNIQUE);

senha: tipo VARCHAR;

criado_em: tipo TIMESTAMP, com valor padrão como CURRENT_TIMESTAMP e permitido ser nulo (NULL).

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Certifique-se de que o banco de dados agendamentos e a tabela users estejam criados corretamente no phpMyAdmin antes de iniciar a aplicação.
