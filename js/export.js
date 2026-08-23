/* Boleador de Desenho — exportação
 * Todas as saídas são geradas no próprio navegador e entregues como download
 * comum: o usuário escolhe onde salvar. Nada é enviado a servidor.
 *
 * PNG  — página atual rasterizada em 2x, com os balões gravados na imagem.
 * PDF  — documento inteiro, com os balões desenhados como vetor sobre o
 *        desenho original. O conteúdo do PDF de origem não é rasterizado:
 *        texto e cotas continuam nítidos e pesquisáveis.
 */
(function (B) {
  "use strict";

  var E = B.estado;
  var ESCALA_EXPORT = 2;

  B.exportar = {

    /* ================= PNG ================= */
    png: function () {
      if (!E.tipo) { B.aviso("Carregue um desenho primeiro."); return; }
      var destino = document.createElement("canvas");

      if (E.tipo === "img") {
        destino.width  = Math.round(E.larguraBase * ESCALA_EXPORT);
        destino.height = Math.round(E.alturaBase  * ESCALA_EXPORT);
        var g = destino.getContext("2d");
        g.fillStyle = "#fff";
        g.fillRect(0, 0, destino.width, destino.height);
        g.drawImage(E.imagem, 0, 0, destino.width, destino.height);
        finalizar(destino);
        return;
      }

      E.pdf.getPage(E.pagina).then(function (pagina) {
        var vp = pagina.getViewport({ scale: ESCALA_EXPORT });
        destino.width  = Math.round(vp.width);
        destino.height = Math.round(vp.height);
        var g = destino.getContext("2d");
        g.fillStyle = "#fff";
        g.fillRect(0, 0, destino.width, destino.height);
        return pagina.render({ canvasContext: g, viewport: vp }).promise.then(function () {
          finalizar(destino);
        });
      }).catch(function (err) {
        console.error(err);
        B.aviso("Não foi possível gerar o PNG desta página.");
      });

      function finalizar(c) {
        B.baloes.desenharNoCanvas(c, c.width, c.height);
        c.toBlob(function (blob) {
          B.baixar(blob, B.nomeBase() + "-p" + E.pagina + "-boleado.png");
        });
      }
    },

    /* ================= PDF ================= */
    pdf: function () {
      if (!E.tipo || !E.arquivo) { B.aviso("Carregue um desenho primeiro."); return; }
      if (!window.PDFLib) {
        B.aviso("Biblioteca de PDF ainda não carregou. Verifique a conexão ou use o modo offline (pasta vendor).");
        return;
      }
      if (!E.baloes.length) { B.aviso("Ainda não há balões para gravar no PDF."); return; }

      B.aviso("Gerando o PDF…");
      gerarPdf().catch(function (err) {
        console.error(err);
        B.aviso("Não foi possível gerar o PDF. Se o arquivo original for protegido por senha, remova a proteção e tente de novo.");
      });
    },

  };

  /* ---------------- geração do PDF ---------------- */

  async function gerarPdf() {
    var PDFDocument = PDFLib.PDFDocument,
        StandardFonts = PDFLib.StandardFonts;

    var bytes = new Uint8Array(await E.arquivo.arrayBuffer());
    var doc;

    if (E.tipo === "pdf") {
      /* Carrega o PDF original e apenas acrescenta os balões: o desenho
         permanece vetorial, do jeito que veio do cliente. */
      doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    } else {
      doc = await PDFDocument.create();
      var img = /png/i.test(E.arquivo.type) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
      var pg = doc.addPage([img.width, img.height]);
      pg.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }

    var fonte = await doc.embedFont(StandardFonts.HelveticaBold);
    var paginas = doc.getPages();

    E.baloes.forEach(function (b) {
      var pagina = paginas[b.pagina - 1];
      if (pagina) desenharBalao(pagina, b, fonte);
    });

    var saida = await doc.save();
    B.baixar(new Blob([saida], { type: "application/pdf" }), B.nomeBase() + "-boleado.pdf");
    B.aviso("PDF gerado com " + E.baloes.length + " balões.");
  }

  function desenharBalao(pagina, b, fonte) {
    var rgb = PDFLib.rgb, degrees = PDFLib.degrees;

    var tam = pagina.getSize(), w = tam.width, h = tam.height;
    var giro = ((pagina.getRotation().angle % 360) + 360) % 360;
    var larguraExibida = (giro === 90 || giro === 270) ? h : w;
    var r = E.tamanho * larguraExibida;

    /* Converte a posição normalizada da tela para o sistema do PDF
       (origem no canto inferior esquerdo), respeitando /Rotate. */
    var u, v;
    if (giro === 90)       { u = b.y * w;           v = b.x * h; }
    else if (giro === 180) { u = w * (1 - b.x);     v = b.y * h; }
    else if (giro === 270) { u = w * (1 - b.y);     v = h * (1 - b.x); }
    else                   { u = b.x * w;           v = h - b.y * h; }

    var cor = paraRgb(B.corDe(b), rgb);
    var traco = Math.max(0.4, r * 0.13);
    var comum = {
      borderColor: cor,
      borderWidth: traco,
      color: rgb(1, 1, 1),
      opacity: 0.9
    };

    if (b.forma === "circle") {
      pagina.drawCircle(Object.assign({ x: u, y: v, size: r }, comum));
    } else if (b.forma === "square") {
      var s = r * 0.92;
      pagina.drawRectangle(Object.assign({ x: u - s, y: v - s, width: s * 2, height: s * 2 }, comum));
    } else {
      pagina.drawSvgPath(caminhoSvg(b.forma, r), Object.assign({ x: u, y: v }, comum));
    }

    /* Número centrado no balão, acompanhando o giro da página. */
    var corpo = String(b.num);
    var corpoTam = r * 1.05;
    var largura = fonte.widthOfTextAtSize(corpo, corpoTam);
    var a = giro * Math.PI / 180;
    var dx = -largura / 2, dy = -corpoTam * 0.35;

    pagina.drawText(corpo, {
      x: u + dx * Math.cos(a) - dy * Math.sin(a),
      y: v + dx * Math.sin(a) + dy * Math.cos(a),
      size: corpoTam,
      font: fonte,
      color: cor,
      rotate: degrees(giro)
    });
  }

  /* Caminho SVG centrado na origem, com eixo Y para baixo (convenção do
     drawSvgPath do pdf-lib). Formas simétricas, então o giro não altera. */
  function caminhoSvg(forma, r) {
    if (forma === "diamond") {
      var d = r * 1.28;
      return "M 0 " + (-d) + " L " + d + " 0 L 0 " + d + " L " + (-d) + " 0 Z";
    }
    var p = [];
    for (var i = 0; i < 6; i++) {
      var ang = Math.PI / 180 * (60 * i - 30);
      p.push((r * Math.cos(ang)).toFixed(3) + " " + (r * Math.sin(ang)).toFixed(3));
    }
    return "M " + p.join(" L ") + " Z";
  }

  function paraRgb(hex, rgb) {
    var n = parseInt(hex.replace("#", ""), 16);
    return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  }

})(window.Boleador);
