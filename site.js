/* ═══════════════════════════════════════════════════════════════════
   site.js — Gamma Omicron Alumni Association  |  Shared Utilities
   ═══════════════════════════════════════════════════════════════════ */

// ── DATA FETCH ────────────────────────────────────────────────────
async function fetchJSON(path) {
  try {
    const r = await fetch(path);
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

// ── SCROLL REVEAL ─────────────────────────────────────────────────
function attachReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── ACTIVE NAV ────────────────────────────────────────────────────
function markActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    // Home: only exact match on /
    if (href === '/' && (path === '/' || path === '/index.html')) {
      a.classList.add('active');
    } else if (href !== '/' && href.startsWith('/') && path.endsWith(href)) {
      a.classList.add('active');
    }
  });
}

// ── ADMIN LOGIN ───────────────────────────────────────────────────
function handleAdminLogin() {
  if (!window.netlifyIdentity) return;
  const user = window.netlifyIdentity.currentUser();
  if (user) {
    document.location.href = '/admin/';
  } else {
    window.netlifyIdentity.open('login');
    window.netlifyIdentity.once('login', () => { document.location.href = '/admin/'; });
  }
}

// ── INIT ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
  attachReveal();
});
