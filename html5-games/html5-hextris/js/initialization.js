$(document).ready(function() {
	initialize();
});
async function initialize(a) {

	window.rush = 1;
	window.lastTime = Date.now();
	window.iframHasLoaded = false;
	window.colors = ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71"];
	window.hexColorsToTintedColors = {
		"#e74c3c": "rgb(241,163,155)",
		"#f1c40f": "rgb(246,223,133)",
		"#3498db": "rgb(151,201,235)",
		"#2ecc71": "rgb(150,227,183)"
	};

	window.rgbToHex = {
		"rgb(231,76,60)": "#e74c3c",
		"rgb(241,196,15)": "#f1c40f",
		"rgb(52,152,219)": "#3498db",
		"rgb(46,204,113)": "#2ecc71"
	};

	window.rgbColorsToTintedColors = {
		"rgb(231,76,60)": "rgb(241,163,155)",
		"rgb(241,196,15)": "rgb(246,223,133)",
		"rgb(52,152,219)": "rgb(151,201,235)",
		"rgb(46,204,113)": "rgb(150,227,183)"
	};

	window.hexagonBackgroundColor = 'rgb(236, 240, 241)';
	window.hexagonBackgroundColorClear = 'rgba(236, 240, 241, 0.5)';
	window.centerBlue = 'rgb(44,62,80)';
	window.angularVelocityConst = 4;
	window.scoreOpacity = 0;
	window.textOpacity = 0;
	window.prevGameState = undefined;
	window.op = 0;
	window.saveState = localStorage.getItem("saveState") || "{}";
	if (saveState !== "{}") {
		op = 1;
	}

	window.textShown = false;
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
			window.setTimeout(callback, 1000 / framerate);
		};
	})();
	$('#clickToExit').bind('click', toggleDevTools);
	window.settings;
	if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        $('.rrssb-email').remove();
		settings = {
			os: "other",
			platform: "mobile",
			startDist: 227,
			creationDt: 60,
			baseScale: 1.4,
			scale: 1,
			prevScale: 1,
			baseHexWidth: 87,
			hexWidth: 87,
			baseBlockHeight: 20,
			blockHeight: 20,
			rows: 7,
			speedModifier: 0.73,
			speedUpKeyHeld: false,
			creationSpeedModifier: 0.73,
			comboTime: 310
		};
	} else {
		settings = {
			os: "other",
			platform: "nonmobile",
			baseScale: 1,
			startDist: 340,
			creationDt: 9,
			scale: 1,
			prevScale: 1,
			hexWidth: 65,
			baseHexWidth: 87,
			baseBlockHeight: 20,
			blockHeight: 15,
			rows: 8,
			speedModifier: 0.65,
			speedUpKeyHeld: false,
			creationSpeedModifier: 0.65,
			comboTime: 310
		};

	}
	if(/Android/i.test(navigator.userAgent)) {
		settings.os = "android";
	}

	if(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)){
		settings.os="ios";
	}

	window.canvas = document.getElementById('canvas');
	window.ctx = canvas.getContext('2d');
	window.trueCanvas = {
		width: canvas.width,
		height: canvas.height
	};
	scaleCanvas();

	window.framerate = 60;
	window.history = {};
	window.score = 0;
	window.scoreAdditionCoeff = 1;
	window.prevScore = 0;
	window.numHighScores = 3;

	highscores = [];
	if (localStorage.getItem('highscores')) {
		try {
			highscores = JSON.parse(localStorage.getItem('highscores'));
		} catch (e) {
			highscores = [];
		}
	}
	window.blocks = [];
	window.MainHex;
	window.gdx = 0;
	window.gdy = 0;
	window.devMode = 0;
	window.lastGen = undefined;
	window.prevTimeScored = undefined;
	window.nextGen = undefined;
	window.spawnLane = 0;
	window.importing = 0;
	window.importedHistory = undefined;
	window.startTime = undefined;
	window.gameState;
	setStartScreen();
	if (a != 1) {
		window.canRestart = 1;
		window.onblur = function(e) {
			if (gameState == 1) {
				pause();
			}
		};
		$('#startBtn').off();
		if (settings.platform == 'mobile') {
			$('#startBtn').on('touchstart', startBtnHandler);
		} else {
			$('#startBtn').on('mousedown', startBtnHandler);
		}

		document.addEventListener('touchmove', function(e) {
			e.preventDefault();
		}, false);
		$(window).resize(scaleCanvas);
		$(window).unload(function() {

			if (gameState == 1 || gameState == -1 || gameState === 0) localStorage.setItem("saveState", exportSaveState());
			else localStorage.setItem("saveState", "{}");
		});

		addKeyListeners();
		(function(i, s, o, g, r, a, m) {
			i['GoogleAnalyticsObject'] = r;
			i[r] = i[r] || function() {
				(i[r].q = i[r].q || []).push(arguments)
			}, i[r].l = 1 * new Date();
			a = s.createElement(o), m = s.getElementsByTagName(o)[0];
			a.async = 1;
			a.src = g;
			m.parentNode.insertBefore(a, m)
		})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
		ga('create', 'UA-51272720-1', 'teamsnowman.github.io');
		ga('send', 'pageview');

		document.addEventListener("pause", handlePause, false);
		document.addEventListener("backbutton", handlePause, false);
		document.addEventListener("menubutton", handlePause, false); //menu button on android

		setTimeout(function() {
			if (settings.platform == "mobile") {
				try {
					document.body.removeEventListener('touchstart', handleTapBefore, false);
				} catch (e) {

				}

				try {
					document.body.removeEventListener('touchstart', handleTap, false);
				} catch (e) {

				}

				document.body.addEventListener('touchstart', handleTapBefore, false);
			} else {
				try {
					document.body.removeEventListener('mousedown', handleClickBefore, false);
				} catch (e) {

				}

				try {
					document.body.removeEventListener('mousedown', handleClick, false);
				} catch (e) {

				}

				document.body.addEventListener('mousedown', handleClickBefore, false);
			}
		}, 1);
	}

	const auth = await authFromWeb();
	await getUserMain(auth);

	var currentOrigin = window.location.origin;

	console.log("Current Origin:", currentOrigin);

}

function startBtnHandler() {
	setTimeout(function() {
		if (settings.platform == "mobile") {
			try {
				document.body.removeEventListener('touchstart', handleTapBefore, false);
			} catch (e) {

			}

			try {
				document.body.removeEventListener('touchstart', handleTap, false);
			} catch (e) {

			}

			document.body.addEventListener('touchstart', handleTap, false);
		} else {
			try {
				document.body.removeEventListener('mousedown', handleClickBefore, false);
			} catch (e) {

			}

			try {
				document.body.removeEventListener('mousedown', handleClick, false);
			} catch (e) {

			}

			document.body.addEventListener('mousedown', handleClick, false);
		}
	}, 5);

	if (!canRestart) return false;

	if ($('#openSideBar').is(':visible')) {
		$('#openSideBar').fadeOut(150, "linear");
	}

	if (importing == 1) {
		init(1);
		checkVisualElements(0);
	} else {
		resumeGame();
	}
}

function handlePause() {
	if (gameState == 1 || gameState == 2) {
		pause();
	}
}

function handleTap(e) {
	handleClickTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
}

function handleClick(e) {
	handleClickTap(e.clientX, e.clientY);
}

function handleTapBefore(e) {
	var x = e.changedTouches[0].clientX;
	var y = e.changedTouches[0].clientY;

	if (x < 120 && y < 83 && $('.helpText').is(':visible')) {
		showHelp();
		return;
	}
}

function handleClickBefore(e) {
	var x = e.clientX;
	var y = e.clientY;

	if (x < 120 && y < 83 && $('.helpText').is(':visible')) {
		showHelp();
		return;
	}
}

const BACKEND_ENDPOINT_DEMO = 'https://metx-games-api-demo.vercel.app/api/v1/Hextris/';
const AUTOSIGNER_ENDPOINT_DEMO = 'https://xar-autosigner-2.proximaxtest.com/api/v1/';

const BACKEND_ENDPOINT = 'https://metx-games-api-2.vercel.app/api/v1/Hextris/';
const AUTOSIGNER_ENDPOINT = 'https://xar-autosigner.proximaxtest.com/api/v1/';

// const GAME_ID = '9FC4A84C67763031'; //testnet and mainnet
const GAME_ID = '893F620F515DAD4A'; //staging

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
	// const auth = '2D18BF0D2A487BE7CECC45FCC18BDED675686F3EA41767E4C1B0D1ADC0D0DF5E920401B00FEFF0B5';
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
	  console.error('Error fetching user info:', error.message);

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
	  $("#currentHighScore").text(user.highScore);
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
	  $("#currentHighScore").text(points);
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
	]

	for (const baseUrl of base_url_list) {
	  try {
		const response = await fetch(`${baseUrl}events/score?userId=${user.userId}&gameId=${GAME_ID}&score=${points}`, {
		  method: 'PUT',
		  headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${user.jwtToken}`,
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
