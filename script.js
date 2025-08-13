// script.js (entry point, renamed from main.js optional)
import { loadFishData } from './js/fishData.js';
import { populateFishList } from './js/fishData.js';
import { setupGuessHandler } from './js/uiHandlers.js';
import { initializeLifeBar } from './js/lifeBar.js';
import { setupBackHandler, setupModals } from './js/modal.js';
import { generateCategoryHeader } from './js/renderFeedback.js';
import { gameState } from './js/gameState.js';

async function initializeGame() {
  try {
    gameState.fishData = await loadFishData();
    gameState.correctAnswer = gameState.fishData[Math.floor(Math.random() * gameState.fishData.length)];
    gameState.remainingGuesses = gameState.maxGuesses;
    gameState.isGameOver = false;

    const feedbackGrid = document.getElementById("feedback-grid");
    const resultsModal = document.getElementById("results-modal");
    
    initializeLifeBar(gameState.maxGuesses);
    populateFishList(gameState.fishData);
    generateCategoryHeader(feedbackGrid);
    setupGuessHandler(gameState.fishData);
    setupModals();
    setupBackHandler(resultsModal);

    console.log("Game initialized with answer:", gameState.correctAnswer.commonName);
    console.log("Fish data loaded:", gameState.correctAnswer);
  } catch (err) {
    console.error("Failed to initialize game:", err);
  }
}

window.addEventListener('DOMContentLoaded', initializeGame);
