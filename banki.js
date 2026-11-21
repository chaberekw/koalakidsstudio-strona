// Bańki w nagłówku (jak na banerze kanału): płyną w górę, pękają po kliknięciu. Przy „ogranicz ruch” stoją w miejscu.
(() => {
  const c = document.getElementById("banki");
  if (!c) return;
  const g = c.getContext("2d");
  const kolory = ["255,217,61", "255,255,255", "255,154,162", "167,233,175", "126,200,240"];
  const cisza = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, banki = [], pekniecia = [];

  const nowa = (dol) => {
    const r = 12 + Math.random() * 46;
    return { x: Math.random() * W, y: dol ? H + r + Math.random() * 80 : Math.random() * H, r,
             k: kolory[(Math.random() * kolory.length) | 0], v: 0.15 + Math.random() * 0.35,
             f: Math.random() * 6.28, a: 0.22 + Math.random() * 0.2 };
  };
  const rozmiar = () => {
    const d = Math.min(devicePixelRatio || 1, 2), b = c.getBoundingClientRect();
    W = b.width; H = b.height; c.width = W * d; c.height = H * d; g.setTransform(d, 0, 0, d, 0, 0);
    const ile = Math.round(Math.min(34, W * H / 26000));
    while (banki.length < ile) banki.push(nowa(false));
    banki.length = ile;
  };
  const rysuj = () => {
    g.clearRect(0, 0, W, H);
    for (const b of banki) {
      g.beginPath(); g.arc(b.x, b.y, b.r, 0, 6.283);
      g.fillStyle = `rgba(${b.k},${b.a})`; g.fill();
      g.lineWidth = 1.5; g.strokeStyle = "rgba(27,42,74,.12)"; g.stroke();
      g.beginPath(); g.arc(b.x - b.r * .35, b.y - b.r * .35, b.r * .18, 0, 6.283);
      g.fillStyle = "rgba(255,255,255,.55)"; g.fill();
    }
    for (const p of pekniecia) {
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283);
      g.lineWidth = 3; g.strokeStyle = `rgba(27,42,74,${p.a})`; g.stroke();
    }
  };
  const krok = (t) => {
    for (const b of banki) {
      b.y -= b.v; b.x += Math.sin(t / 1400 + b.f) * 0.25;
      if (b.y < -b.r - 10) Object.assign(b, nowa(true));
    }
    pekniecia = pekniecia.filter((p) => (p.r += 2.2, p.a -= 0.05) > 0);
    rysuj(); requestAnimationFrame(krok);
  };
  addEventListener("resize", () => { rozmiar(); rysuj(); });
  // klik w nagłówek: pęka trafiona bańka (canvas leży pod treścią, więc słuchamy na całym nagłówku)
  c.parentElement.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button")) return;
    const b0 = c.getBoundingClientRect(), x = e.clientX - b0.left, y = e.clientY - b0.top;
    const i = banki.findIndex((b) => (b.x - x) ** 2 + (b.y - y) ** 2 < b.r ** 2);
    if (i < 0) return;
    pekniecia.push({ x: banki[i].x, y: banki[i].y, r: banki[i].r, a: 0.6 });
    banki[i] = nowa(true);
    if (cisza) rysuj();
  });
  rozmiar(); rysuj();
  if (!cisza) requestAnimationFrame(krok);
})();

// Premiery: po dacie premiery karta sama zmienia się na „Już na YouTube” z linkiem do teledysku.
for (const k of document.querySelectorAll(".piosenka[data-premiera]")) {
  if (!k.dataset.yt || new Date() < new Date(k.dataset.premiera)) continue;
  const z = k.querySelector(".znaczek"), a = k.querySelector(".akcja");
  z.textContent = "Już na YouTube"; z.classList.add("juz");
  a.textContent = "Oglądaj teledysk →"; a.href = `https://youtu.be/${k.dataset.yt}`;
}
