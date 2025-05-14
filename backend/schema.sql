CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    data DATE NOT NULL,
    hora TIME NOT NULL,
    servico VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pendente'
);
