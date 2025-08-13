// uiHandlers.js
import { checkGuess } from './guessLogic.js';
import { renderFeedback } from './renderFeedback.js';
import { updateLifeBar } from './lifeBar.js';
import { showResults } from './modal.js';
import { gameState } from './gameState.js';

export function setupGuessHandler(fishData) {
  const input = document.getElementById("guess-input");
  const button = document.getElementById("submit-btn");
  

  button.addEventListener("click", () => {
    const guessText = input.value.trim();
    if (!guessText) return;

    const guessedFish = fishData.find(f => f.commonName.toLowerCase() === guessText.toLowerCase());
    
    if (!guessedFish) return;

    const optionToRemove = document.querySelector(`#fish-list option[value="${guessedFish.commonName}"]`);
    if (optionToRemove) {
      optionToRemove.remove();
    }
    

    const result = checkGuess(guessedFish, gameState.correctAnswer);

    renderFeedback(guessedFish, result);
    updateLifeBar(result['name'] === "green", gameState.maxGuesses - gameState.remainingGuesses);

    gameState.remainingGuesses--;

    console.log(`Remaining guesses: ${gameState.remainingGuesses}`);
    
    if (guessedFish.commonName.toLowerCase() === gameState.correctAnswer.commonName.toLowerCase()) {
  
      showResults(gameState.correctAnswer, gameState.maxGuesses - gameState.remainingGuesses, true);
    } else if (gameState.remainingGuesses <= 0) {


      showResults(gameState.correctAnswer, gameState.maxGuesses, false);
    }
    input.value = '';

  });
}
