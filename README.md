# Meu Bolso · Controle financeiro pessoal

Aplicativo web para controlar as finanças pessoais: **funciona 100% offline**, os dados ficam
salvos só no seu celular (localStorage) e pode ser instalado na tela inicial como um app (PWA).

Feito em HTML + JavaScript puro — sem servidor, sem dependência, sem rastreamento.

## Telas

| Tela | O que faz |
|---|---|
| **Painel** | Visão do mês: receitas, despesas, investido, sobra, taxa de poupança e contas pendentes. Inclui *Orçado × Realizado* por categoria, regra **50/30/20** com barras, gastos por forma de pagamento e dois gráficos. |
| **Lançamentos** | Lista de tudo que entra e sai, com busca e filtros (categoria, mês, forma, status). Toque em **+** para adicionar. Marque contas como **pendentes** até pagar. |
| **Resumo** | O ano inteiro: tabela mensal (receitas, despesas, saldo acumulado, taxa de poupança), gasto por categoria e gráficos. |
| **Config** | Renda de referência, metas do 50/30/20, categorias, formas de pagamento, exportar/importar backup e recarregar a demonstração. |

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `meu-bolso`).
2. Envie esta pasta (arquivos na raiz do repositório):
   ```bash
   git init
   git add .
   git commit -m "meu-bolso v1"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/meu-bolso.git
   git push -u origin main
   ```
3. No repositório: **Settings → Pages → Source: Deploy from a branch → branch `main`, pasta `/ (root)` → Save**.
4. Em instantes o app fica em `https://SEU-USUARIO.github.io/meu-bolso/`.

> ⚠️ Importante: o acesso precisa ser via **HTTPS** (o GitHub Pages já faz isso) para o app
> instalar na tela inicial e funcionar offline.

## Como instalar no celular

1. Abra a URL do app no navegador do celular.
2. **Android (Chrome):** menu ⋮ → *Adicionar à tela inicial* (ou *Instalar app*).
3. **iPhone (Safari):** botão Compartilhar → *Adicionar à Tela de Início*.

O ícone azul/verde aparece na tela e o app abre em tela cheia, mesmo sem internet.

## Dados

- Tudo fica no **localStorage** do navegador — nada é enviado a servidor nenhum.
- Use **Config → Exportar backup** de vez em quando e guarde o arquivo `.json`.
- Para trocar de celular, instale o app no novo aparelho e **Importe o backup**.
- ⚠️ Limpar os dados do navegador apaga os lançamentos. Exporte antes.

## Demonstração

O app abre pela primeira vez com dados fictícios (2025/2026) pra você ver tudo funcionando.
Quando quiser começar de verdade: **Config → Apagar todos os lançamentos**.
