// sPare · shared behaviour for every page
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---------- page transitions: a paper sheet with the destination's name and a red line ----------
{ const pt = document.createElement("div"); pt.id = "pt"; pt.setAttribute("aria-hidden", "true");
  pt.innerHTML = '<div class="pt-pat"><img src="img/pat/hlines.svg" alt=""></div><span class="pt-k mono">sPare /</span><div class="pt-h"><span></span></div><i class="pt-bar"></i>';
  document.body.appendChild(pt); const h = pt.querySelector(".pt-h span");
  const nameFor = a => a.dataset.title || (a.querySelector("h3,b") || a).textContent.replace(/[→↗]/g, "").trim().slice(0, 40) || "sPare";
  const prev = sessionStorage.getItem("pt"); sessionStorage.removeItem("pt");
  if (prev && !RM) { h.textContent = prev; pt.classList.add("hold"); requestAnimationFrame(() => requestAnimationFrame(() => { pt.classList.remove("hold"); pt.classList.add("lift"); setTimeout(() => pt.className = "", 1100); })); }
  document.addEventListener("click", e => { const a = e.target.closest("a[href]"); if (!a || RM || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const u = new URL(a.href, location.href); if (u.origin !== location.origin || u.pathname === location.pathname || /^mailto:/.test(a.href)) return;
    e.preventDefault(); const name = nameFor(a); h.textContent = name; sessionStorage.setItem("pt", name);
    pt.className = ""; requestAnimationFrame(() => pt.classList.add("in")); setTimeout(() => location.href = a.href, 900); });
  addEventListener("pageshow", e => { if (e.persisted) pt.className = ""; }); }

// ---------- stroke-field texture (stand-in until the new texture image arrives) ----------
function strokes(cv, pal, seed0) { const dpr = Math.min(devicePixelRatio || 1, 2), W = cv.clientWidth, H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr;
  const c = cv.getContext("2d"); c.scale(dpr, dpr); c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, H);
  let s = seed0; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; let y = -20;
  while (y < H + 30) { const bh = 12 + r() * 20, col = pal[Math.floor(r() * pal.length)], ph = r() * 6.28, amp = 4 + r() * 12, fq = .004 + r() * .006;
    c.strokeStyle = col; c.globalAlpha = .65 + r() * .35; c.lineWidth = 1.2; c.beginPath();
    for (let x = -10; x < W + 10; x += 2.4 + r() * 1.6) { const yy = y + Math.sin(x * fq + ph) * amp; c.moveTo(x, yy); c.lineTo(x + (r() - .5) * 1.2, yy + bh * (.55 + r() * .5)); } c.stroke();
    c.globalAlpha = .9; c.strokeStyle = "#ffffff"; c.lineWidth = 1.6; c.beginPath(); for (let x = -10; x < W + 10; x += 6) { const yy = y + bh + Math.sin(x * fq + ph) * amp; x < -5 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke();
    y += bh * (.75 + r() * .3); } c.globalAlpha = 1; }
const GREEN = ["#8ea677", "#a9bb88", "#c4c890", "#7aa89f", "#96bdb4", "#b7c085", "#6b8a4c", "#d3cfa6"];
$$("canvas.band").forEach((cv, i) => strokes(cv, GREEN, 321 + i * 97));

// ---------- haze image for the AQI series ----------
function haze(cv) { const dpr = Math.min(devicePixelRatio || 1, 2), W = cv.clientWidth, H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; const c = cv.getContext("2d"); c.scale(dpr, dpr);
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#d9d3c3"); g.addColorStop(.6, "#c9bfa8"); g.addColorStop(1, "#a9a28f"); c.fillStyle = g; c.fillRect(0, 0, W, H);
  let s = 11; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 14; i++) { const x = r() * W, y = r() * H, rad = 80 + r() * 260, gg = c.createRadialGradient(x, y, 0, x, y, rad); gg.addColorStop(0, "rgba(245,244,240,.38)"); gg.addColorStop(1, "rgba(245,244,240,0)"); c.fillStyle = gg; c.fillRect(0, 0, W, H); }
  for (let i = 0; i < W * H / 60; i++) { const x = r() * W, y = Math.pow(r(), .7) * H, a = .15 + r() * .5, sz = r() < .92 ? .8 : 1.8; c.fillStyle = `rgba(60,56,46,${a})`; c.fillRect(x, y, sz, sz); }
  const n = Math.round(W / 30); c.fillStyle = "rgba(42,40,34,.85)"; for (let i = 0; i < n; i++) { const x = i * (W / n), h = H * (.06 + r() * .22); c.fillRect(x, H - h, W / n - 2, h); } }
$$("canvas.haze").forEach(haze);

// ---------- staggered reveals ----------
$$(".work,.pubs,.people,.steps,.wards,.facts,.chapters").forEach(g => [...g.children].forEach((el, i) => el.style.setProperty("--d", (i * 0.1) + "s")));
{ const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -4% 0px" });
  $$(".rv,.big,.bw").forEach(el => io.observe(el)); }
addEventListener("scroll", () => { if (innerHeight + scrollY >= document.documentElement.scrollHeight - 40) $$(".rv:not(.in),.big:not(.in),.bw:not(.in)").forEach(e => e.classList.add("in")); }, { passive: true });

// ---------- typing headline ([data-type]) ----------
$$("[data-type]").forEach(h => { const h1 = $("h1", h) || h, cur = document.createElement("span"); cur.className = "cur"; const chs = [];
  const walk = n => [...n.childNodes].forEach(c => { if (c.nodeType === 3) { const f = document.createDocumentFragment(); [...c.textContent].forEach(ch => { const x = document.createElement("span"); x.className = "tw"; x.textContent = ch; f.appendChild(x); chs.push(x); }); c.replaceWith(f); } else walk(c); });
  walk(h1);
  if (RM) { chs.forEach(c => c.classList.add("v")); h.classList.add("done"); return; }
  let k = 0; const go = () => { if (k < chs.length) { const c = chs[k++]; c.classList.add("v"); c.after(cur); const ch = c.textContent; setTimeout(go, ch === " " ? 55 : ch === "." || ch === "," ? 260 : 26 + Math.random() * 40); } else h.classList.add("done"); };
  const waitI = document.getElementById("intro") && !document.documentElement.classList.contains("seen") && !RM;
  if (waitI) { const st = () => setTimeout(go, 700); addEventListener("intro:done", st, { once: true }); } else setTimeout(go, sessionStorage.getItem("pt") ? 900 : 500); });

// ---------- count-up numbers ([data-count]) ----------
{ const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; io.unobserve(e.target); const el = e.target, to = +el.dataset.count, dec = (el.dataset.count.split(".")[1] || "").length, t0 = performance.now(), D = 1600;
    const f = t => { const p = Math.min(1, (t - t0) / D), v = to * (1 - Math.pow(1 - p, 3)); el.textContent = v.toFixed(dec); if (p < 1) requestAnimationFrame(f); }; RM ? el.textContent = to.toFixed(dec) : requestAnimationFrame(f); }), { threshold: .5 });
  $$("[data-count]").forEach(el => { el.textContent = (0).toFixed((el.dataset.count.split(".")[1] || "").length); io.observe(el); }); }

// ---------- scroll: header, progress, parallax, word scrub ----------
{ const hdr = $("#hdr"), prog = $("#prog"); let ly = scrollY;
  const st = $("#st"); let W = []; if (st) { st.innerHTML = st.textContent.split(" ").map(w => `<span class="w">${w}</span>`).join(" "); W = $$(".w", st); }
  const imgs = $$(".card .im img,.card .im canvas,.full img,.full canvas");
  const tick = () => { const y = scrollY, H = innerHeight;
    hdr && hdr.classList.toggle("hide", y > ly && y > 160); ly = y;
    prog && (prog.style.transform = `scaleX(${y / Math.max(1, document.documentElement.scrollHeight - H)})`);
    if (!RM) imgs.forEach(im => { const r = im.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > H) return; const p = (r.top + r.height / 2 - H / 2) / H; im.style.transform = `translateY(${p * -6}%)`; });
    if (st) { const r = st.getBoundingClientRect(), p = Math.min(1, Math.max(0, (H * .85 - r.top) / (r.height + H * .35))), n = Math.round(p * W.length); W.forEach((w, i) => w.classList.toggle("on", i < n || RM)); } };
  addEventListener("scroll", () => requestAnimationFrame(tick), { passive: true }); tick(); }

// ---------- big sign-off letters ----------
$$(".big").forEach(b => b.innerHTML = [...b.textContent].map((c, i) => `<span class="ch" style="--i:${i}">${c === " " ? "&nbsp;" : c}</span>`).join(""));

// ---------- book tilt ----------
$$(".book .cv:not(.img)").forEach(cv => { cv.addEventListener("mousemove", e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; cv.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg) translateZ(10px)`; }); cv.addEventListener("mouseleave", () => cv.style.transform = ""); });

// ---------- hover preview that follows the cursor (people, wards) ----------
{ const ph = $("#ph"); if (ph) $$("[data-hover]").forEach(p => {
    p.addEventListener("mouseenter", () => { const src = p.dataset.img; ph.innerHTML = src ? `<img src="${src}" alt="">` : "Photo"; ph.classList.add("on"); });
    p.addEventListener("mouseleave", () => ph.classList.remove("on"));
    p.addEventListener("mousemove", e => { ph.style.left = e.clientX + "px"; ph.style.top = e.clientY + "px"; }); }); }

// ---------- red cursor ----------
{ const c = document.createElement("div"); c.id = "cur"; c.innerHTML = "<span>View</span>"; document.body.appendChild(c); const lab = $("span", c);
  let x = -100, y = -100, cx = x, cy = y; addEventListener("mousemove", e => { x = e.clientX; y = e.clientY; });
  const loop = () => { cx += (x - cx) * .2; cy += (y - cy) * .2; c.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); }; loop();
  document.addEventListener("mouseover", e => { const card = e.target.closest("[data-cursor]"), a = e.target.closest("a,button");
    c.classList.toggle("big", !!card); if (card) c.dataset.l = card.dataset.cursor; c.classList.toggle("link", !card && !!a); });
  document.addEventListener("mouseleave", () => c.style.opacity = 0); document.addEventListener("mouseenter", () => c.style.opacity = 1); }

// ---------- Mumbai clock ----------
{ const el = $("#clock"); if (el) { const f = () => { const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })); let h = d.getHours(), m = d.getMinutes(), ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12;
  el.innerHTML = `${String(h).padStart(2, "0")}<span class="c">:</span>${String(m).padStart(2, "0")} ${ap} · Mumbai`; }; f(); setInterval(f, 20000); } }

// ---------- landing: logo centre-stage, then it flies into the header ----------
{ const I = document.getElementById("intro"); if (I && !document.documentElement.classList.contains("seen") && !RM) {
    document.body.style.overflow = "hidden";
    let done = false;
    const go = () => { if (done) return; done = true; try { sessionStorage.setItem("seen", "1"); } catch (e) {}
      const L = I.querySelector(".in-logo"), T = document.querySelector("header .logo").getBoundingClientRect(), r = L.getBoundingClientRect();
      const s = T.width / r.width, dx = T.left + T.width / 2 - (r.left + r.width / 2), dy = T.top + T.height / 2 - (r.top + r.height / 2);
      I.classList.add("out"); L.style.transform = `translate(${dx}px,${dy}px) scale(${s})`;
      setTimeout(() => { I.remove(); document.body.style.overflow = ""; dispatchEvent(new Event("intro:done")); }, 1100); };
    I.addEventListener("click", go); addEventListener("wheel", go, { once: true, passive: true }); addEventListener("keydown", go, { once: true }); addEventListener("touchmove", go, { once: true, passive: true });
    setTimeout(go, 3600);
  } else if (I) I.remove(); }

// ---------- book viewer: click a cover to read inside ----------
{ const looks = $$("button.look"); if (looks.length) {
  const V = document.createElement("div"); V.id = "bv"; V.setAttribute("role", "dialog"); V.setAttribute("aria-modal", "true");
  V.innerHTML = '<div class="bh"><b></b><span><span class="mono">Inside the book</span><button class="x" aria-label="Close">×</button></span></div><div class="tr"></div><div class="bf"><span class="cap"></span><span class="nav"><button class="pv" aria-label="Previous">←</button><span class="ct mono"></span><button class="nx" aria-label="Next">→</button></span></div><div class="bar"><i></i></div>';
  document.body.appendChild(V); const tr = $(".tr", V), cap = $(".cap", V), ct = $(".ct", V), bar = $(".bar i", V); let caps = [], n = 0, last = null;
  const at = () => Math.round(tr.scrollLeft / tr.clientWidth);
  const upd = () => { const i = Math.min(n - 1, at()); cap.textContent = caps[i] || ""; ct.textContent = `${i + 1} / ${n}`; bar.style.width = ((i + 1) / n * 100) + "%"; $$(".sl", tr).forEach((s, k) => { if (Math.abs(k - i) <= 1) { const im = $("img", s); if (!im.src) im.src = im.dataset.src; } if (k === i) s.classList.add("seen"); }); };
  const go = d => tr.scrollTo({ left: (at() + d) * tr.clientWidth, behavior: RM ? "auto" : "smooth" });
  const open = b => { last = b; const pages = JSON.parse(b.dataset.pages); caps = JSON.parse(b.dataset.caps || "[]"); n = pages.length; $("b", V).textContent = b.dataset.title;
    tr.innerHTML = pages.map(u => `<div class="sl"><img data-src="${u}" alt=""></div>`).join(""); $$("img", tr).forEach(im => im.onload = () => im.closest(".sl").classList.toggle("ld", true));
    tr.scrollLeft = 0; V.classList.add("on"); document.documentElement.classList.add("bv-open"); upd(); setTimeout(() => $(".nx", V).focus(), 50); };
  const close = () => { V.classList.remove("on"); document.documentElement.classList.remove("bv-open"); last && last.focus(); };
  looks.forEach(b => b.addEventListener("click", () => open(b)));
  $(".x", V).onclick = close; $(".pv", V).onclick = () => go(-1); $(".nx", V).onclick = () => go(1);
  tr.addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true });
  tr.addEventListener("wheel", e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); if (!tr._lock) { tr._lock = 1; go(e.deltaY > 0 ? 1 : -1); setTimeout(() => tr._lock = 0, 650); } } }, { passive: false });
  addEventListener("keydown", e => { if (!V.classList.contains("on")) return; if (e.key === "Escape") close(); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); });
} }
