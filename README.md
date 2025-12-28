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

Node.js (versão LTS)

npm ou yarn

PostgreSQL instalado e em execução



---

Passo a passo

# Clone o repositório
git clone https://github.com/seu-usuario/barbearia-api.git

# Acesse a pasta do projeto
cd barbearia-api

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Gere o Prisma Client
npx prisma generate

# Execute as migrations
npx prisma migrate dev

# Inicie o servidor de desenvolvimento
npm run start:dev

A API estará disponível em:

http://localhost:3001


---

🔐 Variáveis de Ambiente

Exemplo de configuração:

DATABASE_URL="postgresql://usuario:senha@localhost:5432/barbearia"
JWT_SECRET=sua_chave_secreta
PORT=3001


---

📌 Integração com o Front-end

O front-end desta aplicação está disponível no repositório:

👉 barbearia-app

A comunicação acontece via API REST, utilizando autenticação JWT para rotas protegidas.


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