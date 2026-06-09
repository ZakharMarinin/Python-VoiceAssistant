const PAGES = [
  { slug: 'index',              file: 'content/index.md',                   title: 'Документация',        icon: 'home',  category: 'home', home: true },
  
  { slug: 'ctypes',             file: 'content/libs/ctypes.md',             title: 'ctypes',              icon: 'lib',   category: 'libs' },
  { slug: 'datetime',           file: 'content/libs/datetime.md',           title: 'datetime',            icon: 'lib',   category: 'libs' },
  { slug: 'fuzzywuzzy',         file: 'content/libs/fuzzywuzzy.md',         title: 'fuzzywuzzy',          icon: 'lib',   category: 'libs' },
  { slug: 'num2words',          file: 'content/libs/num2words.md',          title: 'num2words',           icon: 'lib',   category: 'libs' },
  { slug: 'platform',           file: 'content/libs/platform.md',           title: 'platform',            icon: 'lib',   category: 'libs' },
  { slug: 'pyaudio',            file: 'content/libs/pyaudio.md',            title: 'pyaudio',             icon: 'lib',   category: 'libs' },
  { slug: 'python-Levenshtein', file: 'content/libs/python-Levenshtein.md', title: 'python-Levenshtein',  icon: 'lib',   category: 'libs' },
  { slug: 'pyttsx3',            file: 'content/libs/pyttsx3.md',            title: 'pyttsx3',             icon: 'lib',   category: 'libs' },
  { slug: 'speech_recognition', file: 'content/libs/speech_recognition.md', title: 'speech_recognition',  icon: 'lib',   category: 'libs' },
  { slug: 'subprocess',         file: 'content/libs/subprocess.md',         title: 'subprocess',          icon: 'lib',   category: 'libs' },
  { slug: 'urllib.parse',       file: 'content/libs/urllib.parse.md',       title: 'urllib.parse',        icon: 'lib',   category: 'libs' },
  { slug: 'webbrowser',         file: 'content/libs/webbrowser.md',         title: 'webbrowser',          icon: 'lib',   category: 'libs' },
  
  { slug: '09.06.2026',         file: 'content/dz/09_06_2026.md',           title: 'ДЗ 09.06.2026',       icon: 'hw',    category: 'homework' },
 // { slug: '11.06.2026',         file: 'content/dz/11_06_2026.md',           title: 'ДЗ 11.06.2026',       icon: 'hw',   category: 'homework' },

  { slug: 'git_guide',          file: 'content/github/note.md',             title: 'Справка GitHub',      icon: 'guide', category:  "guide" },
];

const bySlug = Object.fromEntries(PAGES.map(p => [p.slug, p]));
const cache = {};

const ICONS = {
  home:  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  lib:   '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  hw:    '<svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
  guide: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
};

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const PY_KW = new Set(['import','from','as','def','return','if','elif','else','for','while','try','except','finally','with','in','is','not','and','or','True','False','None','class','pass','break','continue','lambda','global','raise']);
const PY_BI = new Set(['print','range','len','open','str','int','float','list','dict','set','tuple','input','type','super']);

function highlightPython(code) {
  const lines = code.split('\n');
  return lines.map(line => {
    let out = '';
    let i = 0;
    while (i < line.length) {
      const ch = line[i];
      if (ch === '#') {
        out += `<span class="tok-com">${escapeHtml(line.slice(i))}</span>`;
        break;
      }

      if (ch === '"' || ch === "'") {
        let j = i + 1;
        while (j < line.length && line[j] !== ch) { if (line[j] === '\\') j++; j++; }
        out += `<span class="tok-str">${escapeHtml(line.slice(i, j + 1))}</span>`;
        i = j + 1;
        continue;
      }

      if (/[0-9]/.test(ch) && !/[A-Za-z_]/.test(line[i-1] || '')) {
        let j = i;
        while (j < line.length && /[0-9.]/.test(line[j])) j++;
        out += `<span class="tok-num">${escapeHtml(line.slice(i, j))}</span>`;
        i = j;
        continue;
      }

      if (/[A-Za-z_]/.test(ch)) {
        let j = i;
        while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
        const word = line.slice(i, j);
        const after = line[j];
        if (PY_KW.has(word)) out += `<span class="tok-kw">${word}</span>`;
        else if (PY_BI.has(word)) out += `<span class="tok-bi">${word}</span>`;
        else if (after === '(') out += `<span class="tok-fn">${word}</span>`;
        else out += escapeHtml(word);
        i = j;
        continue;
      }
      out += escapeHtml(ch);
      i++;
    }
    return out;
  }).join('\n');
}

function renderInline(text) {
  let t = escapeHtml(text);

  const codeStore = [];
  t = t.replace(/`([^`]+)`/g, (_, c) => {
    codeStore.push(c);
    return `\u0000CODE${codeStore.length - 1}\u0000`;
  });

  t = t.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
    const slug = target.trim();
    const text = (label || target).trim();
    return `<span class="wikilink" data-link="${slug}">${text}</span>`;
  });

  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  t = t.replace(/(^|[^\w])_([^_]+)_(?=[^\w]|$)/g, '$1<em>$2</em>');
  t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  t = t.replace(/\u0000CODE(\d+)\u0000/g, (_, n) => `<code>${escapeHtml(codeStore[+n])}</code>`);
  return t;
}

function renderMarkdown(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let html = '';
  let i = 0;
  let listType = null;

  function closeList() {
    if (listType) { html += `</${listType}>`; listType = null; }
  }

  while (i < lines.length) {
    let line = lines[i];

    if (/^```/.test(line.trim())) {
      closeList();
      const lang = line.trim().replace(/^```/, '').trim() || 'text';
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) { buf.push(lines[i]); i++; }
      i++; 
      const raw = buf.join('\n');
      const looksPython = /\b(import|def |print\(|self|elif|webbrowser|subprocess|pyttsx3)\b/.test(raw) || lang.toLowerCase() === 'python';
      const body = looksPython ? highlightPython(raw) : escapeHtml(raw);
      const label = looksPython ? 'python' : lang;
      html += `<pre><div class="code-head"><span>${label}</span><button class="copy-btn" type="button">copy</button></div><code>${body}</code></pre>`;
      continue;
    }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeList();
      const level = h[1].length;
      html += `<h${level}>${renderInline(h[2])}</h${level}>`;
      i++; continue;
    }

    if (/^---+\s*$/.test(line)) {
      closeList();
      html += '<hr/>';
      i++; continue;
    }

    if (/^>\s?/.test(line)) {
      closeList();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      html += `<blockquote>${renderInline(buf.join(' '))}</blockquote>`;
      continue;
    }

    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    if (ul) {
      if (listType !== 'ul') { closeList(); html += '<ul>'; listType = 'ul'; }
      html += `<li>${renderInline(ul[1])}</li>`;
      i++; continue;
    }

    const ol = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (ol) {
      if (listType !== 'ol') { closeList(); html += `<ol start="${ol[1]}">`; listType = 'ol'; }
      html += `<li>${renderInline(ol[2])}</li>`;
      i++; continue;
    }

    if (line.trim() === '') {
      if (listType) {
        let k = i + 1;
        while (k < lines.length && lines[k].trim() === '') k++;
        const nxt = lines[k] || '';
        const sameUl = listType === 'ul' && /^\s*[-*]\s+/.test(nxt);
        const sameOl = listType === 'ol' && /^\s*\d+\.\s+/.test(nxt);
        if (!sameUl && !sameOl) closeList();
      }
      i++; continue;
    }

    closeList();
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '' &&
           !/^(#{1,4}\s|```|>|\s*[-*]\s|\s*\d+\.\s|---+\s*$)/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    html += `<p>${renderInline(buf.join(' '))}</p>`;
  }
  closeList();
  return html;
}

function buildNav() {
  const nav = document.getElementById('nav');
  let html = '';

  html += `<div class="nav-section">Главная</div>`;
  const home = PAGES.find(p => p.home);
  html += navLink(home);

  html += `<div class="nav-section">Библиотеки</div>`;
  PAGES.filter(p => p.category === 'libs').forEach(p => { html += navLink(p); });

  html += `<div class="nav-section">Домашние задания</div>`;
  PAGES.filter(p => p.category === 'homework').forEach(p => { html += navLink(p); });

  html += `<div class="nav-section">Справочная информация</div>`;
  PAGES.filter(p => p.category === 'guide').forEach(p => { html += navLink(p); });

  nav.innerHTML = html;

  nav.querySelectorAll('.nav-link').forEach(el => {
    el.addEventListener('click', () => {
      location.hash = '#' + el.dataset.slug;
      closeMobileNav();
    });
  });
}

function navLink(p) {
  return `<button class="nav-link" data-slug="${p.slug}">${ICONS[p.icon]}<span>${p.title}</span></button>`;
}

function setActiveNav(slug) {
  document.querySelectorAll('.nav-link').forEach(el => {
    el.classList.toggle('active', el.dataset.slug === slug);
  });
}

function pageFooter(slug) {
  const currentPage = bySlug[slug];
  if (!currentPage || currentPage.home) return ''; // Для главной страницы скрываем футер навигации

  const currentCategoryPages = PAGES.filter(p => p.category === currentPage.category);

  const idx = PAGES.findIndex(p => p.slug === slug);
  const prev = PAGES[idx - 1];
  const next = PAGES[idx + 1];
  let html = '<div class="page-end">';
  html += prev
    ? `<a data-link="${prev.slug}">← ${prev.title}</a>`
    : '<span></span>';
  html += next
    ? `<a data-link="${next.slug}">${next.title} →</a>`
    : '<span></span>';
  html += '</div>';
  return html;
}

async function loadPage(slug) {
  const page = bySlug[slug] || bySlug['index'];
  const content = document.getElementById('content');
  setActiveNav(page.slug);
  document.title = page.home ? 'Документация проекта' : page.title + '';

  try {
    let md = cache[page.slug];
    if (md === undefined) {
      const res = await fetch(page.file);
      if (!res.ok) throw new Error('not found');
      md = await res.text();
      cache[page.slug] = md;
    }

    const includeRegex = /\[INCLUDE:([^\]]+)\]/g;
    let match;
    
    while ((match = includeRegex.exec(md)) !== null) {
      const tag = match[0];
      const fileName = match[1];
      
      try {
        const fileRes = await fetch(fileName);
        if (fileRes.ok) {
          const rawCode = await fileRes.text();
          
          const mdCodeBlock = `\`\`\`python\n${rawCode}\n\`\`\``;
          
          md = md.replace(tag, mdCodeBlock);
        } else {
          md = md.replace(tag, `*Ошибка: Не удалось загрузить код из файла ${fileName}*`);
        }
      } catch (fileError) {
        md = md.replace(tag, `*Ошибка доступа к файлу ${fileName}*`);
      }
    }

    content.innerHTML = renderMarkdown(md) + pageFooter(page.slug);
  } catch (e) {
    content.innerHTML = `<h1>Не удалось загрузить страницу</h1><p>Файл <code>${page.file}</code> недоступен. Если открываете локально — запустите через локальный сервер.</p>`;
  }



  content.classList.remove('fade-in');
  void content.offsetWidth;
  content.classList.add('fade-in');

  content.querySelectorAll('[data-link]').forEach(el => {
    el.addEventListener('click', () => { location.hash = '#' + el.dataset.link; });
  });

  content.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.closest('pre').querySelector('code').innerText;
      navigator.clipboard.writeText(code).then(() => {
        const old = btn.textContent;
        btn.textContent = 'скопировано ✓';
        setTimeout(() => { btn.textContent = old; }, 1400);
      });
    });
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function route() {
  const slug = decodeURIComponent(location.hash.replace(/^#/, '')) || 'index';
  loadPage(bySlug[slug] ? slug : 'index');
}

function closeMobileNav() { document.body.classList.remove('nav-open'); }
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.body.classList.toggle('nav-open');
});
document.getElementById('overlay').addEventListener('click', closeMobileNav);

buildNav();
window.addEventListener('hashchange', route);
route();
