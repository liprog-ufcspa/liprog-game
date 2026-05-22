# Bug & Dispare

<div align="center">
  <img src="public/favicon.svg" alt="LiProg" width="56" />
  <br/><br/>
  <img src="public/intro-screen-print.png" alt="Tela inicial do Bug & Dispare" width="680" />
  <br/><br/>

[![React](https://skillicons.dev/icons?i=react)](https://react.dev)
[![Vite](https://skillicons.dev/icons?i=vite)](https://vite.dev)
[![GitHub Actions](https://skillicons.dev/icons?i=githubactions)](https://github.com/features/actions)
</div>

---

## O que é o Bug & Dispare?

O **Bug & Dispare** é um jogo de quiz com temática RPG sobre lógica de programação, criado pela **LIPROG** — Liga Acadêmica de Programação e Tecnologia em Saúde da UFCSPA. O jogo é a atividade que a liga vai apresentar no **UFCSPA Acolhe**, feira aberta da universidade que apresenta à comunidade externa — e especialmente a estudantes do ensino médio — os cursos, projetos de pesquisa, extensão e ligas acadêmicas da UFCSPA.

A dinâmica surgiu na primeira edição do **UFCSPA Acolhe 2025**, de forma totalmente analógica: membros da LIPROG abordavam quem passava pelo evento e faziam perguntas de lógica de programação no estilo entrevista. Quem acertasse ganhava o direito de atirar num alvo de dardo para conquistar um prêmio.

Para o **UFCSPA Acolhe 2026** — segunda edição da dinâmica, ainda por vir — surgiu a ideia de gamificar essa experiência criando uma versão digital que preserva a essência da atividade (perguntas + recompensa) e adiciona uma camada de narrativa e atmosfera de RPG clássico, tornando a participação mais imersiva e lúdica.

---

## Inspirações

O jogo tomou como inspiração **The Legend of Zelda: Ocarina of Time** e **Pokémon HeartGold**: a ambientação de caverna com caminhos ramificados vem de Zelda, e a transição de tela com flash branco e expansão circular em preto é a clássica transição de batalha de Pokémon, recriada no componente `TransitionOverlay.jsx`.

---

## Cenários: DALL-E + atmosfera RPG

Todos os cenários do jogo são imagens geradas pelo **DALL-E (OpenAI)**, com prompts elaborados para replicar a estética pixel-art/fantasy dos jogos citados acima. Cada cena representa um momento diferente da jornada do jogador dentro de uma caverna com caminhos a explorar:

<div align="center">

| Cena | Descrição |
|------|-----------|
| <img src="src/assets/scenes/enter-scene.webp" width="300" alt="Entrada da caverna" /> | **Tela de entrada** — A boca da caverna, onde o jogador inicia sua jornada |
| <img src="src/assets/scenes/three-path-scene.webp" width="300" alt="Fase 1 — 3 caminhos" /> | **Fase 1** — Três caminhos com perguntas fáceis e médias |
| <img src="src/assets/scenes/three-path-scene-2.webp" width="300" alt="Fase 2 — 3 caminhos" /> | **Fase 2** — Segunda encruzilhada com progressão completa (fácil → médio → difícil) |
| <img src="src/assets/scenes/two-path-scene.webp" width="300" alt="Fase 3 — 2 caminhos" /> | **Fase 3** — Reta final, apenas perguntas médias e difíceis |
| <img src="src/assets/scenes/question-scene.webp" width="300" alt="Tela de pergunta" /> | **Tela de pergunta** — Fundo usado durante as questões |
| <img src="src/assets/scenes/win-scene.webp" width="300" alt="Tela de vitória" /> | **Vitória** — O destino ao completar os três desafios |
| <img src="src/assets/scenes/lose-scene.webp" width="300" alt="Tela de derrota" /> | **Game Over** — O fim da jornada ao errar uma questão |

</div>

---

Para que as imagens estáticas ganhem vida, dois efeitos de animação CSS são aplicados em todas as telas:

### Ken Burns
O efeito **Ken Burns** — técnica de movimento de câmera lenta em imagens estáticas, popularizada pelo cineasta de mesmo nome — é implementado via `@keyframes` CSS com `transform: scale()`, criando uma suave aproximação/zoom no cenário ao longo de 24–28 segundos. Combinado com uma animação de `vignette breathing` (a borda escura da tela que pulsa levemente), isso dá ao cenário a sensação de estar "respirando".

### Fireflies
Os vagalumes flutuando nas telas são implementados no componente `Fireflies.jsx` usando uma técnica do GeeksforGeeks: em vez de definir keyframes individuais por partícula, **três animações CSS independentes** (`ff-x`, `ff-y`, `ff-glow`) são aplicadas simultaneamente em cada vagalume com durações e delays diferentes. Como as três animações não têm relação de fase entre si, a trajetória resultante de cada vagalume parece orgânica e única — sem precisar de JavaScript ou keyframes individuais por elemento.

Referências:
- **Ken Burns effect (CSS)** — [css-tricks.com/ken-burns-effect-css](https://css-tricks.com/ken-burns-effect-css/)
- **Fireflies animation** — [GeeksforGeeks — Create a Fireflies Effect using HTML CSS & JavaScript](https://www.geeksforgeeks.org/create-a-fire-flies-effect-using-html-css-javascript/)

---

## Arquitetura do jogo

O jogo é construído em **React 19 + Vite** como uma Single Page Application (SPA) pura, sem roteamento — toda a navegação é gerenciada por uma máquina de estados em `App.jsx`.

### Máquina de estados

```
INTRO
  └─▶ SCENE (fase 0, 1 ou 2)
        └─▶ QUESTION
              ├─▶ CORRECT (1.8s) ──▶ SCENE (próxima fase) ou VICTORY
              └─▶ WRONG_REVEAL (2.5s) ──▶ GAMEOVER
```

Cada estado corresponde a um componente de tela diferente. O `App.jsx` controla qual componente renderizar, gerencia o áudio de fundo via Howler.js e coordena as transições animadas entre estados.

### Progressão de dificuldade por fase

O módulo `session.js` define a progressão de dificuldade garantida por fase, embaralhando os caminhos a cada sessão para variar a experiência:

```
Fase 1: fácil × 2 + médio   (nunca começa difícil)
Fase 2: fácil + médio + difícil   (progressão completa)
Fase 3: médio + difícil   (reta final desafiadora)
```

As questões de cada dificuldade são embaralhadas no início de cada sessão, e um contador garante que cada questão seja sorteada apenas uma vez por partida.

### Caminhos interativos nas cenas

O componente `SceneScreen.jsx` sobrepõe **áreas de clique circulares em SVG** sobre a imagem de fundo. As coordenadas e raios de cada área clicável são definidos em `src/data/scenes.json`, permitindo ajustes de posicionamento sem alterar o código. Ao passar o mouse (ou focar pelo teclado), um gradiente radial em SVG cria um efeito de "brilho de tochas" no caminho selecionado.

---

## Questões: Google Sheets como CMS

As perguntas são carregadas dinamicamente a partir de uma **planilha pública do Google Sheets**, exportada como CSV. Isso torna o banco de questões editável por qualquer colega da LIPROG sem necessidade de alterar o código — ideal para a dinâmica ao vivo.

### Formato da planilha

| difficulty | text | code | option1 | option2 | option3 | option4 | correctIndex |
|---|---|---|---|---|---|---|---|
| `easy` / `medium` / `hard` | Enunciado da pergunta | Trecho de código (opcional) | Opção A | Opção B | Opção C | Opção D | `0`–`3` |

### Como configurar

1. Crie a planilha com as colunas acima
2. Publique como CSV: `Arquivo → Compartilhar → Publicar na web → CSV`
3. Cole a URL no `.env`:
   ```env
   VITE_SHEETS_URL=https://docs.google.com/spreadsheets/d/e/.../output=csv
   ```
4. Para produção (GitHub Pages), adicione `VITE_SHEETS_URL` como secret no repositório

### Parser CSV e fallback

O módulo `fetchQuestions.js` implementa um parser RFC 4180 do zero (sem dependências externas) que suporta campos entre aspas com quebras de linha internas — necessário para questões com blocos de código multilinha. O fetch tem timeout de 6 segundos.

Caso a URL não esteja configurada ou o fetch falhe, o jogo usa automaticamente o arquivo `src/data/questions.json` como **fallback local**, garantindo que o jogo funcione mesmo sem conexão com o Sheets.

---

## Tech stack

| Tecnologia | Uso |
|---|---|
| [React 19](https://react.dev) | UI e gerenciamento de estado |
| [Vite](https://vitejs.dev) | Build e dev server |
| [Howler.js](https://howlerjs.com) | Áudio cross-browser (Web Audio API) |
| [DALL-E (OpenAI)](https://openai.com/dall-e) | Geração dos cenários |
| Google Sheets (CSV) | Banco de questões editável |
| GitHub Actions | Deploy automático no GitHub Pages |

---

## Rodando localmente

```bash
git clone https://github.com/liprog/liprog-game.git
cd liprog-game
npm install
cp .env.example .env   # configure VITE_SHEETS_URL se quiser usar o Sheets
npm run dev
```

O jogo funciona sem o `.env` usando as questões do fallback local.

---

## Deploy

Automático via GitHub Actions ao fazer push na branch `main`. O projeto é publicado no GitHub Pages com o base path `/liprog-game/`.

---

<div align="center">
  <sub>Feito com ♥ pela <strong>LIPROG — Liga Acadêmica de Programação e Tecnologia em Saúde</strong> · UFCSPA Acolhe 2026</sub>
  <br/>
  <img src="src/assets/ufcspa-acolhe-logo.webp" alt="UFCSPA Acolhe" height="48" />
  &nbsp;&nbsp;
  <img src="src/assets/liprog-logo.webp" alt="LIPROG" height="48" />
</div>
