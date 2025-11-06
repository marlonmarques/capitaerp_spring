# Capital ERP - Migração para Spring Boot & Angular

Este repositório documenta a migração e modernização de um sistema ERP, utilizando **Java 21**, **Spring Boot 3** e **Angular**. O projeto foca em boas práticas de desenvolvimento, arquitetura robusta e TDD.

## 🚀 Stack Tecnológico (Backend)

* **Linguagem:** Java 21
* **Framework:** Spring Boot 3.x
* **Persistência:** Spring Data JPA (Hibernate)
* **Bancos de Dados:**
    * **PostgreSQL:** Banco principal para dados transacionais (desenvolvimento/produção).
    * **H2 (In-Memory):** Utilizado para testes de integração e CI.
    * **SQLite:** Utilizado para armazenar dados comuns e estáticos do sistema (ex: NCM, impostos, tabelas de pagamento).
* **Testes:** JUnit 5, Mockito, MockMvc (`@WebMvcTest`)
* **Validação:** Spring Boot Validation (`jakarta.validation`)
* **API:** RESTful (documentada com Postman/Swagger)

---

## 🏛️ Arquitetura

O projeto adota uma arquitetura de serviços bem definida (Controllers, Services, Repositories, DTOs).

Uma decisão chave de arquitetura foi a **separação dos bancos de dados**:
1.  **Banco Transacional (PostgreSQL):** Armazena todos os dados dinâmicos da operação (clientes, contas a pagar/receber, etc.).
2.  **Banco Comum (SQLite):** Armazena dados estáticos e que são raramente modificados. Isso permite uma inicialização mais rápida da aplicação, facilidade na distribuição de atualizações de tabelas fiscais e otimização de consultas.

---

## 🧪 Qualidade e Testes

A qualidade do código é garantida através de testes unitários e de integração. A camada de API (`Controllers`) é 100% testada usando `MockMvc` para simular requisições HTTP e validar respostas, status codes e tratamento de exceções.

**Exemplo de cobertura de testes (Módulo Cliente):**
* `GET /clientes`
* `GET /clientes/{id}` (Cenários: OK e Not Found)
* `POST /clientes` (Cenário: Created)
* `PUT /clientes/{id}` (Cenários: OK e Not Found)
* `DELETE /clientes/{id}` (Cenários: No Content, Not Found e Database Integrity)

---

## 🏁 Como Executar

**1. Clonar o repositório:**
```bash
git clone [https://github.com/marlonmarques/capitalerp.git](https://github.com/marlonmarques/capitalerp.git)
cd capitalerp
```

**2. Executar os testes:**
```bash
mvn test
```

**3. Executar a aplicação (dev profile com H2/Postgres):**
```bash
mvn spring-boot:run
```

## 📋 API

A coleção completa do Postman para testar a API está disponível no repositório:
[CapitalErp.postman_collection.json](CapitalErp.postman_collection.json)