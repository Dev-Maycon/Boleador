# Declaração de tratamento de dados — Boleador de Desenho

Documento destinado a análise de TI, segurança da informação e qualidade antes da liberação
de uso. Referente à versão **1.3.0**.

## 1. Natureza da aplicação

Conjunto de arquivos estáticos (HTML, CSS e JavaScript) executado inteiramente no navegador
do usuário. Não existe componente de servidor, API, autenticação, banco de dados ou serviço
em nuvem associado ao produto.

## 2. Tratamento do desenho carregado

| Item | Comportamento |
|---|---|
| Leitura do arquivo | Pela API `FileReader` / object URL do próprio navegador, a partir do disco local |
| Transmissão | Nenhuma. O conteúdo do desenho não trafega pela rede em nenhum momento |
| Armazenamento | Somente memória volátil da aba. Não há gravação em `localStorage`, `sessionStorage`, IndexedDB, cookie ou cache de aplicação |
| Retenção | Encerrada com o fechamento da aba ou do navegador |
| Cópia para terceiros | Não ocorre |

## 3. Saídas geradas

Todas as saídas são produzidas localmente e entregues pelo mecanismo de download do
navegador, com destino escolhido pelo usuário:

- **PDF** do documento com os balões gravados sobre o desenho original. O PDF de origem é
  lido e reescrito localmente pela biblioteca pdf-lib, sem rasterização e sem qualquer
  transmissão;
- **PNG** da página atual com os balões gravados.

A marcação em si não é persistida: existe apenas enquanto a aba estiver aberta.

## 4. Tráfego de rede

Na configuração padrão, o carregamento da página solicita recursos de dois domínios
públicos:

| Domínio | Recurso | Contém dado do usuário? |
|---|---|---|
| `cdnjs.cloudflare.com` | Bibliotecas pdf.js (leitura de PDF) e pdf-lib (gravação dos balões em PDF) | Não |
| `unpkg.com` | Mesmas bibliotecas, usado apenas se o primeiro endereço falhar | Não |
| `fonts.googleapis.com`, `fonts.gstatic.com` | Fontes tipográficas | Não |

Essas requisições ocorrem apenas na abertura da página e transportam somente os metadados
inerentes a qualquer requisição HTTP (endereço IP e cabeçalhos do navegador). **Nenhum
conteúdo de desenho, nome de arquivo ou dado de balonamento é enviado.**

Ambas as dependências podem ser eliminadas para operação sem qualquer acesso externo,
conforme a seção "Modo offline" do `README.md`. Recomenda-se, para ambiente industrial,
hospedar a ferramenta em servidor interno e aplicar o modo offline.

Publicada em servidor, a aplicação envia cabeçalhos de segurança, entre eles uma
`Content-Security-Policy` que limita as origens carregáveis pelo navegador e bloqueia envio
a terceiros. No modo offline, a política pode ser fechada em `default-src 'self'`, situação
em que o próprio navegador recusa qualquer requisição externa — garantia técnica
verificável em auditoria. A configuração de referência está no arquivo `vercel.json`.


## 5. Ausência de rastreamento

Não há analytics, telemetria, pixel de rastreamento, relatório de erro remoto, publicidade,
identificador de usuário ou de dispositivo.

## 6. Recomendações de uso

1. Hospedar em servidor interno da empresa (IIS, Apache, nginx) em vez de distribuir cópias
   avulsas, garantindo versão única e controlada.
2. Aplicar o modo offline em estações sem liberação de saída para internet.
3. Tratar os arquivos exportados (PDF e PNG) com a mesma classificação de
   confidencialidade do desenho de origem, armazenando-os nos diretórios controlados pela
   área de qualidade.
4. Verificar a integridade dos arquivos distribuídos, quando a política interna exigir
   controle de versão de software auxiliar.

## 7. Responsabilidade

A ferramenta não substitui o registro oficial de características do sistema da qualidade.
A conferência entre os balões marcados e o formulário dimensional é responsabilidade do
usuário.
