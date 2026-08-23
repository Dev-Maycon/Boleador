/* Boleador de Desenho — visualização
 * Abertura do arquivo (PDF ou imagem) e renderização da página no canvas.
 * O arquivo é lido pelo próprio navegador com FileReader / object URL:
 * não há requisição de rede com o conteúdo do desenho.
 */
(function (B) {
  "use strict";

  var E = B.estado;
  var canvas, ctx, folha, overlay, vazio, area;
  var tarefaRender = null;

  B.viewer = {

    iniciar: function () {
      canvas  = B.$("canvas");
      ctx     = canvas.getContext("2d");
      folha   = B.$("sheet");
      overlay = B.$("overlay");
      vazio   = B.$("empty");
      area    = B.$("viewer");
    },

    /* ---------- abertura ---------- */
    abrirArquivo: function (arquivo) {
      if (!arquivo) return;
      E.nome = arquivo.name;
      E.arquivo = arquivo;   // guardado para a exportação em PDF
      if (arquivo.type === "application/pdf" || /\.pdf$/i.test(arquivo.name)) abrirPdf(arquivo);
      else if (arquivo.type.indexOf("image/") === 0) abrirImagem(arquivo);
      else B.aviso("Formato não suportado. Use PDF, PNG ou JPG.");
    },

    /* ---------- renderização ---------- */
    renderizar: renderizar,

    ajustarLargura: function () {
      if (!E.tipo) return;
      var disponivel = area.clientWidth - 56;
      E.zoom = Math.max(0.1, Math.min(4, disponivel / E.larguraBase));
      renderizar();
    },

    definirZoom: function (z) {
      if (!E.tipo) return;
      E.zoom = Math.max(0.15, Math.min(6, z));
      renderizar();
    },

    irParaPagina: function (n) {
      if (!E.tipo || n < 1 || n > E.paginas) return;
      E.pagina = n;
      E.selecionado = null;
      renderizar();
    },

    /* Ponto do clique convertido para coordenada normalizada (0..1) da página,
       o que mantém o balão no lugar certo em qualquer zoom ou exportação. */
    ponto: function (evento) {
      var r = canvas.getBoundingClientRect();
      return {
        x: (evento.clientX - r.left) / r.width,
        y: (evento.clientY - r.top) / r.height
      };
    }
  };

  /* ---------- internos ---------- */

  function limparDocumento() {
    E.baloes = [];
    E.selecionado = null;
    E.pdf = null;
    E.imagem = null;
    E.zoom = 1;
    B.historico.limpar();
    B.emitir("documento");
  }

  function abrirPdf(arquivo) {
    if (!window.pdfjsLib) {
      B.aviso("Leitor de PDF ainda não carregou. Verifique a conexão ou instale o modo offline (pasta vendor).");
      return;
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = window.BOLEADOR_CFG.workerSrc();

    var fr = new FileReader();
    fr.onload = function () {
      pdfjsLib.getDocument({ data: new Uint8Array(fr.result) }).promise.then(function (pdf) {
        limparDocumento();
        E.tipo = "pdf";
        E.pdf = pdf;
        E.paginas = pdf.numPages;
        E.pagina = 1;
        renderizar().then(function () { B.viewer.ajustarLargura(); });
      }).catch(function (err) {
        console.error(err);
        B.aviso("Não foi possível abrir este PDF.");
      });
    };
    fr.readAsArrayBuffer(arquivo);
  }

  function abrirImagem(arquivo) {
    var url = URL.createObjectURL(arquivo), img = new Image();
    img.onload = function () {
      limparDocumento();
      E.tipo = "img";
      E.imagem = img;
      E.paginas = 1;
      E.pagina = 1;
      renderizar().then(function () { B.viewer.ajustarLargura(); });
    };
    img.onerror = function () { B.aviso("Não foi possível abrir esta imagem."); };
    img.src = url;
  }

  function renderizar() {
    if (!E.tipo) return Promise.resolve();
    vazio.hidden = true;
    folha.hidden = false;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (E.tipo === "img") {
      E.larguraBase = E.imagem.naturalWidth;
      E.alturaBase  = E.imagem.naturalHeight;
      var w = Math.round(E.larguraBase * E.zoom * dpr),
          h = Math.round(E.alturaBase  * E.zoom * dpr);
      canvas.width = w; canvas.height = h;
      canvas.style.width  = (E.larguraBase * E.zoom) + "px";
      canvas.style.height = (E.alturaBase  * E.zoom) + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(E.imagem, 0, 0, w, h);
      posRender();
      return Promise.resolve();
    }

    if (tarefaRender) { try { tarefaRender.cancel(); } catch (e) {} tarefaRender = null; }

    return E.pdf.getPage(E.pagina).then(function (pagina) {
      var natural = pagina.getViewport({ scale: 1 });
      E.larguraBase = natural.width;
      E.alturaBase  = natural.height;

      var vp = pagina.getViewport({ scale: E.zoom * dpr });
      canvas.width  = Math.round(vp.width);
      canvas.height = Math.round(vp.height);
      canvas.style.width  = (E.larguraBase * E.zoom) + "px";
      canvas.style.height = (E.alturaBase  * E.zoom) + "px";

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      tarefaRender = pagina.render({ canvasContext: ctx, viewport: vp });
      return tarefaRender.promise.then(
        function () { tarefaRender = null; posRender(); },
        function (err) {
          if (err && err.name !== "RenderingCancelledException") console.error(err);
        }
      );
    });
  }

  /* Ajusta a folha e o overlay SVG ao tamanho renderizado e avisa a interface. */
  function posRender() {
    var w = E.larguraBase * E.zoom, h = E.alturaBase * E.zoom;
    folha.style.width  = w + "px";
    folha.style.height = h + "px";
    overlay.setAttribute("width", w);
    overlay.setAttribute("height", h);
    overlay.setAttribute("viewBox", "0 0 " + w + " " + h);
    B.baloes.desenhar();
    B.emitir("render");
  }

})(window.Boleador);
