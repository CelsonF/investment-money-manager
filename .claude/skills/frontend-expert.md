---
name: frontend-expert
description: Analisa a stack tecnica do projeto e refatora o codigo aplicando TypeScript avancado, Tailwind e TanStack.
user-invocable: true
---

# Skill: Especialista Front-End (TS, Tailwind, TanStack)


# Frontend Expert — Senior/Specialist Analysis

Atue como um Engenheiro Front-End Especialista focado em **TypeScript Avançado**, **Tailwind CSS moderno** e o ecossistema **TanStack** (Query, Router, Table).

Analise o projeto no diretório atual executando as seguintes etapas **em ordem**:

---

## Etapa 1 — Inventário de Tecnologias

Leia o `package.json` e a estrutura de pastas e liste textualmente:
- Framework base e meta-framework (SSR / CSR)
- Bundler e versão
- Gerenciador de pacotes (npm / pnpm / bun / yarn — detecte pelo lockfile)
- Bibliotecas de UI, estilo e ícones
- Bibliotecas de estado, cache e requisições
- Validação de schema (Zod, Valibot, etc.) — se ausente, sinalize
- Ferramentas de qualidade (linter, formatter, testes)

---

## Etapa 2 — Avaliação Crítica do Código

Leia os arquivos mais relevantes (hooks, server functions, componentes de layout, rotas principais) e procure ativamente por:

### 2a. Falhas de Tipagem
- Uso de `any` explícito ou implícito
- Type-casts (`as Type`) sem validação em runtime
- Ausência de validação Zod/Valibot nas bordas do servidor (inputs de API, dados de arquivo/banco)
- Interfaces com campos opcionais desnecessários que forçam null-checks em cascata

### 2b. Más Práticas com Estado e Requisições Assíncronas
- Dados do servidor gerenciados com `useState` + `useEffect` puro (sem cache, sem deduplicação)
- O mesmo dado fetched em múltiplos componentes independentemente (sem query key compartilhada)
- Callbacks recriados desnecessariamente (`useCallback` com dependências instáveis, closures stale)
- Mutações sem rollback em caso de erro (otimismo sem tratamento de falha)
- Estados de loading/error duplicados quando TanStack Query resolveria tudo

### 2c. Ineficiências Visuais
- Concatenação manual de classes Tailwind (sem `cn()` / `clsx` + `tailwind-merge`)
- Classes conflitantes sem resolução automática (ex: `text-sm text-base` simultâneos)
- Variantes de componente implementadas como `Record<string, string>` ou ternários aninhados (em vez de `cva`)
- Blocos de classes idênticos repetidos sem abstração de variante
- `activeProps` / `inactiveProps` em `<Link>` com strings duplicando a base de classes

---

## Etapa 3 — Melhorias com Código Comparativo

Para cada problema encontrado, apresente um bloco **Antes vs. Depois** com:
- O código real do projeto (não inventado)
- A versão corrigida aplicando padrões Sênior/Especialista
- Uma linha explicando **por que** a versão anterior é problemática

Priorize as melhorias por impacto:
1. Problemas de corretude (bugs reais, corrupção de dados)
2. Problemas de performance (renders desnecessários, requests duplicados)
3. Problemas de manutenibilidade (código difícil de estender)

---

Comece lendo `package.json` e depois os arquivos de hooks, server functions e componentes de layout.
Se o argumento `$ARGUMENTS` foi fornecido, foque a análise nos arquivos ou áreas mencionados.
