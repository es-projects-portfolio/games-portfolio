// Wait till the browser is ready to render the game (avoids glitches)
document.addEventListener('DOMContentLoaded', function () {
  window.requestAnimationFrame(function () {
    initializeGameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager).then(() => {
      console.log('Initialization complete!');
    }).catch((error) => {
      console.error('Error during initialization:', error);
    });
  });
});
