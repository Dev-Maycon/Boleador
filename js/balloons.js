/* Boleador de Desenho — balões
 * Geometria, desenho no overlay SVG e operações sobre os balões.
 * A mesma geometria alimenta a tela, a exportação em PNG (canvas) e a
 * exportação em PDF (vetorial), para que a marcação saia sempre igual.
 * As coordenadas são normalizadas (0..1) em relação à página, de modo que
 * o balão acompanha zoom, troca de página e exportação sem se deslocar.
 */
(function (B) {
  "use strict";

  var E = B.estado;
  var NS = "http://www.w3.org/2000/svg";
  var overlay;

  B.baloes = {

    iniciar: function () { overlay = B.$("overlay"); },

    /* ---------- consultas ---------- */
    daPagina: function () {
      return E.baloes.filter(function (b) { return b.pagina === E.pagina; });
    },

    porId: function (id) {
      for (var i = 0; i < E.baloes.length; i++) if (E.baloes[i].id === id) return E.baloes[i];
      return null;
    },

    /* ---------- numeração ---------- */
    inicioConfigurado: function () {
      return parseInt(B.$("numStart").value, 10) || 1;
    },

    /* Recalcula o próximo número: volta ao início quando não há balões e
       segue do maior número existente quando ainda há. */
    sincronizarNumero: function () {
      if (!E.baloes.length) { E.proximo = this.inicioConfigurado(); return; }
      var maior = 0;
      E.baloes.forEach(function (b) { if (b.num > maior) maior = b.num; });
      E.proximo = maior + 1;
    },

    /* ---------- operações ---------- */
    adicionar: function (x, y) {
      B.historico.salvar();
      var b = {
        id: B.uid(),
        num: E.proximo++,
        pagina: E.pagina,
        x: x,
        y: y,
        forma: B.$("selShape").value,
        cor: B.$("selColor").value
      };
      E.baloes.push(b);
      E.selecionado = b.id;
      this.desenhar(b.id);
      B.emitir("mudou");
      return b;
    },

    selecionar: function (id) {
      E.selecionado = id;
      this.desenhar();
      B.emitir("selecao");
    },

    remover: function (id) {
      B.historico.salvar();
      E.baloes = E.baloes.filter(function (b) { return b.id !== id; });
      if (E.selecionado === id) E.selecionado = null;
      this.sincronizarNumero();
      this.desenhar();
      B.emitir("mudou");
    },

    limparPagina: function () {
      B.historico.salvar();
      E.baloes = E.baloes.filter(function (b) { return b.pagina !== E.pagina; });
      E.selecionado = null;
      this.sincronizarNumero();
      this.desenhar();
      B.emitir("mudou");
    },

    /* Renumera na ordem de leitura do desenho: página, depois de cima para
       baixo em faixas de 3% da altura, e da esquerda para a direita. */
    renumerar: function () {
      if (!E.baloes.length) return;
      B.historico.salvar();
      var inicio = this.inicioConfigurado();
      var ordenados = E.baloes.slice().sort(function (a, b) {
        if (a.pagina !== b.pagina) return a.pagina - b.pagina;
        var dy = a.y - b.y;
        if (Math.abs(dy) > 0.03) return dy;
        return a.x - b.x;
      });
      ordenados.forEach(function (b, i) { b.num = inicio + i; });
      E.proximo = inicio + ordenados.length;
      this.desenhar();
      B.emitir("mudou");
    },

    mover: function (id, x, y) {
      var b = this.porId(id);
      if (!b) return;
      b.x = Math.max(0, Math.min(1, x));
      b.y = Math.max(0, Math.min(1, y));
      this.desenhar();
    },

    /* ---------- desenho ---------- */
    desenhar: function (recemCriado) {
      if (!overlay) return;
      while (overlay.firstChild) overlay.removeChild(overlay.firstChild);

      var W = E.larguraBase * E.zoom,
          H = E.alturaBase * E.zoom,
          r = E.tamanho * W;

      this.daPagina().forEach(function (b) {
        var cx = b.x * W, cy = b.y * H,
            cor = B.corDe(b),
            selecionado = E.selecionado === b.id;

        var g = el("g", {
          "class": "balloon" + (selecionado ? " sel" : "") + (recemCriado === b.id ? " new" : "")
        });
        g.dataset.id = b.id;

        var forma = (b.forma === "circle")
          ? el("circle", { cx: cx, cy: cy, r: r })
          : el("path", { d: caminho(b.forma, cx, cy, r) });
        forma.setAttribute("class", "bg ring");
        forma.setAttribute("stroke", selecionado ? B.DESTAQUE : cor);
        forma.setAttribute("stroke-width", Math.max(1, r * 0.13));
        g.appendChild(forma);

        var texto = el("text", { x: cx, y: cy + r * 0.03, "class": "num", fill: cor, "font-size": r * 1.02 });
        texto.textContent = b.num;
        g.appendChild(texto);

        overlay.appendChild(g);
      });
    },

    /* Usado também pela exportação em PNG, para que a marcação impressa
       fique idêntica à da tela. */
    desenharNoCanvas: function (destino, W, H) {
      var g = destino.getContext("2d"), r = E.tamanho * W;
      this.daPagina().forEach(function (b) {
        var cx = b.x * W, cy = b.y * H, cor = B.corDe(b);
        g.beginPath();
        if (b.forma === "circle") {
          g.arc(cx, cy, r, 0, Math.PI * 2);
        } else if (b.forma === "square") {
          var s = r * 0.92; g.rect(cx - s, cy - s, s * 2, s * 2);
        } else if (b.forma === "diamond") {
          var d = r * 1.28;
          g.moveTo(cx, cy - d); g.lineTo(cx + d, cy); g.lineTo(cx, cy + d); g.lineTo(cx - d, cy); g.closePath();
        } else {
          for (var i = 0; i < 6; i++) {
            var a = Math.PI / 180 * (60 * i - 30),
                px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
            i ? g.lineTo(px, py) : g.moveTo(px, py);
          }
          g.closePath();
        }
        g.fillStyle = "rgba(255,255,255,.92)";
        g.fill();
        g.lineWidth = Math.max(1, r * 0.13);
        g.strokeStyle = cor;
        g.stroke();
        g.fillStyle = cor;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.font = "600 " + (r * 1.02) + "px 'IBM Plex Mono', monospace";
        g.fillText(String(b.num), cx, cy + r * 0.03);
      });
    }
  };

  /* ---------- geometria ---------- */
  function caminho(forma, cx, cy, r) {
    if (forma === "square") {
      var s = r * 0.92;
      return "M" + (cx - s) + " " + (cy - s) + "H" + (cx + s) + "V" + (cy + s) + "H" + (cx - s) + "Z";
    }
    if (forma === "diamond") {
      var d = r * 1.28;
      return "M" + cx + " " + (cy - d) + "L" + (cx + d) + " " + cy + "L" + cx + " " + (cy + d) + "L" + (cx - d) + " " + cy + "Z";
    }
    var p = [];
    for (var i = 0; i < 6; i++) {
      var a = Math.PI / 180 * (60 * i - 30);
      p.push((cx + r * Math.cos(a)) + " " + (cy + r * Math.sin(a)));
    }
    return "M" + p.join("L") + "Z";
  }

  function el(nome, attrs) {
    var e = document.createElementNS(NS, nome);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

})(window.Boleador);
