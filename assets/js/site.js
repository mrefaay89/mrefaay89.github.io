// Mohamed Refaay — blog theme scripts: topic filter, table of contents,
// reading progress and copy buttons. Everything works without JavaScript too.
(function () {
  "use strict";

  // ---------- Topic filter on the home page ----------
  var filters = document.querySelectorAll(".filter");
  var rows = document.querySelectorAll(".post-row");
  var empty = document.querySelector(".empty-state");

  function applyFilter(topic) {
    var shown = 0;
    rows.forEach(function (row) {
      var match = topic === "all" || row.dataset.topic === topic;
      row.hidden = !match;
      if (match) shown++;
    });
    filters.forEach(function (btn) {
      var active = btn.dataset.filter === topic;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    if (empty) empty.hidden = shown !== 0;
  }

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () { applyFilter(btn.dataset.filter); });
  });

  // ---------- Wide tables scroll inside their own frame ----------
  document.querySelectorAll(".post-content > table").forEach(function (table) {
    var wrap = document.createElement("div");
    wrap.className = "table-wrap";
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  // ---------- Article pages ----------
  var article = document.querySelector(".post-content");
  if (!article || !document.body.classList.contains("is-post")) return;

  // Table of contents from the H1/H2 headings of the article
  var toc = document.querySelector(".toc");
  var headings = Array.prototype.slice.call(article.querySelectorAll("h1, h2"));
  if (toc && headings.length >= 3) {
    var list = toc.querySelector("ol");
    var links = [];
    headings.forEach(function (h, i) {
      if (!h.id) h.id = "section-" + (i + 1);
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      if (h.tagName === "H1") a.style.fontWeight = "600";
      li.appendChild(a);
      list.appendChild(li);
      links.push(a);
    });
    toc.hidden = false;

    var markCurrent = function () {
      var current = headings[0].id;
      headings.forEach(function (h) {
        if (h.getBoundingClientRect().top < 120) current = h.id;
      });
      links.forEach(function (a) {
        a.classList.toggle("is-current", a.getAttribute("href") === "#" + current);
      });
    };
    window.addEventListener("scroll", markCurrent, { passive: true });
    markCurrent();
  }

  // Reading progress line under the header
  var bar = document.querySelector(".progress span");
  if (bar) {
    var update = function () {
      var rect = article.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var done = Math.min(Math.max(-rect.top / (total > 0 ? total : 1), 0), 1);
      bar.style.width = (done * 100).toFixed(1) + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  // Copy buttons on code blocks
  article.querySelectorAll("pre").forEach(function (pre) {
    var holder = pre.closest(".highlighter-rouge");
    if (!holder) {
      holder = document.createElement("div");
      pre.parentNode.insertBefore(holder, pre);
      holder.appendChild(pre);
    }
    holder.classList.add("code-wrap");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", function () {
      var text = pre.innerText.replace(/\n$/, "");
      var done = function () {
        btn.textContent = "Copied";
        btn.classList.add("is-done");
        setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("is-done"); }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
    holder.appendChild(btn);
  });
})();
