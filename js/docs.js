/* Boleador de Desenho — página de documentação
 * Carrega os arquivos .md do próprio projeto e os apresenta formatados.
 * A leitura é feita por fetch a partir do mesmo servidor: nada é enviado,
 * nada vem de fora.
 */
(function (B) {
  "use strict";

  var DOCS = {
    manual:      { arquivo: "README.md",           titulo: "Manual" },
    privacidade: { arquivo: "docs/PRIVACIDADE.md", titulo: "Privacidade e dados" },
    licenca:     { arquivo: "LICENSE",             titulo: "Licença", puro: true }
  };

  var conteudo, sumario, atual;

  document.addEventListener("DOMContentLoaded", function () {
    conteudo = document.getElementById("conteudo");
    sumario  = document.getElementById("sumario");

    document.querySelectorAll("[data-doc]").forEach(function (btn) {
      btn.addEventListener("click", function () { carregar(btn.dataset.doc, true); });
    });

    var pedido = new URLSearchParams(location.search).get("doc");
    carregar(DOCS[pedido] ? pedido : "manual", false);
  });

  function carregar(chave, empurrarUrl) {
    var doc = DOCS[chave];
    if (!doc) return;
    atual = chave;

    document.querySelectorAll("[data-doc]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.doc === chave ? "true" : "false");
    });
    if (empurrarUrl && history.replaceState) {
      history.replaceState(null, "", "docs.html?doc=" + chave);
    }

    conteudo.innerHTML = '<p class="carregando">Carregando ' + doc.titulo.toLowerCase() + "…</p>";
    sumario.innerHTML = "";

    fetch(doc.arquivo, { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(function (texto) {
        if (atual !== chave) return;
        if (doc.puro) {
          conteudo.innerHTML = "<h1>" + doc.titulo + "</h1><pre><code>" +
            texto.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</code></pre>";
          return;
        }
        conteudo.innerHTML = B.markdown.paraHtml(texto);
        montarSumario(B.markdown.titulos);
        conteudo.scrollTop = 0;
      })
      .catch(function () {
        conteudo.innerHTML =
          '<h1>Não foi possível carregar</h1>' +
          '<p>O arquivo <code>' + doc.arquivo + '</code> não pôde ser lido. ' +
          'Isso acontece quando a página é aberta por duplo clique (protocolo <code>file://</code>), ' +
          'porque o navegador bloqueia a leitura de arquivos vizinhos.</p>' +
          '<p>Publicada no servidor, ou rodando localmente com <code>npm run dev</code>, ' +
          'a documentação aparece aqui normalmente. Enquanto isso, o arquivo pode ser aberto ' +
          'direto pela pasta do projeto.</p>';
      });
  }

  function montarSumario(titulos) {
    if (!titulos || titulos.length < 3) return;
    var html = ['<p class="rotulo">Nesta página</p><ul>'];
    titulos.forEach(function (t) {
      if (t.nivel === 1) return;
      html.push('<li class="n' + t.nivel + '"><a href="#' + t.id + '">' + t.texto + "</a></li>");
    });
    html.push("</ul>");
    sumario.innerHTML = html.join("");
  }

})(window.Boleador);
