/* ===========================
   LOCALHUB — SCRIPT.JS
=========================== */

// ====== NAV SCROLL ======
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// ====== HAMBURGER MENU ======
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});

// ====== SMOOTH SCROLL ======
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ====== COUNTER ANIMATION ======
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const duration = 1800;
  const step = (target / duration) * 16;
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current);
  }, 16);
}

// ====== INTERSECTION OBSERVER ======
const observerOptions = { threshold: 0.15 };

// Fade-in elements
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = entry.target.getAttribute('data-delay') || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay * 120);
      fadeObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// Counter elements
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

// Apply fade-in to sections
document.querySelectorAll(
  '.sobre-card, .func-card, .persona-card, .ods-card, .restricao-item, .flow-step, .sobre .section-title, .sobre .section-desc, .sobre .section-tag'
).forEach(el => {
  el.classList.add('fade-in');
  fadeObserver.observe(el);
});

// Apply counter to stats
document.querySelectorAll('.stat-num').forEach(el => {
  counterObserver.observe(el);
});

// ====== FORM SUBMIT ======
const form = document.getElementById('contatoForm');
const formSuccess = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    setTimeout(() => {
      formSuccess.style.display = 'block';
      form.reset();
      btn.textContent = 'Enviar Mensagem';
      btn.disabled = false;

      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      setTimeout(() => {
        formSuccess.style.display = 'none';
      }, 5000);
    }, 1200);
  });
}

// ====== FOOTER YEAR ======
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ====== NAV ACTIVE HIGHLIGHT ======
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function highlightNav() {
  let scrollY = window.scrollY;
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    const bottom = top + section.offsetHeight;
    if (scrollY >= top && scrollY < bottom) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${section.id}`) {
          link.style.color = 'var(--green-deep)';
          link.style.fontWeight = '500';
        } else {
          link.style.fontWeight = '';
        }
      });
    }
  });
}

window.addEventListener('scroll', highlightNav, { passive: true });

// ====== MOCKUP CARD PARALLAX (subtle) ======
const mockupCard = document.querySelector('.mockup-card');
if (mockupCard) {
  window.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 8;
    const y = (e.clientY / innerHeight - 0.5) * 4;
    mockupCard.style.transform = `perspective(1000px) rotateY(${-6 + x}deg) rotateX(${2 + y}deg)`;
  });
}

// ====== STAGGERED SECTION CARDS ======
const staggerGroups = [
  '.sobre-cards .sobre-card',
  '.func-grid .func-card',
  '.personas-grid .persona-card',
  '.ods-cards .ods-card',
  '.restricoes-grid .restricao-item',
];

staggerGroups.forEach(selector => {
  const items = document.querySelectorAll(selector);
  items.forEach((item, i) => {
    item.setAttribute('data-delay', i);
  });
});

// ====== INIT ======
console.log('%cLocalHub 🌱', 'color: #2d6a4f; font-size: 1.5rem; font-weight: bold;');
console.log('%cConectando comunidades, fortalecendo o local.', 'color: #52b788; font-size: 0.9rem;');
