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

  modalText.textContent = won
    ? `You win! It was ${answer.name}!`
    : `Better luck next time! The correct answer was ${answer.name}.`;

  modalInfo.innerHTML = `
    <p><strong>Genus:</strong> ${answer.genus}</p>
    <p><strong>Family:</strong> ${answer.family}</p>
    <p><strong>Diet:</strong> ${answer.diet}</p>
    <p><strong>Region:</strong> ${answer.region}</p>
    <p><strong>Location:</strong> ${Array.isArray(answer.location) ? answer.location.join(", ") : answer.location}</p>
    <p><strong>Behavior:</strong> ${answer.behavior?.join(", ")}</p>
    <p><strong>Tank Level:</strong> ${answer.tank_level}</p>
    <p><strong>Breeding Type:</strong> ${answer.breeding_type}</p>
    <p><strong>Max Size:</strong> ${answer.max_size_category}</p>
    <p><strong>Temperature Zones:</strong> ${answer.temperature_zones?.join(", ")}</p>
    <p><strong>pH Zones:</strong> ${answer.ph_zones?.join(", ")}</p>
    <p><strong>Hardness Zones:</strong> ${answer.hardness_zones?.join(", ")}</p>
    <p><strong>Guesses Taken:</strong> ${guessesTaken}</p>
  `;

  modalImage.src = answer.image || '';
  modalImage.style.display = answer.image ? 'block' : 'none';
  modalImage.style.margin = '0 auto';

  modal.classList.remove('hidden');
}
