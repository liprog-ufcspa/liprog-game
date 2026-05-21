# Bug & Dispare

<img src="public/favicon.svg" alt="LiProg" width="48" />

Jogo de quiz com temática RPG sobre lógica de programação, desenvolvido pela **LIPROG** — Liga Acadêmica de Programação e Tecnologia em Saúde da UFCSPA — como atividade lúdica para o **UFCSPA Acolhe 2026**.

<img src="public/intro-screen-print.png" alt="Tela inicial" width="600" />

---

[![React](https://skillicons.dev/icons?i=react)](https://react.dev)
[![Vite](https://skillicons.dev/icons?i=vite)](https://vite.dev)
[![GitHub Actions](https://skillicons.dev/icons?i=githubactions)](https://github.com/features/actions)

---

## Rodando localmente

```bash
git clone https://github.com/seu-usuario/liprog-game.git
cd liprog-game
npm install
cp .env.example .env
npm run dev
```

---

## Perguntas via Google Sheets

O jogo busca as perguntas de uma planilha pública. Se não configurado, usa o arquivo `src/data/questions.json` como fallback.

1. Crie uma planilha com as colunas:

   | difficulty | text | code | option1 | option2 | option3 | option4 | correctIndex |
   | --- | --- | --- | --- | --- | --- | --- | --- |

   - **difficulty**: `easy`, `medium` ou `hard`
   - **code**: trecho de código opcional (pode ficar em branco)
   - **correctIndex**: índice da resposta correta, começando em `0`

2. Publique como CSV: `Arquivo → Compartilhar → Publicar na web → CSV`

3. Cole a URL no `.env`:

   ```env
   VITE_SHEETS_URL=https://docs.google.com/spreadsheets/d/e/...output=csv
   ```

4. Para produção, adicione `VITE_SHEETS_URL` como secret no repositório GitHub.

---

## Deploy

Automático via GitHub Actions ao fazer push na branch `main`.
