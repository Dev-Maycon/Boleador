/* Boleador de Desenho — internacionalização
 * Dicionário português/inglês e troca de idioma pela interface.
 * A preferência é guardada em localStorage; nada disso envolve o desenho
 * carregado, que continua apenas na memória da aba.
 */
window.Boleador = window.Boleador || {};

(function (B) {
  "use strict";

  var CHAVE_ARMAZENAMENTO = "boleador_idioma";
  var PADRAO = "pt";

  var DIC = {
    pt: {
      tituloPagina: "Boleador de Desenho",
      metaDescricao: "Ferramenta local para balonamento (boleamento) de desenhos técnicos em PDF ou imagem. O desenho não sai do computador.",

      tagline: "Balonamento de desenho",
      campoDesenho: "Desenho",
      campoPagina: "Página",
      campoBaloes: "Balões",
      campoProximo: "Próximo nº",
      campoVersao: "Versão",
      navDocumentacao: "Documentação",
      navDocumentacaoTitulo: "Manual e declaração de privacidade",
      navSobre: "Sobre",
      navSobreTitulo: "Sobre o projeto e contato",
      btnAjuda: "Ajuda",
      btnAjudaTitulo: "Ajuda, atalhos e privacidade",

      btnOpen: "Abrir desenho",
      btnPrevTitulo: "Página anterior",
      btnNextTitulo: "Próxima página",
      btnZoomOutTitulo: "Reduzir",
      btnZoomInTitulo: "Ampliar",
      btnFit: "Ajustar",
      modoBolear: "Modo: bolear",
      modoSelecionar: "Modo: selecionar",
      labelForma: "Forma",
      formaCirculo: "Círculo",
      formaQuadrado: "Quadrado",
      formaLosango: "Losango",
      formaHexagono: "Hexágono",
      labelCor: "Cor",
      corPreto: "Preto",
      corVermelho: "Vermelho",
      corAzul: "Azul",
      labelTamanho: "Tamanho",
      labelInicio: "Início",
      btnRenumber: "Renumerar",
      btnUndo: "Desfazer",
      btnClear: "Limpar página",
      btnPdf: "Exportar PDF",
      btnPdfTitulo: "Grava os balões sobre o desenho original, em todas as páginas",
      btnPng: "Exportar PNG",
      btnPngTitulo: "Página atual como imagem",

      vazioTitulo: "Carregue o desenho",
      vazioTexto: "Solte aqui um PDF ou uma imagem (PNG, JPG) do desenho. Depois clique sobre cada cota para marcar o balão — a numeração segue a ordem dos cliques.",
      vazioLocal: "O arquivo é aberto e processado no seu próprio computador. Nada é enviado para servidor ou nuvem.",

      statusLocal: "Processamento local",
      statusLocalTitulo: "Todo o processamento acontece no navegador",
      statusDica: "Del apaga · setas movem · Ctrl+Z desfaz · arraste para reposicionar",
      semSelecao: "Nenhum balão selecionado",
      baloSelecionado: "Balão {num} · {cor}",

      h3ComoUsar: "Como usar",
      passo1: "Abra o desenho em PDF (várias páginas) ou imagem PNG/JPG — pode arrastar o arquivo para a tela.",
      passo2: "Com o botão em <strong>Modo: bolear</strong>, clique sobre cada cota. O balão recebe o próximo número da sequência.",
      passo3: "Arraste o balão para ajustar a posição; setas do teclado fazem o ajuste fino (Shift = passo maior).",
      passo4: "<strong>Renumerar</strong> reordena tudo na ordem de leitura do desenho: de cima para baixo, da esquerda para a direita.",
      passo5: "<strong>Exportar PDF</strong> grava os balões sobre o desenho original, em todas as páginas de uma vez. O desenho continua vetorial — texto e cotas seguem nítidos em qualquer ampliação e o arquivo fica leve.",
      passo6: "<strong>Exportar PNG</strong> gera a página atual como imagem, útil para colar direto em relatório ou apresentação.",

      h3CorForma: "Cor e forma",
      corFormaTexto: "Cor do balão: preto, vermelho ou azul. Forma: círculo, quadrado, losango ou hexágono. As duas seguem a convenção adotada pela empresa ou pelo cliente — é comum reservar o vermelho para característica crítica ou de segurança e o preto para cota comum. Com um balão selecionado, trocar a cor ou a forma altera aquele balão; sem seleção, a escolha vale para os próximos.",

      h3Atalhos: "Atalhos",
      atalhoDel: "<kbd>Del</kbd> apaga o balão selecionado",
      atalhoSetas: "<kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> movem o balão selecionado",
      atalhoShift: "<kbd>Shift</kbd> + setas movem com passo maior",
      atalhoUndo: "<kbd>Ctrl</kbd>+<kbd>Z</kbd> desfaz",

      h3Confidencialidade: "Confidencialidade",
      confidencialidade1: "O desenho é aberto pelo próprio navegador e permanece somente na memória do seu computador. <strong>Não existe upload, servidor de aplicação, banco de dados ou nuvem</strong> — o arquivo nunca é transmitido. Fechou a aba, não sobra nada: o que você quiser guardar sai por \"Exportar PNG\" ou \"Salvar projeto\", salvos onde você escolher.",
      confidencialidade2: "As únicas requisições de rede são o download das bibliotecas de leitura e gravação de PDF e das fontes. Para uso em rede fechada ou com desenho sob NDA, veja a <a href=\"docs.html#privacidade\">declaração de privacidade</a> e o <a href=\"docs.html#offline\">modo offline</a> descrito no manual.",

      btnFechar: "Fechar",

      msgFormatoInvalido: "Formato não suportado. Use PDF, PNG ou JPG.",
      msgPdfjsIndisponivel: "Leitor de PDF ainda não carregou. Verifique a conexão ou instale o modo offline (pasta vendor).",
      msgPdfAbrirErro: "Não foi possível abrir este PDF.",
      msgImagemAbrirErro: "Não foi possível abrir esta imagem.",
      msgInicioAvisoVazio: "O número inicial vale a partir de um desenho vazio. Use Renumerar para reordenar o que já existe.",
      msgRenumerado: "Renumerado na ordem de leitura do desenho (cima → baixo, esquerda → direita).",
      msgNadaDesfazer: "Nada para desfazer.",
      confirmLimparPagina: "Apagar os {n} balões da página {pagina}?",
      msgCarregarPrimeiro: "Carregue um desenho primeiro.",
      msgPngErro: "Não foi possível gerar o PNG desta página.",
      msgPdfLibIndisponivel: "Biblioteca de PDF ainda não carregou. Verifique a conexão ou use o modo offline (pasta vendor).",
      msgSemBaloesPdf: "Ainda não há balões para gravar no PDF.",
      msgGerandoPdf: "Gerando o PDF…",
      msgPdfErro: "Não foi possível gerar o PDF. Se o arquivo original for protegido por senha, remova a proteção e tente de novo.",
      msgPdfGerado: "PDF gerado com {n} balões."
    },

    en: {
      tituloPagina: "Boleador — Drawing Balloon Tool",
      metaDescricao: "Local tool for ballooning (marking) technical drawings in PDF or image format. The drawing never leaves your computer.",

      tagline: "Drawing ballooning",
      campoDesenho: "Drawing",
      campoPagina: "Page",
      campoBaloes: "Balloons",
      campoProximo: "Next #",
      campoVersao: "Version",
      navDocumentacao: "Documentation",
      navDocumentacaoTitulo: "Manual and privacy statement",
      navSobre: "About",
      navSobreTitulo: "About the project and contact",
      btnAjuda: "Help",
      btnAjudaTitulo: "Help, shortcuts and privacy",

      btnOpen: "Open drawing",
      btnPrevTitulo: "Previous page",
      btnNextTitulo: "Next page",
      btnZoomOutTitulo: "Zoom out",
      btnZoomInTitulo: "Zoom in",
      btnFit: "Fit",
      modoBolear: "Mode: balloon",
      modoSelecionar: "Mode: select",
      labelForma: "Shape",
      formaCirculo: "Circle",
      formaQuadrado: "Square",
      formaLosango: "Diamond",
      formaHexagono: "Hexagon",
      labelCor: "Color",
      corPreto: "Black",
      corVermelho: "Red",
      corAzul: "Blue",
      labelTamanho: "Size",
      labelInicio: "Start",
      btnRenumber: "Renumber",
      btnUndo: "Undo",
      btnClear: "Clear page",
      btnPdf: "Export PDF",
      btnPdfTitulo: "Draws the balloons onto the original drawing, on every page",
      btnPng: "Export PNG",
      btnPngTitulo: "Current page as image",

      vazioTitulo: "Load the drawing",
      vazioTexto: "Drop a PDF or an image (PNG, JPG) of the drawing here. Then click each dimension to place a balloon — numbering follows the order you click.",
      vazioLocal: "The file is opened and processed on your own computer. Nothing is sent to a server or the cloud.",

      statusLocal: "Local processing",
      statusLocalTitulo: "All processing happens in the browser",
      statusDica: "Del deletes · arrows move · Ctrl+Z undoes · drag to reposition",
      semSelecao: "No balloon selected",
      baloSelecionado: "Balloon {num} · {cor}",

      h3ComoUsar: "How to use",
      passo1: "Open the drawing as a PDF (multiple pages) or a PNG/JPG image — you can drag the file onto the screen.",
      passo2: "With the button set to <strong>Mode: balloon</strong>, click each dimension. The balloon gets the next number in the sequence.",
      passo3: "Drag a balloon to adjust its position; the arrow keys make fine adjustments (Shift = larger step).",
      passo4: "<strong>Renumber</strong> reorders everything in reading order: top to bottom, left to right.",
      passo5: "<strong>Export PDF</strong> draws the balloons onto the original drawing, on every page at once. The drawing stays vector-based — text and dimensions remain sharp at any zoom, and the file stays small.",
      passo6: "<strong>Export PNG</strong> generates the current page as an image, handy for pasting straight into a report or presentation.",

      h3CorForma: "Color and shape",
      corFormaTexto: "Balloon color: black, red or blue. Shape: circle, square, diamond or hexagon. Both follow the convention adopted by the company or the customer — it's common to reserve red for a critical or safety characteristic and black for a common dimension. With a balloon selected, changing the color or shape alters that balloon; with none selected, the choice applies to the next ones.",

      h3Atalhos: "Shortcuts",
      atalhoDel: "<kbd>Del</kbd> deletes the selected balloon",
      atalhoSetas: "<kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> move the selected balloon",
      atalhoShift: "<kbd>Shift</kbd> + arrows move with a larger step",
      atalhoUndo: "<kbd>Ctrl</kbd>+<kbd>Z</kbd> undoes",

      h3Confidencialidade: "Confidentiality",
      confidencialidade1: "The drawing is opened by the browser itself and stays only in your computer's memory. <strong>There is no upload, application server, database or cloud</strong> — the file is never transmitted. Close the tab and nothing remains: whatever you want to keep goes out through \"Export PNG\" or \"Save project\", saved wherever you choose.",
      confidencialidade2: "The only network requests are for downloading the PDF reading/writing libraries and the fonts. For use on a closed network or with a drawing under NDA, see the <a href=\"docs.html#privacidade\">privacy statement</a> and the <a href=\"docs.html#offline\">offline mode</a> described in the manual.",

      btnFechar: "Close",

      msgFormatoInvalido: "Unsupported format. Use PDF, PNG or JPG.",
      msgPdfjsIndisponivel: "The PDF reader hasn't loaded yet. Check your connection or install offline mode (vendor folder).",
      msgPdfAbrirErro: "Could not open this PDF.",
      msgImagemAbrirErro: "Could not open this image.",
      msgInicioAvisoVazio: "The starting number only applies to an empty drawing. Use Renumber to reorder what's already there.",
      msgRenumerado: "Renumbered in the drawing's reading order (top → bottom, left → right).",
      msgNadaDesfazer: "Nothing to undo.",
      confirmLimparPagina: "Delete the {n} balloons on page {pagina}?",
      msgCarregarPrimeiro: "Load a drawing first.",
      msgPngErro: "Could not generate the PNG for this page.",
      msgPdfLibIndisponivel: "The PDF library hasn't loaded yet. Check your connection or use offline mode (vendor folder).",
      msgSemBaloesPdf: "There are no balloons to draw into the PDF yet.",
      msgGerandoPdf: "Generating the PDF…",
      msgPdfErro: "Could not generate the PDF. If the original file is password-protected, remove the protection and try again.",
      msgPdfGerado: "PDF generated with {n} balloons."
    }
  };

  var atual = ler();

  function ler() {
    try {
      var salvo = window.localStorage && localStorage.getItem(CHAVE_ARMAZENAMENTO);
      if (salvo && DIC[salvo]) return salvo;
    } catch (e) {}
    var nav = ((navigator.language || navigator.userLanguage || "") + "").toLowerCase();
    return nav.indexOf("pt") === 0 ? "pt" : (nav.indexOf("en") === 0 ? "en" : PADRAO);
  }

  B.t = function (chave, vars) {
    var s = (DIC[atual] && DIC[atual][chave]) || (DIC[PADRAO] && DIC[PADRAO][chave]) || chave;
    if (vars) {
      for (var k in vars) {
        s = s.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
      }
    }
    return s;
  };

  B.idioma = {
    atual: function () { return atual; },
    definir: function (novo) {
      if (!DIC[novo] || novo === atual) return;
      atual = novo;
      try { localStorage.setItem(CHAVE_ARMAZENAMENTO, novo); } catch (e) {}
      aplicar();
    }
  };

  function aplicar() {
    document.documentElement.lang = atual === "en" ? "en" : "pt-BR";

    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = B.t(els[i].getAttribute("data-i18n"));
    }

    var elsHtml = document.querySelectorAll("[data-i18n-html]");
    for (i = 0; i < elsHtml.length; i++) {
      elsHtml[i].innerHTML = B.t(elsHtml[i].getAttribute("data-i18n-html"));
    }

    var elsTitulo = document.querySelectorAll("[data-i18n-title]");
    for (i = 0; i < elsTitulo.length; i++) {
      elsTitulo[i].setAttribute("title", B.t(elsTitulo[i].getAttribute("data-i18n-title")));
    }

    var tituloEl = document.getElementById("tituloPagina");
    if (tituloEl) document.title = B.t("tituloPagina");

    var metaEl = document.getElementById("metaDescricao");
    if (metaEl) metaEl.setAttribute("content", B.t("metaDescricao"));

    var btnPt = document.getElementById("btnLangPt"), btnEn = document.getElementById("btnLangEn");
    if (btnPt) btnPt.setAttribute("aria-pressed", atual === "pt" ? "true" : "false");
    if (btnEn) btnEn.setAttribute("aria-pressed", atual === "en" ? "true" : "false");

    B.emitir && B.emitir("idioma", atual);
  }

  function ligarBotoes() {
    var btnPt = document.getElementById("btnLangPt"), btnEn = document.getElementById("btnLangEn");
    if (btnPt) btnPt.addEventListener("click", function () { B.idioma.definir("pt"); });
    if (btnEn) btnEn.addEventListener("click", function () { B.idioma.definir("en"); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    ligarBotoes();
    aplicar();
  });

})(window.Boleador);
