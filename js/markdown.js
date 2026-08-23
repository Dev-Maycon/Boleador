/* Boleador de Desenho — Markdown
 * Conversor Markdown → HTML enxuto, escrito à mão para não acrescentar
 * dependência externa à página de documentação: cobre exatamente o que os
 * arquivos do projeto usam (títulos, listas, tabelas, código, citação,
 * ênfase e links) e nada além disso.
 */
window.Boleador = window.Boleador || {};

(function (B) {
  "use strict";

  B.markdown = { paraHtml: paraHtml, titulos: [] };

  function escapar(t) {
    return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* Formatação dentro da linha: código, negrito, itálico e links. */
  function inline(t) {
    t = escapar(t);
    t = t.replace(/`([^`]+)`/g, function (_, c) { return "<code>" + c + "</code>"; });
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, texto, url) {
      var externo = /^https?:/.test(url);
      var alvo = externo ? ' target="_blank" rel="noopener"' : "";
      return '<a href="' + url + '"' + alvo + ">" + texto + "</a>";
    });
    return t;
  }

  function slug(t) {
    return t.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim().replace(/\s+/g, "-");
  }

  function paraHtml(md) {
    var linhas = md.replace(/\r\n/g, "\n").split("\n");
    var saida = [], titulos = [];
    var i = 0;

    while (i < linhas.length) {
      var l = linhas[i];

      /* bloco de código */
      if (/^```/.test(l)) {
        var codigo = [];
        i++;
        while (i < linhas.length && !/^```/.test(linhas[i])) { codigo.push(linhas[i]); i++; }
        i++;
        saida.push("<pre><code>" + escapar(codigo.join("\n")) + "</code></pre>");
        continue;
      }

      /* tabela */
      if (l.indexOf("|") !== -1 && i + 1 < linhas.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(linhas[i + 1])) {
        var cabecalho = celulas(l);
        i += 2;
        var corpo = [];
        while (i < linhas.length && linhas[i].indexOf("|") !== -1 && linhas[i].trim() !== "") {
          corpo.push(celulas(linhas[i])); i++;
        }
        var t = ["<div class=\"tabela\"><table><thead><tr>"];
        cabecalho.forEach(function (c) { t.push("<th>" + inline(c) + "</th>"); });
        t.push("</tr></thead><tbody>");
        corpo.forEach(function (linha) {
          t.push("<tr>");
          linha.forEach(function (c) { t.push("<td>" + inline(c) + "</td>"); });
          t.push("</tr>");
        });
        t.push("</tbody></table></div>");
        saida.push(t.join(""));
        continue;
      }

      /* título */
      var mt = l.match(/^(#{1,6})\s+(.*)$/);
      if (mt) {
        var nivel = mt[1].length, texto = mt[2].trim(), id = slug(texto);
        if (nivel <= 3) titulos.push({ nivel: nivel, texto: texto, id: id });
        saida.push("<h" + nivel + ' id="' + id + '">' + inline(texto) + "</h" + nivel + ">");
        i++;
        continue;
      }

      /* linha horizontal */
      if (/^\s*---+\s*$/.test(l)) { saida.push("<hr>"); i++; continue; }

      /* citação */
      if (/^>\s?/.test(l)) {
        var cit = [];
        while (i < linhas.length && /^>\s?/.test(linhas[i])) { cit.push(linhas[i].replace(/^>\s?/, "")); i++; }
        saida.push("<blockquote>" + inline(cit.join(" ")) + "</blockquote>");
        continue;
      }

      /* listas */
      if (/^\s*([-*]|\d+\.)\s+/.test(l)) {
        var ordenada = /^\s*\d+\.\s+/.test(l);
        var itens = [];
        while (i < linhas.length) {
          var atual = linhas[i];
          if (/^\s*([-*]|\d+\.)\s+/.test(atual)) {
            itens.push(atual.replace(/^\s*([-*]|\d+\.)\s+/, ""));
            i++;
          } else if (/^\s{2,}\S/.test(atual) && itens.length) {
            /* continuação recuada do item anterior */
            itens[itens.length - 1] += " " + atual.trim();
            i++;
          } else break;
        }
        var tag = ordenada ? "ol" : "ul";
        saida.push("<" + tag + ">" + itens.map(function (it) {
          return "<li>" + inline(it) + "</li>";
        }).join("") + "</" + tag + ">");
        continue;
      }

      /* linha em branco */
      if (l.trim() === "") { i++; continue; }

      /* parágrafo */
      var par = [];
      while (i < linhas.length && linhas[i].trim() !== "" &&
             !/^(#{1,6}\s|```|>\s?|\s*---+\s*$)/.test(linhas[i]) &&
             !/^\s*([-*]|\d+\.)\s+/.test(linhas[i]) &&
             !(linhas[i].indexOf("|") !== -1 && i + 1 < linhas.length &&
               /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(linhas[i + 1]))) {
        par.push(linhas[i]); i++;
      }
      if (par.length) saida.push("<p>" + inline(par.join(" ")) + "</p>");
    }

    B.markdown.titulos = titulos;
    return saida.join("\n");
  }

  function celulas(linha) {
    return linha.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(function (c) {
      return c.trim();
    });
  }

})(window.Boleador);
