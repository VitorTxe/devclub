# 🚀 DevClub - Sistema de Evolução em Tecnologia

> Uma plataforma web moderna, imersiva e interativa desenvolvida com foco em alta performance visual, shaders interativos via **WebGL (GLSL)** e animações fluidas com **GSAP & ScrollTrigger**.

---

## 📋 Sobre o Projeto

O **DevClub Lumina** é a landing page institucional e plataforma interativa de evolução em tecnologia da comunidade **DevClub**. O projeto foi construído utilizando conceitos avançados de UI/UX, trazendo uma experiência visual *dark/futurista* e fluida voltada para desenvolvedores de software.

---

## 🎨 Principais Recursos & Experiência do Usuário (UI/UX)

- **Fundo Dinâmico Interativo (WebGL Canvas Shader):**
  - Renderizado diretamente na placa de vídeo (GPU) através de Fragment Shaders customizados em **GLSL**.
  - Efeito de aurora verde neon procedural, ruído Perlin suave, grade holográfica 2D e feixe de luz interativo que reage ao movimento do cursor do mouse.
- **Animações e Efeitos GSAP + ScrollTrigger:**
  - Animações orientadas à rolagem da página (scroll-driven animations).
  - Linha do tempo interativa dos módulos do curso.
  - Efeitos de reveleção (*reveal*), estagnação de elementos (*pinning*) e interatividade de cartões.
- **Hero Mask Interativo:**
  - Efeito de máscara interativa com rastro dinâmico do cursor no topo da página.
- **Design System Customizado (DevClub Lumina):**
  - Paleta de cores em tema escuro (Dark Mode) baseada em tons profundos de preto/cinza com acentos em verde neon (`#42F481` / `#1DE469`).
  - Tipografia moderna integrada com Google Fonts e ícones via Material Symbols.
- **Design Totalmente Responsivo:**
  - Layout adaptável para telas móveis, tablets e desktops (Abordagem Mobile-First).

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Função no Projeto |
| :--- | :--- |
| **HTML5 Semantic** | Estrutura semântica da aplicação e SEO otimizado |
| **Tailwind CSS (CDN)** | Estilização ágil com extensão de tema do Design System |
| **WebGL & GLSL** | Renderização de Shaders procedurais em 2D na GPU |
| **GSAP (GreenSock 3.12)** | Motor principal de animações de alto desempenho |
| **ScrollTrigger Plugin** | Sincronização de animações complexas com a rolagem do usuário |
| **Material Symbols** | Biblioteca de ícones vetoriais modernos do Google |

---

## 📁 Estrutura de Arquivos

```text
.
├── assets/
│   └── logo.jpg               # Logo da aplicação / Favicon da aba
├── js/
│   ├── animations.js          # Lógica de animações e ScrollTrigger via GSAP
│   ├── gsap-bundle.js         # Pacote distribuído GSAP 3.12 + ScrollTrigger
│   ├── hero-mask.js           # Efeito de máscara interativa na seção Hero
│   ├── shader.js              # Shaders GLSL (Vertex & Fragment) e WebGL Canvas
│   └── site-experience.js     # Utilitários de interatividade da página
├── index.html                 # Página principal e configuração do Design System
├── README.md                  # Documentação explicativa do projeto
└── .gitignore                 # Arquivos ignorados no controle de versão
```

---

## 🔍 Detalhamento Técnico dos Scripts (`/js`)

### 1. `shader.js` (WebGL Engine)
Contém os códigos em **GLSL** para o canvas de fundo:
- `vertexSource`: Mapeia a geometria do canvas cobrindo 100% da tela.
- `fragmentSource`: Calcula a cor exata de cada pixel em tempo real a 60+ FPS, aplicando funções matemáticas procedurais (`noise`, `hash`, `smoothstep`, `vignette`) e cálculo de vetor para seguir o mouse (`u_mouse`).

### 2. `hero-mask.js`
Gerencia a interação com a seção inicial (Hero). Cria uma máscara visual que acompanha a velocidade e posição do ponteiro do mouse para revelar detalhes dinâmicos do fundo.

### 3. `animations.js`
Orquestra as animações do site utilizando **GSAP**. Controla a entrada suave de elementos (*fade in*, *slide up*), revelação de cards de conteúdo e contadores numéricos de progresso ao longo da rolagem.

---

## 🚀 Como Executar o Projeto Localmente

Como o projeto é construído em HTML5, Vanilla JavaScript e WebGL, você não precisa instalar dependências pesadas do Node.js.

1. **Clone o repositório ou baixe o projeto:**
   ```bash
   git clone https://github.com/VitorTxe/devclub.git
   ```

2. **Navegue até a pasta do projeto:**
   ```bash
   cd "Nova pasta"
   ```

3. **Execute com um servidor local:**
   - **Opção A (VS Code Live Server):** Abra a pasta no VS Code e clique em **Go Live**.
   - **Opção B (Python):**
     ```bash
     python -m http.server 3000
     ```
   - **Opção C (Node / npx):**
     ```bash
     npx serve .
     ```

4. **Acesse no navegador:**
   Abra `http://localhost:3000` (ou a porta fornecida pelo seu servidor local).

---

## 💡 Licença & Créditos

Desenvolvido por **Vitor Teixeira** - Todos os direitos reservados.
