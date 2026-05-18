/* ===========================
   ELO URBANO — SCRIPT.JS
=========================== */

// ====== NAV: sombra ao rolar ======
const nav = document.getElementById('nav');

window.addEventListener('scroll', function () {
  if (window.scrollY > 20) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// ====== MENU HAMBURGUER ======
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', function () {
  hamburger.classList.toggle('ativo');
  mobileMenu.classList.toggle('aberto');
});

// Fecha o menu ao clicar em um link
document.querySelectorAll('.mob-link').forEach(function (link) {
  link.addEventListener('click', function () {
    hamburger.classList.remove('ativo');
    mobileMenu.classList.remove('aberto');
  });
});

// ====== SCROLL SUAVE ======
document.querySelectorAll('a[href^="#"]').forEach(function (ancora) {
  ancora.addEventListener('click', function (e) {
    e.preventDefault();
    var alvo = document.querySelector(this.getAttribute('href'));
    if (alvo) {
      var topo = alvo.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: topo, behavior: 'smooth' });
    }
  });
});

// ====== ANIMAÇÃO DE ENTRADA (fade-in) ======
var elementosFade = document.querySelectorAll('.card-sobre, .persona, .passos li');

elementosFade.forEach(function (el) {
  el.classList.add('fade-in');
});

var observer = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('visivel');
      observer.unobserve(entrada.target);
    }
  });
}, { threshold: 0.15 });

elementosFade.forEach(function (el) {
  observer.observe(el);
});

// ====== FORMULÁRIO ======
var form = document.getElementById('contatoForm');
var mensagemSucesso = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var botao = form.querySelector('button[type="submit"]');
    botao.textContent = 'Enviando...';
    botao.disabled = true;

    setTimeout(function () {
      mensagemSucesso.style.display = 'block';
      form.reset();
      botao.textContent = 'Enviar Inscrição';
      botao.disabled = false;

      setTimeout(function () {
        mensagemSucesso.style.display = 'none';
      }, 5000);
    }, 1200);
  });
}

// ====== ANO NO FOOTER ======
var anoEl = document.getElementById('year');
if (anoEl) {
  anoEl.textContent = new Date().getFullYear();
}
