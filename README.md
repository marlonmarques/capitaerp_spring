# 🏢 Capital ERP — Arquitetura SaaS Multi-Tenant com Spring Boot & Angular

Este repositório representa a evolução arquitetural do **Capital ERP**, uma plataforma SaaS em produção voltada para gestão empresarial, financeira e fiscal.

O objetivo deste projeto é modernizar um sistema ERP legado para uma arquitetura **escalável, segura, multi-tenant e orientada a domínio**, utilizando Java 21 e Spring Boot 3.

---

## 🎯 Contexto do Projeto

O Capital ERP atende operações reais com alta complexidade de negócio, incluindo:

* Gestão financeira (contas a pagar/receber)
* Controle de clientes e fornecedores
* Integrações fiscais (NF-e, NFS-e, CTe, etc.)
* Operações multi-tenant (múltiplas empresas no mesmo sistema)

Este repositório foca na **reconstrução do core backend**, priorizando qualidade de código, arquitetura e escalabilidade.

---

## 🧠 Decisões Arquiteturais

### ✔️ Multi-Tenancy (Isolamento por Cliente)

* Estratégia baseada em **schema por tenant no PostgreSQL**
* Isolamento de dados por empresa
* Redução de risco de vazamento de dados (cross-tenant)
* Facilidade de manutenção e escalabilidade

---

### ✔️ Separação de Bancos de Dados

* **PostgreSQL (Transacional):**

  * Dados dinâmicos da operação (clientes, financeiro, pedidos)
* **SQLite (Dados Comuns):**

  * Tabelas estáticas (NCM, impostos, configurações)

👉 Resultado:

* Melhor performance
* Inicialização mais rápida
* Atualização simplificada de dados fiscais

---

### ✔️ Arquitetura em Camadas (Clean Architecture Inspired)

```
Controller → Service → Repository → Domain
```

* Controllers: camada de entrada (API REST)
* Services: regras de negócio
* Repositories: persistência
* DTOs: isolamento de contratos da API

---

### ✔️ Domain-Driven Design (DDD)

* Organização do código baseada no domínio
* Separação clara de responsabilidades
* Base preparada para evolução em microsserviços

---

## 🚀 Stack Tecnológico

### Backend

* **Java 21**
* **Spring Boot 3**
* Spring Data JPA (Hibernate)
* Spring Validation (Jakarta)
* JWT / Segurança (em evolução)

### Banco de Dados

* PostgreSQL (principal)
* SQLite (dados comuns)
* H2 (testes)

### Testes

* JUnit 5
* Mockito
* MockMvc (`@WebMvcTest`)

### API

* RESTful
* Documentação via Postman / Swagger

---

## 🧪 Qualidade e Testes

O projeto segue abordagem **TDD (Test-Driven Development)** para garantir confiabilidade e previsibilidade.

A camada de API possui cobertura completa utilizando `MockMvc`, validando:

* Status codes
* Contratos da API
* Tratamento de exceções
* Fluxos de sucesso e erro

### ✔️ Exemplos de cenários testados

* `GET /clientes`
* `GET /clientes/{id}` (OK / Not Found)
* `POST /clientes` (Created)
* `PUT /clientes/{id}` (OK / Not Found)
* `DELETE /clientes/{id}` (No Content / Not Found / Integrity)

---

## ⚙️ Execução do Projeto

### 1. Clonar repositório

```bash
git clone https://github.com/marlonmarques/capitaerp_spring.git
cd capitaerp_spring
```

### 2. Rodar testes

```bash
mvn test
```

### 3. Subir aplicação

```bash
mvn spring-boot:run
```

---

## 📦 Roadmap Arquitetural

* [ ] Implementação completa de autenticação (JWT / OAuth2)
* [ ] Observabilidade (logs estruturados + métricas)
* [ ] Introdução de eventos assíncronos
* [ ] Evolução para arquitetura de microsserviços (quando necessário)
* [ ] Integração com serviços fiscais externos

---

## 🌐 Sobre o Produto

Este projeto faz parte do ecossistema do **Capital ERP**, uma solução SaaS completa já em operação:

🔗 https://capitalerp.com.br

---

## 🧠 Observação

Por se tratar de um sistema em produção, **nem todos os módulos estão disponíveis publicamente** neste repositório.
O foco aqui é demonstrar decisões arquiteturais, organização de código e boas práticas de engenharia.

---

## 👨‍💻 Autor

**Marlon Cândido Marques**
Engenheiro de Software Sênior • Tech Lead • Arquitetura SaaS & FinTech

🔗 Portfólio: https://marlonmarques.github.io
🔗 LinkedIn: https://www.linkedin.com/in/marlon-marques-040942247
🔗 GitHub: https://github.com/marlonmarques

---

## 🎯 Objetivo

Demonstrar experiência prática na construção de sistemas empresariais escaláveis, com foco em arquitetura, qualidade de código e evolução sustentável em produção.
