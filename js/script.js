/* =============================================
   ELO URBANO — SCRIPT PRINCIPAL
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── NAV SCROLL EFFECT ──────────────────────────
  const nav = document.getElementById('nav');
  const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── HAMBURGER MENU ─────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  document.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });

  // Fechar menu ao clicar fora
  document.addEventListener('click', (e) => {
    if (mobileMenu?.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    }
  });

  // ── CARROSSEL SOBRE ────────────────────────────
  const track = document.querySelector('.carrossel-track');
  const slides = document.querySelectorAll('.carrossel-slide');
  const dots = document.querySelectorAll('.dot');
  const btnPrev = document.querySelector('.btn-prev');
  const btnNext = document.querySelector('.btn-next');

  if (track && slides.length) {
    let current = 0;
    let autoTimer = null;

    const goTo = (idx) => {
      current = (idx + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('ativo', i === current));
    };

    const startAuto = () => {
      stopAuto();
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    };
    const stopAuto = () => { clearInterval(autoTimer); autoTimer = null; };

    btnPrev?.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    btnNext?.addEventListener('click', () => { goTo(current + 1); startAuto(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startAuto(); }));

    // Swipe / toque
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
    });

    goTo(0);
    startAuto();
  }

  // ── FORMULÁRIO DE INSCRIÇÃO ────────────────────
  const form = document.getElementById('contatoForm');
  const formSuccess = document.getElementById('formSuccess');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    // TODO: integrar com backend POST /api/inscricao
    if (formSuccess) {
      formSuccess.style.display = 'block';
      form.reset();
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => { formSuccess.style.display = 'none'; }, 5000);
    }
  });

  // ── SCROLL REVEAL ──────────────────────────────
  const revealEls = document.querySelectorAll(
    'section, .bloco, .persona, .passos li, .carrossel-wrapper'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ── SMOOTH SCROLL PARA ÂNCORAS ─────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── ANO NO FOOTER ─────────────────────────────
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
