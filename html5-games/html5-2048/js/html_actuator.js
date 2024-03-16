function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  //this.messageContainer = document.querySelector(".game-message");
  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};


const fetchLeaderboardData = async () => {
  let url = "";
  let API_URL = user.main_env ? BACKEND_ENDPOINT : BACKEND_ENDPOINT_DEMO;

  if (user.eventId == null || user.eventId == undefined) {
    url = `${API_URL}highscore/leaderboard`;
  } else {
    url = `${API_URL}highscore/leaderboard?eventID=${user.eventId}`;
  }

  console.log("Fetching leaderboard data . . .");

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    const data = await response.json();
    populateTable(data);
    updateLeaderboard(url); // Automatically update leaderboard after fetching data

    console.log('For leaderboard: ', {
      eventId: user.eventId,
      data
    })

  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Function to populate the table with player names and high scores
function populateTable(data) {
  const tableBody = document.querySelector('#leaderboard-table tbody');

  // Clear existing rows
  tableBody.innerHTML = '';

  data.forEach(player => {
    const row = document.createElement('tr');
    const playerNameCell = document.createElement('td');
    const highScoreCell = document.createElement('td');

    playerNameCell.textContent = player.userID; 
    highScoreCell.textContent = player.highscore;

    row.appendChild(playerNameCell);
    row.appendChild(highScoreCell);
    tableBody.appendChild(row);
  });
}

// Function to get leaderboard and update the table
function updateLeaderboard(url) {
  fetch(url)
    .then(response => response.json())
    .then(data => populateTable(data))
    .catch(error => console.error('Error fetching data:', error));
}

// Modify the HTMLActuator prototype to include getLeaderboard function
HTMLActuator.prototype.getLeaderboard = function () {
  updateLeaderboard();
};

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(fetchLeaderboardData, 3000);
});


