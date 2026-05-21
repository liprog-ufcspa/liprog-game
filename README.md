# Bug & Dispare

<img src="public/favicon.svg" alt="LiProg" width="48" />

Jogo de quiz com temática RPG sobre lógica de programação, desenvolvido pela **LIPROG** — Liga Acadêmica de Programação e Tecnologia em Saúde da UFCSPA — como atividade lúdica para o **UFCSPA Acolhe 2026**.

O jogador percorre 3 fases, escolhendo caminhos em cada cena. Cada caminho revela uma pergunta de múltipla escolha sobre programação. Acertou todas? Venceu o jogo.

<img src="public/intro-screen-print.png" alt="Tela inicial do Bug & Dispare" width="600" />

---

## Tecnologias

| Ferramenta | Uso |
| --- | --- |
| [React 19](https://react.dev/) | Interface e gerenciamento de estado |
| [Vite 8](https://vite.dev/) | Bundler e servidor de desenvolvimento |
| Google Sheets CSV | Fonte principal das perguntas |
| JSON local | Fallback offline das perguntas |
| GitHub Actions | CI/CD para deploy automático |
| GitHub Pages | Hospedagem do jogo |

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- npm

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/liprog-game.git
cd liprog-game

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente (veja a seção abaixo)
cp .env.example .env

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no navegador.

---

## Configurando as perguntas via Google Sheets

O jogo busca as perguntas de uma planilha pública do Google Sheets. Se a planilha não estiver configurada ou falhar, o jogo usa as perguntas do arquivo `src/data/questions.json` automaticamente.

### Passo a passo

1. Crie uma planilha no Google Sheets com as seguintes colunas (a primeira linha é o cabeçalho e é ignorada):

   | difficulty | text | code | option1 | option2 | option3 | option4 | correctIndex |
   | --- | --- | --- | --- | --- | --- | --- | --- |
   | easy | Qual é o tipo de `typeof null`? | | object | null | undefined | string | 0 |
   | medium | O que imprime o código? | `console.log(1 + '1')` | 2 | "11" | NaN | 11 | 1 |

   - **difficulty**: `easy`, `medium` ou `hard`
   - **text**: enunciado da pergunta
   - **code**: trecho de código opcional (pode ficar em branco)
   - **option1–4**: as quatro alternativas
   - **correctIndex**: índice da alternativa correta, começando em `0`

2. Publique a planilha como CSV:
   > Arquivo → Compartilhar → Publicar na web → Selecione a aba → Formato: CSV → Publicar

3. Copie o link gerado e cole no arquivo `.env`:

   ```env
   VITE_SHEETS_URL=https://docs.google.com/spreadsheets/d/e/...output=csv
   ```

4. Para o deploy via GitHub Actions, adicione esse link como secret no repositório:
   > Settings → Secrets and variables → Actions → New repository secret → Nome: `VITE_SHEETS_URL`

---

## Estrutura do projeto

```text
liprog-game/
├── src/
│   ├── components/          # Componentes de tela do jogo
│   │   ├── IntroScreen.jsx      # Tela inicial com botão de começar
│   │   ├── SceneScreen.jsx      # Cena com caminhos clicáveis
│   │   ├── QuestionScreen.jsx   # Pergunta com timer e 4 alternativas
│   │   ├── CorrectOverlay.jsx   # Overlay de acerto (confete + "Correto!")
│   │   ├── VictoryScreen.jsx    # Tela de vitória com confete
│   │   ├── GameOverScreen.jsx   # Tela de derrota com revisão da pergunta
│   │   ├── LoadingScreen.jsx    # Tela de carregamento inicial
│   │   ├── TransitionOverlay.jsx # Transição estilo Pokémon entre telas
│   │   ├── Fireflies.jsx        # Vagalumes animados decorativos
│   │   └── ErrorBoundary.jsx    # Captura erros React em produção
│   ├── data/
│   │   ├── questions.json   # Perguntas de fallback (offline)
│   │   └── scenes.json      # Coordenadas dos caminhos por cena
│   ├── utils/
│   │   ├── fetchQuestions.js  # Busca perguntas do Sheets ou JSON local
│   │   ├── session.js         # Estados do jogo e lógica de sessão
│   │   └── preload.js         # Lista de imagens pré-carregadas
│   ├── styles/
│   │   └── global.css       # Animações globais e estilos base
│   ├── assets/
│   │   └── scenes/          # Imagens de fundo das cenas (.webp)
│   ├── App.jsx              # Máquina de estados principal do jogo
│   └── main.jsx             # Ponto de entrada React
├── .env.example             # Modelo de variáveis de ambiente
├── vite.config.js           # Configuração do Vite (base path para GitHub Pages)
└── .github/workflows/
    └── deploy.yml           # Pipeline de build e deploy automático
```

---

## Fluxo do jogo

```text
Carregando → Intro → Cena (escolha o caminho) → Pergunta → Correto! → próxima Cena
                                                          ↘ Errou/Tempo → Game Over
```

Ao completar as 3 cenas com acertos, o jogador chega à tela de vitória.

---

## Adicionando ou editando perguntas

**Via Google Sheets (recomendado):** edite a planilha e recarregue o jogo. Nenhum deploy necessário.

**Via JSON local** (`src/data/questions.json`): edite o arquivo e faça um novo deploy. Use esse arquivo como referência para o formato.

O jogo exige pelo menos 1 pergunta em cada dificuldade (`easy`, `medium`, `hard`).

---

## Scripts disponíveis

```bash
npm run dev      # Servidor de desenvolvimento com HMR
npm run build    # Build de produção em dist/
npm run preview  # Visualiza o build localmente
npm run lint     # Verifica o código com ESLint
```

---

## Deploy

O deploy é feito automaticamente via GitHub Actions ao fazer push na branch `main`. O workflow em `.github/workflows/deploy.yml` faz o build e publica em GitHub Pages.

Para que as perguntas do Sheets funcionem em produção, o secret `VITE_SHEETS_URL` precisa estar configurado no repositório (veja a seção de configuração acima).
