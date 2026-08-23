/* Boleador de Desenho — interface
 * Liga os controles da régua, o mouse sobre o desenho, o teclado e a
 * atualização do carimbo/barra de status. Último script a carregar.
 */
(function (B) {
  "use strict";

  var E = B.estado;
  var folha, area, arraste = null;

  document.addEventListener("DOMContentLoaded", iniciar);

  function iniciar() {
    B.viewer.iniciar();
    B.baloes.iniciar();

    folha = B.$("sheet");
    area  = B.$("viewer");
    folha.classList.add("adding");

    B.$("fVer").textContent  = B.VERSAO;
    B.$("fVer2").textContent = B.VERSAO;

    ligarArquivos();
    ligarNavegacao();
    ligarFerramentas();
    ligarDesenho();
    ligarTeclado();
    ligarAjuda();

    B.on("render",    atualizarCarimbo);
    B.on("mudou",     function () { atualizarCarimbo(); atualizarSelecao(); });
    B.on("selecao",   atualizarSelecao);
    B.on("documento", function () { atualizarCarimbo(); atualizarSelecao(); });

    atualizarCarimbo();
  }

  /* ---------- abertura de arquivos ---------- */
  function ligarArquivos() {
    var input = B.$("file");
    B.$("btnOpen").addEventListener("click", function () { input.click(); });
    B.$("btnOpen2").addEventListener("click", function () { input.click(); });
    input.addEventListener("change", function (e) {
      B.viewer.abrirArquivo(e.target.files[0]);
      e.target.value = "";
    });

    ["dragenter", "dragover"].forEach(function (ev) {
      area.addEventListener(ev, function (e) { e.preventDefault(); area.classList.add("dragover"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      area.addEventListener(ev, function (e) { e.preventDefault(); area.classList.remove("dragover"); });
    });
    area.addEventListener("drop", function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) B.viewer.abrirArquivo(f);
    });
  }

  /* ---------- páginas e zoom ---------- */
  function ligarNavegacao() {
    B.$("btnPrev").addEventListener("click", function () { B.viewer.irParaPagina(E.pagina - 1); });
    B.$("btnNext").addEventListener("click", function () { B.viewer.irParaPagina(E.pagina + 1); });
    B.$("btnZoomIn").addEventListener("click", function () { B.viewer.definirZoom(E.zoom * 1.25); });
    B.$("btnZoomOut").addEventListener("click", function () { B.viewer.definirZoom(E.zoom / 1.25); });
    B.$("btnFit").addEventListener("click", function () { B.viewer.ajustarLargura(); });
    window.addEventListener("resize", function () { if (E.tipo) B.viewer.renderizar(); });
  }

  /* ---------- ferramentas ---------- */
  function ligarFerramentas() {
    B.$("btnMode").addEventListener("click", function () {
      E.modo = E.modo === "add" ? "select" : "add";
      this.setAttribute("aria-pressed", E.modo === "add" ? "true" : "false");
      this.textContent = "Modo: " + (E.modo === "add" ? "bolear" : "selecionar");
      folha.classList.toggle("adding", E.modo === "add");
    });

    B.$("selColor").addEventListener("change", function () {
      var b = E.selecionado && B.baloes.porId(E.selecionado);
      if (b) { b.cor = this.value; B.baloes.desenhar(); atualizarSelecao(); }
    });

    B.$("selShape").addEventListener("change", function () {
      var b = E.selecionado && B.baloes.porId(E.selecionado);
      if (b) { b.forma = this.value; B.baloes.desenhar(); }
    });

    B.$("rngSize").addEventListener("input", function () {
      E.tamanho = parseInt(this.value, 10) / 1000;
      B.baloes.desenhar();
    });

    B.$("numStart").addEventListener("change", function () {
      if (!E.baloes.length) { B.baloes.sincronizarNumero(); atualizarCarimbo(); }
      else B.aviso("O número inicial vale a partir de um desenho vazio. Use Renumerar para reordenar o que já existe.");
    });

    B.$("btnRenumber").addEventListener("click", function () {
      if (!E.baloes.length) return;
      B.baloes.renumerar();
      B.aviso("Renumerado na ordem de leitura do desenho (cima → baixo, esquerda → direita).");
    });

    B.$("btnUndo").addEventListener("click", desfazer);

    B.$("btnClear").addEventListener("click", function () {
      var n = B.baloes.daPagina().length;
      if (!n) return;
      if (!confirm("Apagar os " + n + " balões da página " + E.pagina + "?")) return;
      B.baloes.limparPagina();
    });

    B.$("btnPng").addEventListener("click", function () { B.exportar.png(); });
    B.$("btnPdf").addEventListener("click", function () { B.exportar.pdf(); });
  }

  function desfazer() {
    if (!B.historico.desfazer()) { B.aviso("Nada para desfazer."); return; }
    B.baloes.desenhar();
    atualizarCarimbo();
    atualizarSelecao();
  }

  /* ---------- mouse sobre o desenho ---------- */
  function ligarDesenho() {
    folha.addEventListener("pointerdown", function (e) {
      if (!E.tipo) return;
      var g = e.target.closest ? e.target.closest(".balloon") : null;

      if (g) {
        e.preventDefault();
        B.baloes.selecionar(g.dataset.id);
        arraste = { id: g.dataset.id, moveu: false };
        g.classList.add("dragging");
        try { folha.setPointerCapture(e.pointerId); } catch (err) {}
        return;
      }

      if (E.modo === "add") {
        var p = B.viewer.ponto(e);
        B.baloes.adicionar(p.x, p.y);
      } else {
        B.baloes.selecionar(null);
      }
    });

    folha.addEventListener("pointermove", function (e) {
      var p = B.viewer.ponto(e);
      B.$("stCoord").textContent = "X " + (p.x * 100).toFixed(1) + "% · Y " + (p.y * 100).toFixed(1) + "%";
      if (!arraste) return;
      if (!arraste.moveu) { B.historico.salvar(); arraste.moveu = true; }
      B.baloes.mover(arraste.id, p.x, p.y);
    });

    ["pointerup", "pointercancel"].forEach(function (ev) {
      folha.addEventListener(ev, function (e) {
        if (!arraste) return;
        arraste = null;
        B.baloes.desenhar();
        try { folha.releasePointerCapture(e.pointerId); } catch (err) {}
      });
    });
  }

  /* ---------- teclado ---------- */
  function ligarTeclado() {
    document.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "select" || tag === "textarea") return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); desfazer(); return; }
      if (!E.selecionado) return;

      var b = B.baloes.porId(E.selecionado);
      if (!b) return;

      if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); B.baloes.remover(b.id); return; }

      var passo = e.shiftKey ? 0.01 : 0.002, x = b.x, y = b.y, moveu = false;
      if (e.key === "ArrowLeft")  { x -= passo; moveu = true; }
      if (e.key === "ArrowRight") { x += passo; moveu = true; }
      if (e.key === "ArrowUp")    { y -= passo; moveu = true; }
      if (e.key === "ArrowDown")  { y += passo; moveu = true; }
      if (moveu) { e.preventDefault(); B.baloes.mover(b.id, x, y); }
    });
  }

  /* ---------- ajuda ---------- */
  function ligarAjuda() {
    var dlg = B.$("dlgAjuda");
    B.$("btnAjuda").addEventListener("click", function () {
      if (dlg.showModal) dlg.showModal();
      else dlg.setAttribute("open", "");
    });
  }

  /* ---------- carimbo e status ---------- */
  function atualizarCarimbo() {
    B.$("fDoc").textContent   = E.nome || "—";
    B.$("fPage").textContent  = E.tipo ? (E.pagina + " de " + E.paginas) : "—";
    B.$("fCount").textContent = E.baloes.length;
    B.$("fNext").textContent  = E.proximo;
    B.$("pageLabel").textContent = E.tipo ? (E.pagina + "/" + E.paginas) : "–/–";
    B.$("zoomLabel").textContent = Math.round(E.zoom * 100) + "%";
    B.$("btnPrev").disabled = !E.tipo || E.pagina <= 1;
    B.$("btnNext").disabled = !E.tipo || E.pagina >= E.paginas;
  }

  function atualizarSelecao() {
    var b = E.selecionado && B.baloes.porId(E.selecionado);
    B.$("stSel").textContent = b
      ? ("Balão " + b.num + " · " + B.nomeCorDe(b))
      : "Nenhum balão selecionado";
  }

})(window.Boleador);
