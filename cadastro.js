/* =============================================
   ELO URBANO — SCRIPT CADASTROS
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── ANO NO FOOTER ─────────────────────────────
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── DATA ATUAL (data-cadastro readonly) ───────
  const dataCadastro = document.getElementById('data-cadastro');
  if (dataCadastro) {
    dataCadastro.value = new Date().toISOString().split('T')[0];
  }

  // ── MÁSCARA CPF ───────────────────────────────
  const cpfInput = document.getElementById('cpf');
  cpfInput?.addEventListener('input', () => {
    let v = cpfInput.value.replace(/\D/g, '').slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    cpfInput.value = v;
  });

  // ── MÁSCARA CNPJ ─────────────────────────────
  const cnpjInput = document.getElementById('cnpj');
  cnpjInput?.addEventListener('input', () => {
    let v = cnpjInput.value.replace(/\D/g, '').slice(0, 14);
    v = v.replace(/(\d{2})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d)/, '$1/$2')
         .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    cnpjInput.value = v;
  });

  // ── MÁSCARA CEP ──────────────────────────────
  const maskCep = (input) => {
    input?.addEventListener('input', () => {
      let v = input.value.replace(/\D/g, '').slice(0, 8);
      if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
      input.value = v;
    });
  };
  maskCep(document.getElementById('cep'));
  maskCep(document.getElementById('cep-cliente'));

  // ── MÁSCARA TELEFONE ─────────────────────────
  const maskTel = (input) => {
    input?.addEventListener('input', () => {
      let v = input.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 10) {
        v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (v.length > 6) {
        v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else if (v.length > 2) {
        v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
      } else {
        v = v.replace(/(\d{0,2})/, '($1');
      }
      input.value = v;
    });
  };
  maskTel(document.getElementById('telefone-cliente'));
  maskTel(document.getElementById('telefone'));
  maskTel(document.getElementById('whatsapp'));

  // ── BUSCA CEP (ViaCEP) FORNECEDOR ────────────
  const setupCepBusca = ({ btnId, cepId, ruaId, bairroId, cidadeId, estadoId, latId, lngId, mapaId }) => {
    const btn = document.getElementById(btnId);
    const cepInput = document.getElementById(cepId);

    btn?.addEventListener('click', async () => {
      const cep = cepInput?.value.replace(/\D/g, '');
      if (!cep || cep.length !== 8) {
        alert('Digite um CEP válido com 8 dígitos.');
        return;
      }
      btn.textContent = '...';
      btn.disabled = true;
      try {
        // TODO: backend pode proxy essa chamada — GET /api/cep/:cep
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (data.erro) throw new Error('CEP não encontrado');

        if (ruaId && document.getElementById(ruaId)) document.getElementById(ruaId).value = data.logradouro || '';
        if (bairroId && document.getElementById(bairroId)) document.getElementById(bairroId).value = data.bairro || '';
        if (cidadeId && document.getElementById(cidadeId)) document.getElementById(cidadeId).value = data.localidade || '';
        if (estadoId && document.getElementById(estadoId)) {
          const sel = document.getElementById(estadoId);
          for (let opt of sel.options) {
            if (opt.value === data.uf) { opt.selected = true; break; }
          }
        }

        // Geocodificar via Nominatim (OpenStreetMap — gratuito)
        // TODO: trocar por API do Google Maps ou backend próprio em produção
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${cep}&country=BR&format=json&limit=1`,
          { headers: { 'Accept-Language': 'pt-BR' } }
        );
        const geoData = await geoRes.json();
        if (geoData.length) {
          if (latId && document.getElementById(latId)) document.getElementById(latId).value = parseFloat(geoData[0].lat).toFixed(6);
          if (lngId && document.getElementById(lngId)) document.getElementById(lngId).value = parseFloat(geoData[0].lon).toFixed(6);
          atualizarMiniMapa(mapaId, geoData[0].lat, geoData[0].lon, data.localidade);
        }
      } catch (err) {
        alert('CEP não encontrado. Verifique e tente novamente.');
      } finally {
        btn.textContent = 'Buscar';
        btn.disabled = false;
      }
    });
  };

  // Fornecedor
  setupCepBusca({
    btnId: 'btn-cep', cepId: 'cep',
    ruaId: 'rua', bairroId: 'bairro',
    cidadeId: 'cidade', estadoId: 'estado',
    latId: 'latitude', lngId: 'longitude',
    mapaId: 'miniMapa'
  });

  // Consumidor
  setupCepBusca({
    btnId: 'btn-cep-cliente', cepId: 'cep-cliente',
    cidadeId: 'cidade-cliente', estadoId: 'estado-cliente',
    latId: 'lat-cliente', lngId: 'lng-cliente',
    mapaId: null
  });

  // ── MINI MAPA (iframe OSM) ────────────────────
  function atualizarMiniMapa(mapaId, lat, lon, label) {
    if (!mapaId) return;
    const container = document.getElementById(mapaId);
    if (!container) return;
    const zoom = 15;
    container.innerHTML = `
      <iframe
        width="100%" height="160"
        style="border:0; border-radius:12px; display:block;"
        loading="lazy"
        src="https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lon)-0.01}%2C${parseFloat(lat)-0.01}%2C${parseFloat(lon)+0.01}%2C${parseFloat(lat)+0.01}&layer=mapnik&marker=${lat}%2C${lon}"
        title="Localização no mapa">
      </iframe>`;
  }

  // ── GPS CONSUMIDOR ────────────────────────────
  const btnGps = document.getElementById('btn-gps');
  const avisoGps = document.getElementById('aviso-gps');

  btnGps?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      if (avisoGps) { avisoGps.textContent = 'Geolocalização não suportada pelo navegador.'; avisoGps.className = 'campo-aviso erro'; }
      return;
    }
        btnGps.innerHTML = '<span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></span> Obtendo localização...';
    btnGps.disabled = true;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        const latInp = document.getElementById('lat-cliente');
        const lngInp = document.getElementById('lng-cliente');
        if (latInp) latInp.value = lat;
        if (lngInp) lngInp.value = lon;
        // Reverso geocoding
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=pt-BR`);
          const d = await r.json();
          const cidadeInp = document.getElementById('cidade-cliente');
          const estadoSel = document.getElementById('estado-cliente');
          const cepInp = document.getElementById('cep-cliente');
          if (cidadeInp && d.address) cidadeInp.value = d.address.city || d.address.town || d.address.village || '';
          if (estadoSel && d.address?.state_code) {
            for (let opt of estadoSel.options) {
              if (opt.value === d.address.state_code.replace('BR-','')) { opt.selected = true; break; }
            }
          }
          if (cepInp && d.address?.postcode) cepInp.value = d.address.postcode.replace('-','').slice(0,5)+'-'+d.address.postcode.replace('-','').slice(5,8);
        } catch (_) {}
        if (avisoGps) { avisoGps.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#16a34a" style="vertical-align:middle;margin-right:4px"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> Localização obtida com sucesso!'; avisoGps.className = 'campo-aviso ok'; }
        btnGps.innerHTML = '<span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></span> Localização obtida';
        setTimeout(() => { btnGps.innerHTML = '<span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></span> Usar minha localização atual'; btnGps.disabled = false; }, 3000);
      },
      (err) => {
        let msg = 'Não foi possível obter a localização.';
        if (err.code === 1) msg = 'Permissão de localização negada.';
        if (avisoGps) { avisoGps.textContent = msg; avisoGps.className = 'campo-aviso erro'; }
        btnGps.innerHTML = '<span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></span> Usar minha localização atual';
        btnGps.disabled = false;
      }
    );
  });

  // ── VER SENHA ─────────────────────────────────
  const btnVerSenha = document.getElementById('btn-ver-senha');
  const senhaInput = document.getElementById('senha');
  btnVerSenha?.addEventListener('click', () => {
    const show = senhaInput.type === 'password';
    senhaInput.type = show ? 'text' : 'password';
    btnVerSenha.innerHTML = show
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
  });

  // ── VALIDAÇÃO CONFIRMAR SENHA ─────────────────
  const confirmSenha = document.getElementById('confirmar-senha');
  const avisoSenha = document.getElementById('aviso-senha');

  const validarSenha = () => {
    if (!confirmSenha || !senhaInput) return;
    if (!confirmSenha.value) { avisoSenha.textContent = ''; return; }
    if (confirmSenha.value !== senhaInput.value) {
      avisoSenha.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="#dc2626" style="vertical-align:middle;margin-right:3px"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg> As senhas não coincidem.';
      avisoSenha.className = 'campo-aviso erro';
    } else {
      avisoSenha.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="#16a34a" style="vertical-align:middle;margin-right:3px"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> Senhas coincidem.';
      avisoSenha.className = 'campo-aviso ok';
    }
  };
  senhaInput?.addEventListener('input', validarSenha);
  confirmSenha?.addEventListener('input', validarSenha);

  // ── SUBMIT FORMS ──────────────────────────────
  const handleFormSubmit = (formId, successId) => {
    const formEl = document.getElementById(formId);
    const successEl = document.getElementById(successId);

    formEl?.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validação básica
      const requiredFields = formEl.querySelectorAll('[required]');
      let valid = true;
      requiredFields.forEach(f => {
        if (!f.value.trim()) { f.classList.add('erro'); valid = false; }
        else f.classList.remove('erro');
      });

      if (!valid) {
        alert('Preencha todos os campos obrigatórios.');
        return;
      }

      const btnSubmit = formEl.querySelector('.btn-enviar');
      if (btnSubmit) { btnSubmit.textContent = 'Enviando...'; btnSubmit.disabled = true; }

      // TODO: POST /api/cadastro/consumidor ou /api/cadastro/fornecedor
      await new Promise(r => setTimeout(r, 1200)); // simula latência

      if (successEl) {
        formEl.reset();
        successEl.style.display = 'block';
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => { successEl.style.display = 'none'; }, 6000);
      }

      if (btnSubmit) { btnSubmit.textContent = formId === 'formCliente' ? 'Criar Minha Conta' : 'Cadastrar Fornecedor'; btnSubmit.disabled = false; }
    });
  };

  handleFormSubmit('formCliente', 'sucessoCliente');
  handleFormSubmit('formFornecedor', 'sucessoFornecedor');

});
