let currentStep = 1;
let kitConsigliato = null;
let kitScelto = null;

// Definizione dei 3 kit
const KITS = {
  start: {
    nome: "Kit Host Start",
    prezzo: 139.90,
    tagline: "Automazione essenziale per 1 appartamento",
    composizione: [
      "1× Aqara Hub M2 (cervello del sistema)",
      "1× Sensore movimento Aqara P1",
      "1× Presa smart Aqara con misuratore consumi"
    ],
    funzioni: [
      "Spegne AC dopo check-out",
      "Monitora consumi della presa",
      "Controllo remoto da app",
      "Comando vocale Alexa/Google"
    ]
  },
  plus: {
    nome: "Kit Host Plus",
    prezzo: 259.90,
    tagline: "Controllo completo: AC, luci, ingresso e standby",
    composizione: [
      "1× Aqara Hub M2 (cervello del sistema)",
      "2× Sensori movimento Aqara P1",
      "2× Prese smart Aqara con misuratore",
      "2× Lampadine smart Aqara LED T2 E27",
      "1× Sensore porte/finestre Aqara T1"
    ],
    funzioni: [
      "Controlla 2 stanze (zona giorno + camera)",
      "Spegne TV/decoder in standby",
      "Lampadine smart con spegnimento automatico",
      "Notifica apertura porta (check-in/out tracking)",
      "Tutto del Kit Start incluso"
    ]
  },
  pro: {
    nome: "Kit Host Pro",
    prezzo: 389.90,
    tagline: "Esperienza host premium con sicurezza e comfort completi",
    composizione: [
      "1× Aqara Hub M2 (cervello del sistema)",
      "2× Sensori movimento Aqara P1",
      "3× Prese smart Aqara con misuratore",
      "3× Lampadine smart Aqara LED T2 E27",
      "2× Sensori porte/finestre Aqara T1",
      "2× Sensori temperatura/umidità Aqara T1",
      "2× Sensori antiallagamento Aqara"
    ],
    funzioni: [
      "3 zone monitorate (giorno + camera + bagno)",
      "Sensori temperatura/umidità (comfort + alert muffa)",
      "Antiallagamento bagno + cucina (previene danni)",
      "Doppia porta monitorata (ingresso + finestra)",
      "Tutto del Kit Plus incluso"
    ]
  }
};

// Logica raccomandazione kit basata su funzioni selezionate + dimensione
function calcolaKitRaccomandato() {
  const dimensione = document.querySelector('input[name="dimensione"]:checked')?.value || '';
  const features = document.querySelectorAll('input[name="feature"]:checked');
  const numFunzioni = features.length;

  // KIT PRO se 5+ funzioni o appartamento grande
  if (numFunzioni >= 5 || dimensione === 'oltre-120') {
    return 'pro';
  }
  // KIT PLUS se 3-4 funzioni o appartamento medio-grande
  if (numFunzioni >= 3 || dimensione === '80-120') {
    return 'plus';
  }
  // KIT START in tutti gli altri casi
  return 'start';
}

document.querySelectorAll('input[name="tipo"]').forEach(input => {
  input.addEventListener('change', () => {
    document.getElementById('btnNext1').disabled = false;
  });
});

document.querySelectorAll('input[name="dimensione"]').forEach(input => {
  input.addEventListener('change', () => {
    document.getElementById('btnNext2').disabled = false;
  });
});

function updateSaving() {
  let total = 0;
  document.querySelectorAll('input[name="feature"]:checked').forEach(input => {
    total += parseInt(input.dataset.saving);
  });
  document.getElementById('savingAmount').textContent = '€' + total;
}

document.querySelectorAll('input[name="feature"]').forEach(input => {
  input.addEventListener('change', updateSaving);
});

function goToStep(step) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.querySelector(`[data-step="${step}"]`).classList.add('active');
  currentStep = step;
  
  const progress = (step / 5) * 100;
  document.getElementById('progressFill').style.width = progress + '%';
  
  // Quando arrivi allo Step 4 (selezione kit), calcola il kit raccomandato
  if (step === 4) {
    kitConsigliato = calcolaKitRaccomandato();
    kitScelto = kitConsigliato;
    renderKitCards();
    calcolaROI();
  }
  
  // Quando arrivi allo Step 5 (form contatti), prepara i campi nascosti
  if (step === 5) {
    const tipo = document.querySelector('input[name="tipo"]:checked')?.value || '';
    const dimensione = document.querySelector('input[name="dimensione"]:checked')?.value || '';
    const features = Array.from(document.querySelectorAll('input[name="feature"]:checked')).map(i => i.value).join(', ');
    const saving = document.getElementById('savingAmount').textContent;
    
    document.getElementById('hiddenTipo').value = tipo;
    document.getElementById('hiddenDimensione').value = dimensione;
    document.getElementById('hiddenFeatures').value = features || 'nessuna';
    document.getElementById('hiddenSaving').value = saving;
    document.getElementById('hiddenKit').value = KITS[kitScelto].nome;
    document.getElementById('hiddenKitPrezzo').value = '€' + KITS[kitScelto].prezzo.toFixed(2);
    
    // Aggiorna il riepilogo nel form
    document.getElementById('riepilogoKit').textContent = KITS[kitScelto].nome + ' — €' + KITS[kitScelto].prezzo.toFixed(2);
  }
  
  window.scrollTo({ top: document.getElementById('configuratore').offsetTop - 20, behavior: 'smooth' });
}

function renderKitCards() {
  const container = document.getElementById('kitCards');
  container.innerHTML = '';
  
  // Ordine: kit raccomandato in mezzo (in evidenza), altri due ai lati
  const ordine = ordineKits(kitConsigliato);
  
  ordine.forEach(kitKey => {
    const kit = KITS[kitKey];
    const isRaccomandato = kitKey === kitConsigliato;
    const isScelto = kitKey === kitScelto;
    
    const card = document.createElement('div');
    card.className = 'kit-card' + (isRaccomandato ? ' kit-raccomandato' : '') + (isScelto ? ' kit-selezionato' : '');
    card.dataset.kit = kitKey;
    
    let html = '';
    if (isRaccomandato) {
      html += '<div class="kit-badge">⭐ Consigliato per te</div>';
    }
    
    html += '<h3 class="kit-nome">' + kit.nome + '</h3>';
    html += '<p class="kit-tagline">' + kit.tagline + '</p>';
    html += '<div class="kit-prezzo">€' + kit.prezzo.toFixed(2) + '</div>';
    html += '<p class="kit-spedizione">Spedizione gratuita</p>';
    
    html += '<div class="kit-sezione"><strong>Composizione:</strong><ul>';
    kit.composizione.forEach(c => {
      html += '<li>' + c + '</li>';
    });
    html += '</ul></div>';
    
    html += '<div class="kit-sezione"><strong>Cosa fa:</strong><ul>';
    kit.funzioni.forEach(f => {
      html += '<li>✓ ' + f + '</li>';
    });
    html += '</ul></div>';
    
    html += '<button type="button" class="btn-kit-select" onclick="selezionaKit(\'' + kitKey + '\')">';
    html += isScelto ? '✓ Selezionato' : 'Scegli questo kit';
    html += '</button>';
    
    card.innerHTML = html;
    container.appendChild(card);
  });
}

function ordineKits(raccomandato) {
  // Mette il kit raccomandato per primo, poi gli altri due in ordine logico
  if (raccomandato === 'start') return ['start', 'plus', 'pro'];
  if (raccomandato === 'plus') return ['plus', 'start', 'pro'];
  return ['pro', 'plus', 'start'];
}

function selezionaKit(kitKey) {
  kitScelto = kitKey;
  renderKitCards();
  calcolaROI();
}

function calcolaROI() {
  const saving = parseInt(document.getElementById('savingAmount').textContent.replace('€', '')) || 0;
  const prezzo = KITS[kitScelto].prezzo;
  
  document.getElementById('roiKitNome').textContent = KITS[kitScelto].nome;
  document.getElementById('roiPrezzo').textContent = '€' + prezzo.toFixed(2);
  document.getElementById('roiRisparmio').textContent = '€' + saving + '/anno';
  
  if (saving > 0) {
    const mesiROI = Math.ceil((prezzo / saving) * 12);
    document.getElementById('roiMesi').textContent = mesiROI + ' mesi';
  } else {
    document.getElementById('roiMesi').textContent = 'da calcolare';
  }
}

function resetConfigurator() {
  document.querySelectorAll('input[name="tipo"]').forEach(i => i.checked = false);
  document.querySelectorAll('input[name="dimensione"]').forEach(i => i.checked = false);
  document.querySelectorAll('input[name="feature"]').forEach(i => i.checked = false);
  document.getElementById('leadForm').reset();
  document.getElementById('savingAmount').textContent = '€0';
  document.getElementById('btnNext1').disabled = true;
  document.getElementById('btnNext2').disabled = true;
  kitConsigliato = null;
  kitScelto = null;
  const newRequestBtn = document.getElementById('newRequestBtn');
  if (newRequestBtn) newRequestBtn.style.display = 'none';
  const countdownEl = document.getElementById('countdownMsg');
  if (countdownEl) countdownEl.style.display = 'block';
  goToStep(1);
}

document.getElementById('leadForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Invio in corso...';
  
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      goToStep(6);
      startCountdown();
    } else {
      alert('Si è verificato un errore. Riprova o scrivi direttamente a info@ebuing.it');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Invia richiesta';
    }
  } catch (error) {
    alert('Si è verificato un errore di connessione. Riprova o scrivi direttamente a info@ebuing.it');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Invia richiesta';
  }
});

function startCountdown() {
  let seconds = 10;
  const countdownEl = document.getElementById('countdownNumber');
  const newRequestBtn = document.getElementById('newRequestBtn');
  const countdownMsg = document.getElementById('countdownMsg');
  
  if (countdownEl) countdownEl.textContent = seconds;
  
  const interval = setInterval(() => {
    seconds--;
    if (countdownEl) countdownEl.textContent = seconds;
    
    if (seconds <= 0) {
      clearInterval(interval);
      if (countdownMsg) countdownMsg.style.display = 'none';
      if (newRequestBtn) newRequestBtn.style.display = 'inline-block';
    }
  }, 1000);
}
