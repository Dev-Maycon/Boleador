# Boleador de Desenho

Ferramenta para **balonamento (boleamento) de desenhos técnicos**: abre o desenho em PDF
ou imagem, marca cada característica com um balão numerado no ponto do clique e exporta o
desenho marcado para uso em PPAP, relatório dimensional, plano de controle, FMEA ou
instrução de inspeção.

**O desenho não é enviado para lugar nenhum.** Não há servidor de aplicação, banco de dados,
conta de usuário ou nuvem: tudo acontece dentro do navegador, na máquina de quem está
usando. Detalhes em [Privacidade e dados](docs/PRIVACIDADE.md).

---

## Índice

- [Recursos](#recursos)
- [Confidencialidade](#confidencialidade)
- [Instalação e uso](#instalacao-e-uso)
- [Como bolear](#como-bolear)
- [Atalhos de teclado](#atalhos-de-teclado)
- [Arquivos gerados](#arquivos-gerados)
- [Documentação dentro do site](#documentacao-dentro-do-site)
- [Publicação no Vercel](#publicacao-no-vercel)
- [Publicação na intranet](#publicacao-na-intranet)
- [Modo offline (rede fechada)](#modo-offline-rede-fechada)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Compatibilidade](#compatibilidade)
- [Limitações conhecidas](#limitacoes-conhecidas)
- [Licença](#licenca)

---

## Recursos

- Abertura de **PDF com várias páginas** ou imagem **PNG / JPG**
- Balão numerado na posição exata do clique, com numeração automática
- Reposicionamento por arraste e ajuste fino pelo teclado
- **Formas**: círculo, quadrado, losango e hexágono
- **Cores**: preto, vermelho e azul, escolhidas a cada balão
- Tamanho do balão proporcional à folha — a marcação sai igual em qualquer zoom
- **Renumerar** na ordem de leitura do desenho, de cima para baixo e da esquerda para a direita
- Desfazer, limpar página e número inicial configurável
- **Exportação em PDF** com os balões gravados sobre o desenho original, em todas as
  páginas de uma vez, sem rasterizar o desenho
- **Exportação em PNG** da página atual, em 2× a resolução da página

---

## Confidencialidade

Desenho de cliente costuma estar sob acordo de confidencialidade, e é comum a área de
qualidade não poder subir esse arquivo em site de terceiro. Esta ferramenta foi feita
justamente para esse cenário:

| Item | Comportamento |
|---|---|
| Upload do desenho | **Não existe.** O arquivo é lido pelo navegador com a API `FileReader`, direto do disco |
| Servidor de aplicação / banco de dados | **Não existe.** São arquivos estáticos: HTML, CSS e JavaScript |
| Cookies, `localStorage`, telemetria, analytics | **Não usados** |
| Onde o desenho fica | Somente na memória da aba. Ao fechar, nada permanece |
| O que é salvo | Apenas o que você exportar (PDF ou PNG), no local que você escolher |
| Tráfego de rede | Somente o download das bibliotecas e fontes na abertura da página — eliminável, veja [Modo offline](#modo-offline-rede-fechada) |

Publicada em servidor, a página segue com uma política de segurança de conteúdo (CSP) que
restringe as origens que o navegador aceita carregar e bloqueia envio para terceiros. A
configuração está em `vercel.json` e pode ser replicada em IIS, Apache ou nginx.

---

## Instalação e uso

**Para usar**, não há instalação, build, Node.js nem npm: descompacte a pasta e dê duplo
clique em `index.html`.

Para desenvolvimento, servir a pasta reproduz exatamente o comportamento de produção.
Escolha uma das opções abaixo.

**Live Server (VS Code, mais simples)**
Instale a extensão *Live Server*, clique com o botão direito em `index.html` e escolha
**Open with Live Server**.

**npm** — o `package.json` existe apenas para subir um servidor estático em
desenvolvimento; não há etapa de build:

```bash
cd boleador
npm install        # só na primeira vez, instala o http-server
npm run dev        # abre http://localhost:5173
```

**Python**, se Node.js não estiver disponível:

```bash
cd boleador
python -m http.server 8000
# abra http://localhost:8000
```

> A pasta `node_modules/` e o `package.json` servem só ao desenvolvimento. Na publicação,
> nada disso é necessário: bastam os arquivos estáticos.

---

## Como bolear

1. Abra o desenho pelo botão **Abrir desenho** ou arraste o arquivo para a área central.
2. Com o botão em **Modo: bolear**, clique sobre cada cota. O balão recebe o próximo número
   da sequência.
3. Escolha **forma** e **cor** antes do clique; com um balão selecionado, os dois seletores
   alteram esse balão.
4. Arraste o balão para acertar a posição; as setas do teclado fazem o ajuste fino.
5. Terminada a marcação, **Renumerar** coloca a sequência na ordem de leitura do desenho.
6. **Exportar PDF** grava os balões sobre o desenho original, em todas as páginas de uma vez.
7. **Exportar PNG** gera a página atual como imagem, quando o destino é uma apresentação ou
   um relatório em Word.

O boleamento vive enquanto a aba estiver aberta. Exporte antes de fechar.

---

## Atalhos de teclado

| Atalho | Ação |
|---|---|
| `Del` | Apaga o balão selecionado |
| `←` `→` `↑` `↓` | Move o balão selecionado |
| `Shift` + setas | Move com passo maior |
| `Ctrl` + `Z` | Desfaz a última ação |

---

## Arquivos gerados

**PDF** — `<desenho>-boleado.pdf`
Documento completo com os balões desenhados como vetor sobre o desenho original. O
conteúdo do PDF de origem **não é rasterizado**: texto, cotas e linhas continuam nítidos em
qualquer ampliação, o arquivo permanece leve e o texto segue pesquisável. Páginas com
`/Rotate` (desenho em paisagem girado) são tratadas corretamente. Desenho aberto como
imagem gera um PDF de uma página, no tamanho original da imagem.

**PNG** — `<desenho>-p<página>-boleado.png`
Página atual renderizada em 2× a resolução natural, com os balões gravados na imagem.

---

## Documentação dentro do site

A página `docs.html` reúne o manual, a declaração de privacidade e a licença, com sumário
lateral e folha de estilo própria para impressão. É para lá que aponta o botão
**Documentação** no cabeçalho da ferramenta.

É **HTML e CSS puros, sem JavaScript**: o conteúdo está escrito no próprio arquivo, de modo
que a página funciona publicada, servida localmente ou aberta por duplo clique, sem depender
de `fetch` nem de conversão em tempo de execução. As páginas `sobre.html` e `contato.html`
seguem o mesmo padrão.

Antes de publicar, ajuste em `sobre.html` e `contato.html` os trechos marcados com o
comentário `<!-- TROCAR -->`: e-mail, LinkedIn e endereço do repositório.

Endereços diretos: `/docs.html`, `/docs.html#privacidade`, `/docs.html#licenca`.

> Os arquivos `README.md` e `docs/PRIVACIDADE.md` continuam no projeto, para o repositório e
> para anexar em aprovações internas. Como o mesmo conteúdo aparece nos dois lugares,
> alterar um texto pede a atualização do outro.

---

## Publicação no Vercel

O projeto é estático e não tem etapa de build.

**Pela interface**

1. Suba a pasta para um repositório no GitHub, GitLab ou Bitbucket.
2. No Vercel, **Add New → Project** e importe o repositório.
3. Em *Framework Preset*, deixe **Other**. Não preencha *Build Command*; em *Output
   Directory*, use a raiz (`.`). O `vercel.json` já traz essas definições.
4. **Deploy**. A ferramenta responde na raiz do domínio e a documentação em `/docs.html`.

**Pela linha de comando**

```bash
npm i -g vercel
cd boleador
vercel          # pré-visualização
vercel --prod   # produção
```

O `vercel.json` aplica, além das definições de build, os cabeçalhos de segurança:
`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` e
`Permissions-Policy`. A CSP libera somente os CDNs das bibliotecas e das fontes.

Se você aplicar o [modo offline](#modo-offline-rede-fechada), pode fechar ainda mais a
política, trocando o valor da CSP por:

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; worker-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'
```

Nessa configuração o navegador recusa qualquer requisição para fora do próprio domínio —
uma garantia técnica verificável, útil quando a área de TI precisa aprovar o uso.

---

## Publicação na intranet

São arquivos estáticos: basta copiar a pasta para o diretório servido.

- **IIS**: copie para `C:\inetpub\wwwroot\boleador`
- **Apache / nginx**: copie para o `DocumentRoot` ou `root` do site
- **SharePoint**: publique como biblioteca de arquivos estáticos, se a política permitir

Para desenho sob NDA, a hospedagem interna combinada com o modo offline é a configuração
recomendada.

---

## Modo offline (rede fechada)

Por padrão, a leitura de PDF usa a biblioteca **pdf.js**, a gravação em PDF usa a
**pdf-lib** e as fontes vêm de CDN público — tráfego de saída que **não carrega nada do
desenho**, mas que pode não ser permitido em rede industrial isolada. Para eliminar
qualquer requisição externa:

1. Baixe, de uma máquina com internet, e coloque na pasta `vendor/`:
   - `pdf.min.js` e `pdf.worker.min.js` — pdf.js 3.11.174
   - `pdf-lib.min.js` — pdf-lib 1.17.1

   O `index.html` já tenta a pasta `vendor/` primeiro e só recorre ao CDN se o arquivo não
   existir.
2. Em `index.html` e em `docs.html`, remova as três linhas `<link>` referentes ao Google
   Fonts. As páginas passam a usar as fontes do próprio sistema, sem prejuízo de
   funcionamento.

Feito isso, a ferramenta funciona em máquina sem qualquer acesso à internet.

---

## Estrutura do projeto

```
boleador/
├── index.html              A ferramenta
├── docs.html               Documentação (HTML e CSS, sem JavaScript)
├── sobre.html              Sobre o projeto
├── contato.html            Contato
├── css/
│   └── boleador.css        Estilos das duas páginas
├── js/
│   ├── config.js           Versão e carregamento de pdf.js e pdf-lib
│   ├── core.js             Estado, histórico de desfazer, cores, utilitários
│   ├── viewer.js           Abertura e renderização de PDF/imagem, zoom, páginas
│   ├── balloons.js         Geometria e operações dos balões
│   ├── export.js           Exportação em PDF e em PNG
│   └── ui.js               Ligação dos controles, mouse, teclado e carimbo
├── vendor/                 Bibliotecas locais para o modo offline (opcional)
├── docs/
│   └── PRIVACIDADE.md      Mesma declaração da página, para anexar em aprovações
├── vercel.json             Build estático e cabeçalhos de segurança
├── package.json            Apenas o servidor estático de desenvolvimento
├── README.md
└── LICENSE
```

O código é JavaScript sem framework e sem etapa de build. Os módulos são carregados na
ordem declarada no HTML e conversam por um namespace global (`window.Boleador`), o que
mantém o funcionamento por `file://` — com módulos ES, a página quebraria ao ser aberta por
duplo clique.

---

## Compatibilidade

Chrome, Edge e Firefox atualizados (desktop). Safari 15.4 ou superior.
Funciona em tablet, com toque no lugar do clique. Não é indicado para celular: o desenho
técnico exige área de tela.

---

## Limitações conhecidas

- O boleamento não é salvo: existe enquanto a aba estiver aberta. Exporte antes de fechar.
- A exportação em PNG cobre uma página por vez; a exportação em PDF cobre o documento todo.
- PDF protegido por senha não recebe os balões: remova a proteção antes.
- Não há linha de chamada ligando o balão à cota.
- Não há tabela de características nem leitura automática de cotas — o balão marca a
  posição; o preenchimento dos valores continua no formulário dimensional que a empresa já
  utiliza.

---

## Licença

MIT — veja [LICENSE](LICENSE). Uso livre, inclusive comercial e interno, mantendo o aviso
de direito autoral.
"# Boleador" 
