/**
 * Kleines, abhängigkeitsfreies Skript für alle interaktiven Teile der Seite.
 * (Bewusst ohne React/Framer Motion: hält die Seite auf dem Handy schnell.)
 */

type Slot = { day: string; open: string; close: string };
interface SiteConfig {
  whatsapp: string;
  restaurant: string;
  template: string;
  locale: string;
  timezone: string;
  hours: Slot[];
  noteLabel: string;
  closedText: string;
  openText: string;
  untilText: string;
}

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
const cfg: SiteConfig = JSON.parse($('#site-config')?.textContent || '{}');
const DAYS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------ Hell/Dunkel */
function syncThemeIcons() {
  const dark = document.documentElement.dataset.theme === 'dark';
  $$('.theme-icon-dark').forEach((el) => el.classList.toggle('hidden', dark));
  $$('.theme-icon-light').forEach((el) => el.classList.toggle('hidden', !dark));
}
syncThemeIcons();
$$('[data-theme-toggle]').forEach((btn) =>
  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
    syncThemeIcons();
  })
);

/* ------------------------------------------------- Zeit in Restaurant-Zeitzone */
function nowInRestaurant() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: cfg.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short',
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return {
    day: DAYS[wd],
    minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')),
    iso: `${get('year')}-${get('month')}-${get('day')}`,
  };
}
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
const fmt = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
/** Schließzeit nach Mitternacht (z. B. 01:00) korrekt behandeln */
const slotRange = (s: Slot) => {
  const o = toMin(s.open);
  let c = toMin(s.close);
  if (c <= o) c += 24 * 60;
  return [o, c] as const;
};

/* --------------------------------------------------------- Geöffnet-Status */
(function openStatus() {
  const pill = $('[data-open-status]');
  const now = nowInRestaurant();
  $$(`tr[data-day="${now.day}"]`).forEach((tr) => tr.classList.add('is-today'));
  if (!pill || !cfg.hours) return;
  const prevDay = DAYS[(DAYS.indexOf(now.day) + 6) % 7];
  let openUntil: string | null = null;
  for (const s of cfg.hours) {
    const [o, c] = slotRange(s);
    if (s.day === now.day && now.minutes >= o && now.minutes < c) openUntil = s.close;
    if (s.day === prevDay && c > 1440 && now.minutes < c - 1440) openUntil = s.close;
  }
  pill.dataset.open = String(!!openUntil);
  $('[data-open-text]', pill)!.textContent = openUntil ? `${cfg.openText} · ${cfg.untilText} ${openUntil}` : cfg.closedText;
  pill.style.visibility = 'visible';
})();

/* ------------------------------------------------- Reservierung per WhatsApp */
(function reservation() {
  const dialog = $<HTMLDialogElement>('#reserve-dialog');
  const form = $<HTMLFormElement>('[data-res-form]');
  if (!dialog || !form || typeof dialog.showModal !== 'function') return; // Fallback: Links öffnen WhatsApp direkt
  const date = form.elements.namedItem('date') as HTMLInputElement;
  const time = form.elements.namedItem('time') as HTMLSelectElement;
  const warn = $('[data-closed-warn]', form)!;
  const submit = $<HTMLButtonElement>('button[type="submit"]', form)!;
  const today = nowInRestaurant();
  date.min = today.iso;
  date.value = today.iso;

  function fillTimes() {
    const prev = time.value;
    time.innerHTML = '';
    const d = new Date(`${date.value}T12:00:00`);
    const day = DAYS[d.getDay()];
    const slots = cfg.hours.filter((s) => s.day === day);
    const isToday = date.value === today.iso;
    const options: string[] = [];
    for (const s of slots) {
      const [o, c] = slotRange(s);
      // Reservierungen im 30-Minuten-Takt bis 1 Stunde vor Schließung
      for (let m = Math.ceil(o / 30) * 30; m <= c - 60; m += 30) {
        if (isToday && m < today.minutes + 30) continue;
        options.push(fmt(m));
      }
    }
    for (const v of options) time.add(new Option(v, v, false, v === prev));
    if (!time.value && options.length) time.value = options.find((v) => v >= '18:30') ?? options[0];
    const closed = !date.value || options.length === 0;
    warn.hidden = !closed;
    time.disabled = closed;
    submit.disabled = closed;
  }
  date.addEventListener('change', fillTimes);

  $$('[data-reserve]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      fillTimes();
      dialog.showModal();
      setTimeout(() => (form.elements.namedItem('name') as HTMLInputElement).focus(), 50);
    })
  );
  // Klick auf den abgedunkelten Hintergrund schließt den Dialog
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    if (!name) {
      (form.elements.namedItem('name') as HTMLInputElement).focus();
      (form.elements.namedItem('name') as HTMLInputElement).reportValidity();
      return;
    }
    const dateText = new Intl.DateTimeFormat(cfg.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      .format(new Date(`${data.get('date')}T12:00:00`));
    const note = String(data.get('note') || '').trim();
    const text = cfg.template
      .replaceAll('{restaurant}', cfg.restaurant)
      .replaceAll('{name}', name)
      .replaceAll('{persons}', String(data.get('persons')))
      .replaceAll('{date}', dateText)
      .replaceAll('{time}', String(data.get('time')))
      .replaceAll('{note}', note ? `📝 ${cfg.noteLabel}: ${note}\n` : '');
    const url = `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(text)}`;
    const win = window.open(url, '_blank', 'noopener');
    if (!win) location.href = url;
    dialog.close();
  });
})();

/* ------------------------------------------------------- Suche & Filter */
(function menuFilter() {
  const input = $<HTMLInputElement>('#menu-search');
  if (!input) return;
  const dishes = $$('[data-dish]');
  const cats = $$('[data-cat]');
  const chips = $$<HTMLButtonElement>('[data-filter]');
  const excludes = $$<HTMLInputElement>('[data-allergen-exclude]');
  const reset = $<HTMLButtonElement>('[data-filter-reset]')!;
  const info = $('[data-results]')!;
  const noResults = $('[data-no-results]')!;
  const alCount = $('[data-allergen-count]')!;
  const alSummary = $('[data-allergen-summary]')!;
  const norm = (s: string) =>
    s.toLowerCase().replace(/ß/g, 'ss').normalize('NFKD').replace(/[̀-ͯ]/g, '');
  const index = dishes.map((el) => ({
    el,
    text: norm(el.dataset.search || ''),
    allergens: (el.dataset.allergens || '').split(' ').filter(Boolean),
    tags: (el.dataset.tags || '').split(' ').filter(Boolean),
    rec: el.dataset.rec === '1',
  }));

  function apply() {
    const terms = norm(input!.value).split(/\s+/).filter(Boolean);
    const active = chips.filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.dataset.filter!);
    const ex = excludes.filter((c) => c.checked).map((c) => c.value);
    const filtering = terms.length > 0 || active.length > 0 || ex.length > 0;
    let total = 0;

    for (const d of index) {
      const ok =
        terms.every((t) => d.text.includes(t)) &&
        active.every((f) =>
          f === 'recommended' ? d.rec : f === 'vegetarian' ? d.tags.includes('vegetarian') || d.tags.includes('vegan') : d.tags.includes(f)
        ) &&
        !d.allergens.some((a) => ex.includes(a));
      d.el.hidden = !ok;
      if (ok) total++;
    }
    for (const cat of cats) {
      const visible = $$('[data-dish]', cat).filter((d) => !d.hidden).length;
      cat.hidden = visible === 0;
      // Zwischenüberschriften ohne sichtbare Einträge ausblenden
      $$('[data-group-title]', cat).forEach((h) => {
        const list = h.nextElementSibling as HTMLElement | null;
        h.hidden = !!list && !$$('[data-dish]', list).some((d) => !d.hidden);
      });
      const link = $(`[data-cat-link="${cat.dataset.cat}"]`);
      if (link) {
        link.classList.toggle('is-empty', visible === 0);
        $('[data-cat-count]', link)!.textContent = String(visible);
      }
    }
    noResults.hidden = total > 0;
    info.textContent = filtering ? info.dataset.template!.replace('{n}', String(total)) : '';
    reset.hidden = !filtering;
    alCount.textContent = ex.length ? `(${ex.length})` : '';
    alSummary.setAttribute('aria-pressed', String(ex.length > 0));
    requestAnimationFrame(() => updateSpy());
  }

  let timer: number | undefined;
  input.addEventListener('input', () => { clearTimeout(timer); timer = window.setTimeout(apply, 120); });
  chips.forEach((c) =>
    c.addEventListener('click', () => {
      c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'));
      apply();
    })
  );
  excludes.forEach((c) => c.addEventListener('change', apply));
  reset.addEventListener('click', () => {
    input.value = '';
    chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
    excludes.forEach((c) => (c.checked = false));
    apply();
  });
})();

/* --------------------------- Aktive Kategorie in der Navigation hervorheben */
const nav = $('[data-cat-nav]');
const links = $$<HTMLAnchorElement>('[data-cat-link]');
let currentCat = '';
function updateSpy(initial = false) {
  if (!nav) return;
  const navBottom = (nav.closest('.cat-nav') as HTMLElement).getBoundingClientRect().bottom + 24;
  let active = '';
  for (const cat of $$('[data-cat]')) {
    if (cat.hidden) continue;
    if (cat.getBoundingClientRect().top <= navBottom) active = cat.dataset.cat!;
    else break;
  }
  if (!active) active = $$('[data-cat]').find((c) => !c.hidden)?.dataset.cat ?? '';
  if (active === currentCat) return;
  currentCat = active;
  links.forEach((l) => l.setAttribute('aria-current', String(l.dataset.catLink === active)));
  const link = links.find((l) => l.dataset.catLink === active);
  // Beim Laden nicht horizontal scrollen (stört u. a. die LCP-Messung auf RTL-Seiten)
  if (link && !initial) {
    // Über Bildschirm-Koordinaten zentrieren – funktioniert für LTR und RTL gleichermaßen
    const l = link.getBoundingClientRect();
    const n = nav.getBoundingClientRect();
    const delta = l.left + l.width / 2 - (n.left + n.width / 2);
    nav.scrollBy({ left: delta, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
}
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { updateSpy(); ticking = false; });
}, { passive: true });
updateSpy(true);

/* ---------------------------------------------------- Allergene aufklappen */
document.addEventListener('click', (e) => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('.al-btn');
  if (!btn) return;
  const panel = document.getElementById(btn.getAttribute('aria-controls')!);
  const open = btn.getAttribute('aria-expanded') !== 'true';
  btn.setAttribute('aria-expanded', String(open));
  if (panel) panel.hidden = !open;
});

/* ---------------------------------------- Feste Reservieren-Leiste (Handy) */
(function bottomBar() {
  const bar = $('[data-bottom-bar]');
  const heroActions = $('.hero-actions');
  if (!bar) return;
  if (!heroActions || !('IntersectionObserver' in window)) return bar.classList.add('is-visible');
  new IntersectionObserver(([e]) => bar.classList.toggle('is-visible', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(heroActions);
})();

/* ------------------------------------------ Karte erst nach Einwilligung laden */
$$('[data-map-load]').forEach((btn) =>
  btn.addEventListener('click', () => {
    const box = btn.closest<HTMLElement>('[data-map]')!;
    const iframe = document.createElement('iframe');
    iframe.src = box.dataset.src!;
    iframe.title = 'Google Maps';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    box.replaceChildren(iframe);
  })
);

/* -------------------------------------------------------------- Galerie */
(function lightbox() {
  const dlg = $<HTMLDialogElement>('[data-lightbox-dialog]');
  const img = $<HTMLImageElement>('[data-lightbox-img]');
  if (!dlg || !img || typeof dlg.showModal !== 'function') return;
  $$('[data-lightbox]').forEach((b) =>
    b.addEventListener('click', () => {
      img.src = b.dataset.full!;
      img.alt = b.dataset.alt || '';
      dlg.showModal();
    })
  );
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target === img) dlg.close(); });
})();

/* ---------------------------------------------------- Sanfte Einblendungen */
(function reveal() {
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) return els.forEach((el) => el.classList.add('in'));
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
    { rootMargin: '0px 0px -8% 0px' }
  );
  els.forEach((el) => io.observe(el));
})();
