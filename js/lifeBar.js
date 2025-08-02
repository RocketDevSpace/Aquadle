export function initializeLifeBar(maxGuesses) {
  const lifeBar = document.getElementById('life-container');
  lifeBar.innerHTML = '';
  for (let i = 0; i < maxGuesses; i++) {
    const icon = document.createElement('span');
    icon.classList.add('life-icon', 'life-remaining');
    lifeBar.appendChild(icon);
  }
}

export function updateLifeBar(correct, index) {
  const icons = document.querySelectorAll('.life-icon');
  if (index >= icons.length) return;

  if (correct) {
    icons[index].classList.remove('life-remaining');
    icons[index].classList.add('life-correct');
  } else {
    icons[index].classList.remove('life-remaining');
    icons[index].classList.add('life-wrong');
  }
}
