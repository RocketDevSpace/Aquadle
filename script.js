// script.js (entry point, renamed from main.js optional)
import { loadFishData } from './js/fishData.js';
import { populateFishList } from './js/fishData.js';
import { setupGuessHandler } from './js/uiHandlers.js';
import { initializeLifeBar } from './js/lifeBar.js';
import { setupModals } from './js/modal.js';
import { generateCategoryHeader } from './js/renderFeedback.js';
import { gameState } from './js/gameState.js';

async function initializeGame() {
  try {
    gameState.fishData = await loadFishData();
    gameState.correctAnswer = gameState.fishData[Math.floor(Math.random() * gameState.fishData.length)];
    gameState.remainingGuesses = gameState.maxGuesses;
    gameState.isGameOver = false;

    const feedbackGrid = document.getElementById("feedback-grid");
    
    initializeLifeBar(gameState.maxGuesses);
    populateFishList(gameState.fishData);
    generateCategoryHeader(feedbackGrid);
    setupGuessHandler(gameState.fishData);
    setupModals();

    console.log("Game initialized with answer:", gameState.correctAnswer.name);
  } catch (err) {
    console.error("Failed to initialize game:", err);
  }
}

window.addEventListener('DOMContentLoaded', initializeGame);
