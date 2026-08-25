/* Boleador de Desenho — configuração
 *
 * Bibliotecas externas:
 *   pdf.js   — leitura e renderização do desenho em PDF
 *   pdf-lib  — gravação dos balões em PDF, preservando o desenho original
 *
 * As duas são carregadas primeiro de vendor/ (modo offline) e, se não
 * existirem ali, de CDN público. Nenhuma delas envia dados: apenas o código
 * da biblioteca é baixado. Veja o README, seção "Modo offline".
 */
window.BOLEADOR_CFG = {
  versao: "1.4.0",

  pdfjsLocal: false,
  pdfLibLocal: false,

  pdfjsCdn: [
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js"
  ],
  workerCdn:   "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
  workerLocal: "vendor/pdf.worker.min.js",

  pdfLibCdn: [
    "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
    "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"
  ],

  /* Tenta os endereços em ordem: se o primeiro falhar, cai para o seguinte. */
  carregarEmCadeia: function (urls, indice) {
    indice = indice || 0;
    if (indice >= urls.length) return;
    var cfg = this, s = document.createElement("script");
    s.src = urls[indice];
    s.async = false;
    s.onerror = function () { cfg.carregarEmCadeia(urls, indice + 1); };
    document.head.appendChild(s);
  },

  carregarPdfjs:  function () { this.carregarEmCadeia(this.pdfjsCdn); },
  carregarPdfLib: function () { this.carregarEmCadeia(this.pdfLibCdn); },

  workerSrc: function () {
    return this.pdfjsLocal ? this.workerLocal : this.workerCdn;
  }
};
