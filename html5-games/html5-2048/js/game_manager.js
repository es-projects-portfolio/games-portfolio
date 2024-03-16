async function initializeGameManager(size, InputManager, Actuator, StorageManager) {
  const auth = await authFromWeb();
  await getUserMain(auth);

  var currentOrigin = window.location.origin;

  console.log("Current Origin:", currentOrigin);

  const gameManager = new GameManager(size, InputManager, Actuator, StorageManager);
}
function GameManager(size, InputManager, Actuator, StorageManager) {

  this.size           = size; // Size of the grid
  this.inputManager   = new InputManager;
  this.storageManager = new StorageManager;
  this.actuator       = new Actuator;

  this.startTiles     = 2;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  this.setup();
}

const BACKEND_ENDPOINT_DEMO = 'https://metx-games-api-demo.vercel.app/api/v1/2048/';
const AUTOSIGNER_ENDPOINT_DEMO = 'https://xar-autosigner-2.proximaxtest.com/api/v1/';

const BACKEND_ENDPOINT = 'https://metx-games-api-3.vercel.app/api/v1/2048/';
const AUTOSIGNER_ENDPOINT = 'https://xar-autosigner.proximaxtest.com/api/v1/';

// const GAME_ID = 'F0AAD5A652FEA2FA'; //testnet n mainnet
const GAME_ID = 'FCFA0743B8CA9BBF'; //staging

window.user = {
  _main_env: false,
  _auth: null,
  _userId: null,
  _username: 'Anonymous',
  _eventId: null,
  _highScore: 0,
  _isAvailableToClaim: false,
  _tokensClaimed: 0,
  _amountToClaim: 0,

  get auth() {
    return this._auth;
  },

  set auth(value) {
    this._auth = value;
  },

  get userId() {
    return this._userId;
  },

  set userId(value) {
    this._userId = value;
  },

  get username() {
    return this._username;
  },

  set username(value) {
    this._username = value;
  },

  get eventId() {
    return this._eventId;
  },

  set eventId(value) {
    this._eventId = value;
  },

  get highScore() {
    return this._highScore;
  },

  set highScore(value) {
    this._highScore = value;
  },

  get main_env() {
    return this._main_env;
  },

  set main_env(value) {
    this._main_env = value;
  },

  get isAvailableToClaim() {
    return this._isAvailableToClaim;
  },

  set isAvailableToClaim(value) {
    this._isAvailableToClaim = value;
  },

  get tokensClaimed() {
    return this._tokensClaimed;
  },

  set tokensClaimed(value) {
    this._tokensClaimed = value;
  },

  get amountToClaim() {
    return this._amountToClaim;
  },

  set amountToClaim(value) {
    this._amountToClaim = value;
  },

};

const authFromWeb = async () => {
  var queryString = window.location.search.substring(1);

  if (queryString) {
    var queryParams = queryString.split('&');

    for (var i = 0; i < queryParams.length; i++) {
      var pair = queryParams[i].split('=');

      if (pair[0] === 'auth') {
        user.auth = pair[1];
        console.log('new user:', user.auth);
        return user.auth;
      }
    }
  }

  return null;
};

async function getUserMain(auth) {
  if (auth == null){
    auth = user.auth;
  }

  const GET_USER_ENDPOINT = AUTOSIGNER_ENDPOINT + `users/${auth}`;
  const GET_EVENT_ENDPOINT = AUTOSIGNER_ENDPOINT + `events/findId?gameId=${GAME_ID}`;

  try {
    const userResponse = await fetch(GET_USER_ENDPOINT);
    const eventResponse = await fetch(GET_EVENT_ENDPOINT);
    const userData = await userResponse.json();
    const eventData = await eventResponse.json();

    user.userId = userData.userId || null;
    user.username = userData.username || 'Anonymous';
	  user.eventId = eventData.viewModel && eventData.viewModel[0] || null;
	  user.main_env = false;

    const data = {
      auth: auth,
      userId: user.userId,
      username: user.username,
      gameId: GAME_ID,
      eventId: user.eventId,
      Mainnet: user.main_env
    }

    console.log('Details: ', data);

    await getHighScore();

    return { data };
  } catch (error) {
    console.error('Error fetching user info:', error);

    await getUserTest();

    return { userId: user.userId, username: user.username };
  }
};

async function getUserTest() {
  const auth = user.auth;
  // const auth = '8235E604D97E3F43EE8475010AE03DF402CD448AE3ED559F7407F2248DEEB4D63DEE6DA0305E141D';
  const GET_USER_ENDPOINT = AUTOSIGNER_ENDPOINT_DEMO + `users/${auth}`;
  const GET_EVENT_ENDPOINT = AUTOSIGNER_ENDPOINT_DEMO + `events/findId?gameId=${GAME_ID}`;

  try {
    const userResponse = await fetch(GET_USER_ENDPOINT);
    const eventResponse = await fetch(GET_EVENT_ENDPOINT);
    const userData = await userResponse.json();
    const eventData = await eventResponse.json();

    user.userId = userData.userId || null;
    user.username = userData.username || 'Anonymous';
	  user.eventId = eventData.viewModel && eventData.viewModel[0] || null;
	  user.main_env = false;

    const data = {
      auth: auth,
      userId: user.userId,
      username: user.username,
      gameId: GAME_ID,
      eventId: user.eventId,
      Mainnet: user.main_env
	  }

    console.log('Details: ', data);

    await getHighScore();

    return { data };
  } catch (error) {
    console.error('Error fetching user info:', error);

    user.userId = null;
    user.username = "Anonymous";

    const data = {
      auth: auth,
      userId: user.userId,
      username: user.username,
      gameId: GAME_ID,
      eventId: user.eventId,
      Mainnet: user.main_env
    }

    console.log('Details: ', data);

    await displayLoginMessage();

    return { data };
};
}

async function displayLoginMessage() {
  const shouldLogin = confirm("MetX login required! Do you want to proceed without login?");

  if (shouldLogin) {
    const username = prompt("Please enter your username:");

    if (username) {
      user.username = username;
      console.log("User entered username:", user.username);
      await getHighScore();
    } else {
      alert("Username is required. Please try again.");
    }
  } else {
    console.log("User chose not to log in");
  }
}


async function getHighScore() {
  let url = '';
  var API_URL = "";
  if (user.main_env) {
    API_URL = BACKEND_ENDPOINT + user.username;
  } else {
    API_URL = BACKEND_ENDPOINT_DEMO + user.username;
  }

  if (user.eventId == null || user.eventId == undefined) {
    url = `${API_URL}/highscore`
  } else {
    url = `${API_URL}/highscore?eventID=${user.eventId}`
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    user.highScore = data.data.highScore;
    user.isAvailableToClaim = data.data.availableTokensClaim;
    user.tokensClaimed = data.data.tokensClaimed;

    if (user.isAvailableToClaim === true) {
      user.amountToClaim = user.highScore - user.tokensClaimed;
    }
    console.log('High Score: ', {
      HighScore: user.highScore,
      AvaiableToClaim: user.isAvailableToClaim,
      tokensClaimed: user.tokensClaimed,
      amountToClaim: user.amountToClaim
    });

    await updateHighScoreMetX(user.highScore);

    return {highScore: user.highScore};
  } catch (error) {
    console.error('Error fetching best score from API:', error);
    return 0;
  }
};

async function updateHighScore(points) {
  var API_URL = "";
  let url = '';
  if (user.main_env) {
    API_URL = BACKEND_ENDPOINT + user.username;
  } else {
    API_URL = BACKEND_ENDPOINT_DEMO + user.username;
  }

  if (user.eventId == null || user.eventId == undefined) {
    url = `${API_URL}/highscore?score=${points}`
  } else {
    url = `${API_URL}/highscore?eventID=${user.eventId}&score=${points}`
  }

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Result:", data);
    await updateHighScoreMetX(points);

    return data;
  } catch (error) {
    console.error('Error updating high score:', error);
    return null;
  }
}

async function updateHighScoreMetX(points) {
  var localStorageData = localStorage;

  const base_url_list = [
    localStorageData.getItem('testnetUrl').replace(/^"(.*)"$/, '$1'),
    localStorageData.getItem('mainnetUrl').replace(/^"(.*)"$/, '$1')
  ];

  for (const baseUrl of base_url_list) {
    try {
      const response = await fetch(`${baseUrl}events/score?userId=${user.userId}&gameId=${GAME_ID}&score=${points}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("MetX Result: ", data);

      return data;
    } catch (error) {
      console.error('Error updating high score in MetX:', error);
    }
  }

  return null;
}



// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  this.setup();
};

// Keep playing after winning (allows going over 2048)
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game won/lost message
};

// Return true if the game is lost, or has won and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function () {
  return this.over || (this.won && !this.keepPlaying);
};

// Set up the game
GameManager.prototype.setup = function () {
  console.log("Start Game");

  this.storageManager.setBestScore(user.highScore);
  var previousState = this.storageManager.getGameState();

  // Reload the game from a previous game if present
  if (previousState) {
    this.grid        = new Grid(previousState.grid.size,
                                previousState.grid.cells); // Reload grid
    this.score       = previousState.score;
    this.over        = previousState.over;
    this.won         = previousState.won;
    this.keepPlaying = previousState.keepPlaying;
  } else {
    this.grid        = new Grid(this.size);
    this.score       = 0;
    this.over        = false;
    this.won         = false;
    this.keepPlaying = false;

    // Add the initial tiles
    this.addStartTiles();
  }

  // Update the actuator
  this.actuate();
  console.log("Best Score: " + this.storageManager.getBestScore())
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.storageManager.getBestScore() < this.score) {
    this.storageManager.setBestScore(this.score);
  }

  // Clear the state when the game is over (game over only, not win)
  if (this.over) {
    this.storageManager.clearGameState();
    if (this.storageManager.getBestScore() < this.score && user.highScore < this.score) {
      this.storageManager.setBestScore(this.score);
      updateHighScore(this.score);
      user.highScore = this.score;
      user.amountToClaim = user.highScore - user.tokensClaimed;
      console.log("New score: ", {
        highScore: user.highScore,
        tokensClaimed: user.tokensClaimed,
        amountToClaim: user.amountToClaim
      })
    }
  } else {
    this.storageManager.setGameState(this.serialize());
  }

  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.storageManager.getBestScore(),
    terminated: this.isGameTerminated()
  });

};

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
    keepPlaying: this.keepPlaying
  };
};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2: down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += merged.value;

          // The mighty 2048 tile
          if (merged.value === 2048) self.won = true;
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });

  if (moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // Game over!
      if (user.highScore < this.score) {
        this.storageManager.setBestScore(this.score);
        updateHighScore(this.score);
        user.highScore = this.score;
        user.amountToClaim = user.highScore - user.tokensClaimed;
        console.log("New score: ", {
          highScore: user.highScore,
          tokensClaimed: user.tokensClaimed,
          amountToClaim: user.amountToClaim
        })
      }
    }

    this.actuate();
  }
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // Up
    1: { x: 1,  y: 0 },  // Right
    2: { x: 0,  y: 1 },  // Down
    3: { x: -1, y: 0 }   // Left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
