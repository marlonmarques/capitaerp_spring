---
description: Guia de Desenvolvimento do ERP
---

# Estrutura do Frontend
O projeto Angular está dividido em:
- **core**: Serviços base (ex: AuthService, EmpresaService), Guards e Interceptors. O login valida a existência da empresa (Tenant Identifier) antes de prosseguir com as credenciais do usuário.
- **layout**: Componentes base de arquitetura como MainLayoutComponent (Sidebar e Toolbar).
- **pages**: Componentes das funcionalidades (ex: Dashboard, Produtos, Usuários).
- **shared**: Componentes reutilizáveis globalmente.

# Permissões de Acesso (Menu e Páginas)
As permissões dependem do papel atribuído ao usuário (`ROLE_OPERATOR`, `ROLE_ADMIN`):
1. **Guards de Rota**: No arquivo `app-routing.module.ts`, utilizar a propriedade `data: { roles: ['ROLE_NAME'] }` protegida pelo `AuthGuard`.
2. **Menu Lateral**: Em `MainLayoutComponent`, os objetos do array `menuItems` possuem uma propriedade `roles`. O método `filteredMenuItems` cuida de listar os links apenas para usuários com permissão correta baseada no JWT.

# Como adicionar novos Cruds:
1. Criar entidade base, Repository, Dto, Service, Controller no Backend (já providenciando as validações adequadas para `inserir`, `atualizar`, `excluir`, `listar`).
2. Criar model Typescript no Frontend contendo os mesmos campos do DTO.
3. Criar os referidos serviços HTTP de integração no Frontend.
4. Criar a interface da tela em Components dentro da pasta `pages/` seguindo a biblioteca Angular Material (e DataTable com paginação/sorting).
5. Definir as novas rotas protegidas em `app-routing.module.ts`.
