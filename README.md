💈 Barbearia API — Back-end

API back-end de um sistema de agendamento para barbearias, desenvolvida com foco em regras de negócio reais, segurança, organização de código e escalabilidade.

Este projeto faz parte de uma aplicação full stack, sendo consumido pelo front-end disponível no repositório barbearia-app.

---

🚀 Visão Geral

A Barbearia API é responsável por toda a lógica de negócio da aplicação, incluindo:

Gerenciamento de usuários

Autenticação e autorização

Controle de agendamentos

Persistência de dados

Regras para evitar conflitos de horários

A API foi pensada para simular um ambiente real de produção, seguindo boas práticas de arquitetura e desenvolvimento.

---

🛠️ Tecnologias Utilizadas

Node.js — Ambiente de execução

NestJS — Framework para construção de APIs escaláveis

TypeScript — Tipagem estática e segurança

Prisma ORM — Modelagem e acesso ao banco de dados

PostgreSQL — Banco de dados relacional

JWT (JSON Web Token) — Autenticação e proteção de rotas

---

🧠 Arquitetura e Organização

A aplicação segue a arquitetura modular do NestJS, separando responsabilidades em:

Modules — Organização por domínio

Controllers — Camada de entrada (HTTP)

Services — Regras de negócio

DTOs — Validação e tipagem de dados

Prisma — Camada de acesso ao banco

Essa estrutura facilita manutenção, testes e escalabilidade do sistema.

---

✨ Funcionalidades

Cadastro e autenticação de usuários

Autenticação baseada em JWT

Controle de acesso por usuário

Criação, listagem e atualização de agendamentos

Regra de negócio para impedir agendamentos no mesmo horário

Marcação de agendamentos como concluídos

Histórico de agendamentos

Controle mensal de entradas confirmadas, despesas e saldo

---

🔐 Autenticação

A API utiliza JWT para autenticação:

Usuário realiza login

Token JWT é gerado

Token deve ser enviado no header das requisições protegidas

Exemplo:

Authorization: Bearer <token>

---

⚙️ Como Rodar o Projeto Localmente

Pré-requisitos

Node.js 20.19+, 22.12+ ou 24+

npm ou yarn

Docker com Compose, ou PostgreSQL instalado e em execução

---

Passo a passo

# Clone o repositório

git clone https://github.com/seu-usuario/barbearia-api.git

# Acesse a pasta do projeto

cd barbearia-api

# Configure as variáveis de ambiente

cp .env.example .env

# Instale exatamente as dependências do lockfile

npm ci

# Inicie o PostgreSQL (opcional se já houver uma instância local)

docker compose -f docker/docker-compose.yml up -d

# Gere o Prisma Client

npm run prisma:generate

# Aplique as migrations no banco local (ação explícita)

npx prisma migrate dev

# Inicie o servidor de desenvolvimento

npm run start:dev

A API estará disponível em:

http://localhost:3001

---

🔐 Variáveis de Ambiente

Exemplo de configuração:

DATABASE_URL="postgresql://dev:dev@localhost:5432/barber_dev"
JWT_SECRET=replace_me
PORT=3001
SERVICE_PRICES='{"corte": 50, "barba": 35}'
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://barbearia-app-pi.vercel.app

Para produção, configure `JWT_SECRET` com uma chave aleatória de pelo menos 32
caracteres. Por exemplo, gere uma com `openssl rand -base64 48`. A aplicação
recusa segredos curtos em produção.

Configure `SERVICE_PRICES` como um objeto JSON cujas chaves correspondem
exatamente ao campo `service` dos agendamentos e cujos valores são os preços
positivos daquele estabelecimento. O preço é calculado pela API; o campo
`amount` enviado por clientes antigos é ignorado. Sem preço configurado para o
serviço, a criação do pagamento é recusada. O exemplo inclui `corte` e `barba`;
complete os preços dos demais serviços com a tabela aprovada pela barbearia.
`CORS_ORIGINS` é uma lista separada por vírgulas dos endereços autorizados para
chamadas de navegador. Configure nela os domínios de produção e preview usados
pelo front-end.

Os comandos `npm run build`, `npm run lint`, `npm test` e `npm run test:e2e`
executam build, análise estática, testes unitários e testes HTTP com dependências
mockadas, respectivamente. O build não aplica migrations. Use
`npm run prisma:migrate:deploy` apenas como etapa explícita de deploy.

---

📌 Integração com o Front-end

O front-end desta aplicação está disponível no repositório:

👉 barbearia-app

A comunicação acontece via API REST, utilizando autenticação JWT para rotas protegidas.

---

💰 Financeiro mensal

O perfil `ADMIN` ou `BARBEIRO` pode consultar e lançar despesas no mês:

- `GET /payments` lista pagamentos e os atendimentos associados.
- `GET /finance/expenses?month=AAAA-MM` lista despesas do período.
- `POST /finance/expenses` registra uma despesa com descrição, categoria, valor e data.

O saldo mostrado pelo frontend é calculado como pagamentos confirmados menos
despesas lançadas.

---

📌 Status do Projeto

🚧 Em desenvolvimento

Próximos passos:

Finalizar regras de negócio

Implementar melhorias de segurança

Preparação para deploy

---

📚 Aprendizados

Este projeto contribuiu para o aprofundamento em:

Arquitetura de APIs com NestJS

Modelagem de banco de dados com Prisma

Autenticação e autorização com JWT

Aplicação de regras de negócio reais

---

👨‍💻 Autor

Mateus Fernandes
Desenvolvedor Full Stack Júnior

🔗 LinkedIn: https://www.linkedin.com/in/devmateusfernandes
🔗 GitHub: https://github.com/t-rror
