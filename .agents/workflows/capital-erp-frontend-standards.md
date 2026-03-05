---
description: Padrões de Frontend e UI para o Capital ERP
---

# 📖 Capital ERP - Diretrizes de Desenvolvimento Frontend (Angular)

Este documento dita as leis definitivas para a construção de telas, formulários e componentes do Capital ERP. 
**Toda IA e todo desenvolvedor humano DEVE consultar este guia antes de criar qualquer nova feature.**

## 1. 💰 Valores Monetários e Numéricos Complexos (Dinheiro / Porcentagem)

**❌ NUNCA UTILIZAR:** `<input type="number">` para valores em reais (BRL), impostos (%), limites ou preços.

**✅ SEMPRE UTILIZAR:** O componente `<p-inputNumber>` da PrimeNG, configurado estritamente como abaixo:

```html
<!-- Exemplo de Campo Monetário Padrão -->
<p-inputNumber formControlName="preco" 
  mode="currency" currency="BRL" locale="pt-BR" 
  styleClass="w-full" 
  inputStyleClass="w-full p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" 
  placeholder="R$ 0,00">
</p-inputNumber>

<!-- Exemplo de Porcentagem (Impostos) -->
<p-inputNumber formControlName="aliquota" 
  mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" suffix=" %"
  styleClass="w-full" 
  inputStyleClass="w-full p-3 rounded-lg border border-slate-200 text-right">
</p-inputNumber>
```

## 2. 📄 Mascaramento de Documentos (CPF, CNPJ, CEP, Telefones)

**✅ SEMPRE UTILIZAR:** A diretiva `ngx-mask` do pacote nativo. Está configurado localmente no app.

```html
<!-- Exemplo de CPF ou CNPJ Dinâmico (Aceita ambos e formata na hora) -->
<input type="text" formControlName="cpfCnpj" mask="CPF_CNPJ" class="field-input">

<!-- Exemplo de CEP -->
<input type="text" formControlName="cep" mask="00000-000" class="field-input">

<!-- Exemplo de Telefone Celular -->
<input type="text" formControlName="celular" mask="(00) 00000-0000" class="field-input">
```

## 3. 🔍 Autocompletes e Dropdowns (Combobox)

**❌ NUNCA UTILIZAR:** `<select> <option>` para listas imensas de banco de dados (Ex: Cidades, CNAE, Clientes, Produtos).
**✅ SEMPRE UTILIZAR:** Filtros de pesquisa "Debounced" com `<mat-autocomplete>` do Angular Material ou um custom dropdown. 

*Regra de Ouro:* Um `subject.pipe(debounceTime(300))` é o mínimo existencial para não alagar o servidor de chamadas ao digitar!

Para **Status** curtos ou Enums (Ex: `ATIVO/INATIVO`, `FISICA/JURIDICA`), é **liberado** usar o `<select>` simples do HTML devidamente estilizado com a classe `.field-input`.

## 4. 🔴 Mensagens e Validação de Formulário

Qualquer erro no formulário deve ser exibido **abaixo do campo** no padrão:

```html
<div *ngIf="form.get('meuCampo')?.invalid && form.get('meuCampo')?.touched" class="field-error">
  <span *ngIf="form.get('meuCampo')?.errors?.['required']">Campo obrigatório</span>
</div>
```
*Sempre force a checagem no submissão* chamando `this.form.markAllAsTouched()` antes e abortando se `invalid` for true.

## 5. 🏗️ Estrutura Focada no Motor Tributário (Backend & DTOs)

Lembre-se da Reestruturação Fiscal (IBS, CBS e Unificação de Bens x Serviços). 
Não entupa a tela de produtos com "Aliquota de Retenção de INSS da Prefeitura XYZ". 
Sempre peça para o usuário atrelar sua entidade base à um **Grupo Tributário (`GrupoTributarioId`)**. É o backend que vai destrinchar a tabela de regras na hora de emitir a nota (NF-e, NFS-e, NFA-e). Flexibilidade acima de configuração manual.
