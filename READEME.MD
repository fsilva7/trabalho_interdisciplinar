Para utilizar a aplicação, é necessário criar um banco de dados com o nome agendamentos no phpMyAdmin. Após criar o banco, crie uma tabela chamada users com os seguintes campos:

id: tipo INT, chave primária (PRIMARY), com auto incremento (A_I);

nome: tipo VARCHAR;

email: tipo VARCHAR, com índice único (UNIQUE);

senha: tipo VARCHAR;

criado_em: tipo TIMESTAMP, com valor padrão como CURRENT_TIMESTAMP e permitido ser nulo (NULL).

Certifique-se de que o banco de dados agendamentos e a tabela users estejam criados corretamente no phpMyAdmin antes de iniciar a aplicação.