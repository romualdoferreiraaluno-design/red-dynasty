# RED DYNASTY — Relatório de playtest (Alpha 0.8)

**Método.** 20 partidas completas, do título ao final, jogadas por um bot automatizado dentro do navegador (Playwright). Cada partida segue uma "personalidade" (pesos para amor, confiança de Mao, pressão social, pesquisa, dinheiro, ética; estilos fixos como "sempre a 1ª opção" e "aleatório"). Para escolher, o bot simula o efeito de cada opção no estado do jogo e escolhe a que mais combina com a persona. **Limite honesto:** o bot mede estrutura, ritmo, balanceamento e travamentos. Ele não mede emoção, leitura em tela pequena nem "sensação" de jogo. Essas partes foram avaliadas por inspeção (código, capturas de tela em celular, texto).

## Números
- 20/20 partidas terminaram, 0 travamentos, 0 erros de JavaScript.
- Finais obtidos: Império 8, Cinzas 7, Exílio 5, **Verdadeiro 0** (de propósito: o bot não vê a regra escondida; 9 das 20 partidas tinham os requisitos prontos no final).
- Texto por partida: ~37428 caracteres (~465 falas). Só de leitura: 30 a 50 minutos; com mapas, gestão e batalha, 1h a 1h20.
- Escolhas narrativas por partida: ~22. Turnos de gestão: 8 no jogo inteiro. Ações de batalha: 9 a 75.
- 29 falas (~2.000 caracteres) até a primeira decisão. Maior bloco sem decisão: 46 falas (cena da varanda).
- Dos 23 diálogos de escolha distintos, 10 têm uma opção que vence a outra em todos os números (escolha óbvia) e 8 dão efeito a só uma opção.
- Nenhuma partida teve a pressão social, a influência ou o dinheiro decidindo algo. Só pesquisa/amor/Mao entram na regra do final verdadeiro.

## Resultado por persona
| # | Persona | Final | Amor | Mao | Pressão | Pesquisa | Dinheiro | Ações de batalha | Final verdadeiro possível |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Idealista Ético | empire | 10 | 10 | 0 | 7 | $51 | 9 | sim |
| 2 | Romântico | empire | 10 | 10 | 6 | 4 | $455 | 9 | sim |
| 3 | Tecnocrata | exile | 5 | 10 | 4 | 9 | $296 | 12 | sim |
| 4 | Maquiavélico | ash | 2 | 10 | 0 | 4 | $336 | 17 | não |
| 5 | Pacifista | empire | 10 | 5 | 0 | 5 | $151 | 9 | sim |
| 6 | Min-maxer do final verdadeiro | exile | 10 | 10 | 0 | 10 | $166 | 9 | sim |
| 7 | Speedrunner (sempre 1ª opção) | ash | 8 | 10 | 7 | 7 | $503 | 16 | não |
| 8 | Contrário (sempre última) | ash | 2 | 9 | 0 | 2 | $266 | 51 | não |
| 9 | Aleatório puro | empire | 6 | 10 | 6 | 9 | $233 | 13 | sim |
| 10 | Preguiçoso (2ª opção) | ash | 4 | 9 | 10 | 5 | $513 | 20 | não |
| 11 | Avarento | ash | 5 | 9 | 0 | 4 | $296 | 17 | sim |
| 12 | Paranóico (segredos) | exile | 9 | 2 | 8 | 7 | $246 | 9 | não |
| 13 | Fiel a Mao | empire | 6 | 10 | 7 | 5 | $537 | 9 | não |
| 14 | Rebelde | empire | 9 | 1 | 10 | 6 | $301 | 15 | não |
| 15 | Curioso (maior impacto) | exile | 9 | 10 | 10 | 9 | $502 | 12 | não |
| 16 | Cientista | empire | 6 | 9 | 3 | 10 | $83 | 12 | sim |
| 17 | Social-democrata | exile | 6 | 10 | 0 | 4 | $256 | 12 | sim |
| 18 | Imprudente | ash | 5 | 6 | 10 | 10 | $58 | 17 | não |
| 19 | Emocional | ash | 10 | 3 | 9 | 7 | $356 | 21 | não |
| 20 | Cansado (desatento) | empire | 3 | 6 | 0 | 5 | $231 | 75 | não |

## Fontes consultadas
- [Beyond Branching: Crafting Reactive Narratives and Meaningful Player Choice (Wayline)](https://www.wayline.io/blog/crafting-reactive-narratives-meaningful-player-choice)
- [Designing interesting decisions in games, and when not to (Game Developer)](https://www.gamedeveloper.com/design/designing-interesting-decisions-in-games-and-when-not-to-)
- [Choices, part 2: exploration (itch.io devlog)](https://itch.io/devlog/210011/choices-part-2-exploration.amp)
- [Reigns: Her Majesty (Emily Short)](https://emshort.blog/2018/01/24/reigns-her-majesty/)
- [Save systems, an anatomy of visual novels (Fuwanovel)](https://forums.fuwanovel.moe/blogs/entry/4182-save-systems-%E2%80%93-an-anatomy-of-visual-novels)
- [Monogatari (repositório de documentação no GitHub)](https://github.com/Monogatari/Documentation)
