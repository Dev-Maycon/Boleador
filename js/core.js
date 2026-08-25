/* Boleador de Desenho — núcleo
 * Estado da aplicação, histórico de desfazer, eventos e utilitários.
 * Nada aqui grava em disco, cookie, localStorage ou rede: o estado vive
 * apenas na memória da aba enquanto ela estiver aberta.
 */
window.Boleador = window.Boleador || {};

(function (B) {
  "use strict";

  B.VERSAO = (window.BOLEADOR_CFG && window.BOLEADOR_CFG.versao) || "1.0.0";

  /* ---------- estado ---------- */
  B.estado = {
    tipo: null,        // 'pdf' | 'img'
    nome: "",          // nome do arquivo aberto
    pdf: null,         // documento pdf.js
    imagem: null,      // objeto Image
    paginas: 1,
    pagina: 1,
    zoom: 1,
    larguraBase: 0,    // dimensões naturais da página atual
    alturaBase: 0,
    arquivo: null,     // referência ao File aberto (usada na exportação em PDF)
    baloes: [],        // { id, num, pagina, x, y, forma, cor }  x/y normalizados 0..1
    proximo: 1,
    selecionado: null,
    modo: "add",       // 'add' | 'select'
    tamanho: 0.020     // raio do balão como fração da largura da página
  };

  /* Cores disponíveis para o balão. A chave é o que fica gravado no
     arquivo de projeto; o valor é o traço usado na tela, no PNG e no PDF. */
  B.CORES = {
    preto:    "#111111",
    vermelho: "#C62828",
    azul:     "#1B49C4"
  };
  B.CHAVES_NOME_COR = { preto: "corPreto", vermelho: "corVermelho", azul: "corAzul" };
  B.COR_PADRAO = "azul";
  B.DESTAQUE = "#E8A317";   // realce do balão selecionado

  /* Cor de um balão, com compatibilidade com projetos da versão 1.0.0,
     em que a cor vinha da classe da característica. */
  B.corDe = function (b) {
    if (b.cor && B.CORES[b.cor]) return B.CORES[b.cor];
    if (b.classe === "crit" || b.classe === "sig") return B.CORES.vermelho;
    return B.CORES[B.COR_PADRAO];
  };

  B.nomeCorDe = function (b) {
    var chave = (b.cor && B.CHAVES_NOME_COR[b.cor]) || B.CHAVES_NOME_COR[B.COR_PADRAO];
    return B.t(chave);
  };

  /* ---------- eventos internos ---------- */
  var ouvintes = {};
  B.on = function (evento, fn) {
    (ouvintes[evento] = ouvintes[evento] || []).push(fn);
  };
  B.emitir = function (evento, dado) {
    (ouvintes[evento] || []).forEach(function (fn) { fn(dado); });
  };

  /* ---------- utilitários ---------- */
  B.$ = function (id) { return document.getElementById(id); };

  B.uid = function () { return "b" + Math.random().toString(36).slice(2, 9); };

  B.nomeBase = function () {
    return (B.estado.nome || "desenho").replace(/\.[^.]+$/, "");
  };

  B.aviso = function (msg) {
    var t = B.$("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(B.aviso._t);
    B.aviso._t = setTimeout(function () { t.classList.remove("show"); }, 2800);
  };

  B.baixar = function (blob, nome) {
    var a = document.createElement("a"), url = URL.createObjectURL(blob);
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 800);
  };

  /* ---------- histórico (desfazer) ---------- */
  var pilha = [], LIMITE = 80;

  B.historico = {
    salvar: function () {
      pilha.push(JSON.stringify({ b: B.estado.baloes, n: B.estado.proximo }));
      if (pilha.length > LIMITE) pilha.shift();
    },
    desfazer: function () {
      if (!pilha.length) return false;
      var s = JSON.parse(pilha.pop());
      B.estado.baloes = s.b;
      B.estado.proximo = s.n;
      B.estado.selecionado = null;
      return true;
    },
    limpar: function () { pilha = []; }
  };

})(window.Boleador);
