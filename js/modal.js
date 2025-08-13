export function setupModals() {
  
  const closeResultsModalBtn = document.getElementById('close-results-modal');
  const resultsModal = document.getElementById('results-modal');
  const viewResultsBtn = document.getElementById('show-results-modal');

  closeResultsModalBtn.addEventListener('click', () => {
    resultsModal.classList.add('hidden');
    viewResultsBtn.style.display = 'block';
  });

  viewResultsBtn.addEventListener('click', () => {
    resultsModal.classList.remove('hidden');
  });
}

export function showResults(answer, guessesTaken, won = true) {
  const modal = document.getElementById('results-modal');
  const modalText = document.getElementById('fish-text');
  const modalInfo = document.getElementById('fish-info');
  const modalImage = document.getElementById('fish-image');

  modalText.innerHTML = `
    <h2 class="result-title ${won ? 'result-win' : 'result-loss'}">
      ${won ? 'You Win!' : 'Better Luck Next Time!'}
    </h2>
    <p class="common-name">${answer.commonName}</p>
    <p class="scientific-name">${answer.scientificName}</p>
  `;

  modalInfo.innerHTML = `
    <div class="info-section">
      <h3 class="section-header">General Information</h3>
      <div class="taxonomy-grid">
        <div class="card genus-family">
          <h4>Genus / Family</h4>
          <p>${answer.genus} (${answer.family})</p>
        </div>
        <div class="card region-location">
          <h4>Region / Location</h4>
          <p>${Array.isArray(answer.regions) ? answer.regions.join(", ") : answer.regions} (${Array.isArray(answer.locations) ? answer.locations.join(", ") : answer.locations})</p>
        </div>
        <div class="card size">
          <h4>Size</h4>
          <p>${answer.max_size_category}</p>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3 class="section-header">Ecology</h3>
      <div class="ecology-grid">
        <div class="card diet">
          <h4>Diet</h4>
          <p>${answer.diet}</p>
        </div>
        <div class="card behavior">
          <h4>Behavior</h4>
          <p>${answer.behavior?.join(", ")}</p>
        </div>
        <div class="card breeding-type">
          <h4>Breeding Type</h4>
          <p>${answer.breeding_type}</p>
        </div>
        <div class="card tank-level">
          <h4>Tank Level</h4>
          <p>${answer.tank_level}</p>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3 class="section-header">Environmental Parameters</h3>
      <div class="environment-grid">
        <div class="card temperature-zones">
          <h4>Temperature Zones</h4>
          <p>${answer.temperature_zones?.join(", ")}</p>
        </div>
        <div class="card ph-zones">
          <h4>pH Zones</h4>
          <p>${answer.ph_zones?.join(", ")}</p>
        </div>
        <div class="card hardness-zones full-width">
          <h4>Hardness Zones</h4>
          <p>${answer.hardness_zones?.join(", ")}</p>
        </div>
      </div>
    </div>

    <div class="guesses-taken">
      Guesses Taken: ${guessesTaken}
    </div>
  `;

  modalImage.src = answer.image?.url || '';
  modalImage.style.display = answer.image ? 'block' : 'none';
  modalImage.style.margin = '0 auto';

  // Add license info text below image, if available
  const imageAttribution = document.getElementById('image-attribution');
  const modalLicense = document.getElementById('image-license');
  const modalCredit = document.getElementById('image-credit');

  if (answer.image?.license || answer.image?.credit) {
    modalLicense.textContent = answer.image?.license ? `Image license: ${answer.image.license}` : '';
    modalCredit.textContent = answer.image?.artist ? `Credit: ${answer.image.artist}` : '';
    imageAttribution.style.display = 'block';
  } else {
    modalLicense.textContent = '';
    modalCredit.textContent = '';
    imageAttribution.style.display = 'none';
  }


  modal.classList.remove('hidden');
}
