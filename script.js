let currentStep = 1;

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
  
  const progress = (step / 4) * 100;
  document.getElementById('progressFill').style.width = progress + '%';
  
  if (step === 4) {
    const tipo = document.querySelector('input[name="tipo"]:checked')?.value || '';
    const dimensione = document.querySelector('input[name="dimensione"]:checked')?.value || '';
    const features = Array.from(document.querySelectorAll('input[name="feature"]:checked')).map(i => i.value).join(', ');
    const saving = document.getElementById('savingAmount').textContent;
    
    document.getElementById('hiddenTipo').value = tipo;
    document.getElementById('hiddenDimensione').value = dimensione;
    document.getElementById('hiddenFeatures').value = features || 'nessuna';
    document.getElementById('hiddenSaving').value = saving;
  }
  
  window.scrollTo({ top: document.getElementById('configuratore').offsetTop - 20, behavior: 'smooth' });
}

document.getElementById('leadForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      goToStep(5);
    } else {
      alert('Si è verificato un errore. Riprova o scrivi direttamente a info@ebuing.it');
    }
  } catch (error) {
    alert('Si è verificato un errore di connessione. Riprova o scrivi direttamente a info@ebuing.it');
  }
});