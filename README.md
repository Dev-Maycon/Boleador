# Boleador de Desenho

Ferramenta web para **bolear (balonar) desenhos técnicos**: clique sobre cada cota, numere as
características e exporte em PDF vetorial ou PNG. Feita para PPAP, relatório dimensional,
plano de controle e instrução de inspeção.

**O desenho nunca sai da sua máquina.** Não há upload, servidor de aplicação, banco de dados
nem cadastro: tudo roda no navegador.

## Recursos

- PDF com várias páginas ou imagem PNG / JPG
- Balão numerado no ponto do clique, com numeração automática
- Arraste para reposicionar e setas do teclado para ajuste fino
- Formas: círculo, quadrado, losango e hexágono — cores: preto, vermelho e azul
- **Renumerar** na ordem de leitura do desenho (cima → baixo, esquerda → direita)
- **Exportar PDF** com os balões gravados sobre o desenho original, em todas as páginas, sem
  rasterizar: texto e cotas continuam nítidos e pesquisáveis
- **Exportar PNG** da página atual, em 2× a resolução

## Privacidade

O arquivo é lido pelo navegador com `FileReader`, permanece na memória da aba e desaparece ao
fechar. Sem cookies, `localStorage`, telemetria ou analytics. As únicas requisições de rede são
o download das bibliotecas (pdf.js e pdf-lib) e das fontes — elimináveis no modo offline.

Para rede fechada, o modo offline elimina qualquer requisição externa — procedimento no
manual. Declaração completa para análise de TI: [`docs/PRIVACIDADE.md`](docs/PRIVACIDADE.md).

## Como rodar

Descompacte e abra o `index.html`. Não há build, Node.js nem npm.

Para desenvolvimento, sirva a pasta:

```bash
npm install && npm run dev     # http://localhost:5173
# ou
python -m http.server 8000
```

## Estrutura

```
index.html       A ferramenta
docs.html        Manual, privacidade e licença
sobre.html       Sobre o projeto
contato.html     Contato
css/             Estilos
js/              config · core · viewer · balloons · export · ui
vendor/          Bibliotecas locais para o modo offline (opcional)
docs/            Declaração de tratamento de dados
vercel.json      Configuração de publicação estática
```

JavaScript sem framework e sem build. Os módulos são carregados na ordem declarada no HTML e
conversam por um namespace global (`window.Boleador`), o que mantém o funcionamento por
`file://`.

## Limitações

- O boleamento não é salvo: existe enquanto a aba estiver aberta. Exporte antes de fechar.
- PDF protegido por senha não recebe os balões: remova a proteção antes.
- Não há linha de chamada ligando o balão à cota, nem leitura automática de cotas.

## Licença

MIT — veja [LICENSE](LICENSE).
