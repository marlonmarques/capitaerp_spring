---
description: Padrão de Qualidade do Frontend (Capital ERP)
---
# Padrões de Qualidade Frontend (Capital ERP)

Este arquivo descreve o conjunto de definições de UI/UX exigidos pelo usuário. Devem ser sempre seguidos como padrão de qualidade em qualquer formulário e tabela.

## 1. Alturas Padronizadas (Inputs, Masks, Selects e Buttons)
Evite disparidades de altura! Qualquer input de formulário (incluindo PrimeNG `p-inputMask` e `<select>`) deve SEMPRE exigir a classe `h-[48px]`, combinada com um padding `px-4 py-3` no TailwindCSS.
- **Inputs normais, Selects, textareas**:
  `class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm h-[48px] bg-white"`
- **PrimeNG InputMask** (usar em styleClass):
  `styleClass="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm h-full"` (Quando dento de uma div `h-[48px]`) ou `h-[48px]` diretamente.
- **Botões Laterais** (lupas de pesquisa): Devem ser `h-[48px] w-[48px] shrink-0` ao lado dos inputs estendidos por uma div `flex-1`.

## 2. Formulários Inteligentes (PF / PJ)
As renderizações condicionais via `*ngIf` são fundamentais para formulários multi-tipos:
- Se **Pessoa Física (PF)**: Mostrar Nome, Sobrenome, RG, CPF. Esconder campos empresariais.
- Se **Pessoa Jurídica (PJ)**: Mostrar Razão Social, Nome Fantasia (usando a var de nome), CNPJ, IE. Esconder Sobrenome e RG.

## 3. Listagens de Tabelas de Cadastros
Ao criar uma nova listagem principal de módulo, você DEVE utilizar os nossos módulos base compartilhados para seguir o design do ERP:
- `<app-page-header>` para o cabeçalho padronizado (já contém o título, subtitle, ícone e botão "Novo").
- `<app-data-table>` para as tabelas padronizadas (suporta loading spinners, field columns customizadas, paginação e botões de editar e excluir internos).
*NUNCA monte uma listagem complexa localmente em tailwind quando já temos o modelo `data-table` padrão, a menos que as demandas fujam do propósito padrão do generic-table!*
