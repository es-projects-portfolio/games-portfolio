
function updateClaimButtonVisibility() {
    const claimButton = document.querySelector('.claim-button');
    const tokensToClaimSpan = document.getElementById('tokens-to-claim');

    tokensToClaimSpan.textContent = user.amountToClaim.toString();

    if (user.isAvailableToClaim || user.amountToClaim !== 0) {
    claimButton.style.display = 'block';
    } else {
    claimButton.style.display = 'none';
    }
}

async function sendMessageAndRequestTokens() {
    try {
    const messageSent = await SendMessageToParent();
    if (messageSent) {
        await tokensRequest();
        await tokensClaim();
    } else {
        console.log('Post message to parent failed. Tokens not requested.');
    }
    } catch (error) {
    console.error('Error sending message and requesting tokens:', error);
    }
}

async function SendMessageToParent() {
    return new Promise((resolve, reject) => {
    try {
        window.parent.postMessage({ command: 'distributeToken', incrementValue: user.amountToClaim}, 'https://dnaniel213.github.io/');
        console.log("Wah sent message to parent", {
        amountToClaim: user.amountToClaim
        });
        resolve();
    } catch (error) {
        reject(error);
    }
    });
}

async function tokensRequest() {
    let url = '';
    var API_URL = "";
    if (user.main_env) {
    API_URL = BACKEND_ENDPOINT + user.username;
    } else {
    API_URL = BACKEND_ENDPOINT_DEMO + user.username;
    }

    if (user.eventId == null || user.eventId == undefined) {
    url = `${API_URL}/highscore/tokensreq?hash=-`
    } else {
    url = `${API_URL}/highscore/tokensreq?eventID=${user.eventId}&hash=-`
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
    return data;
    } catch (error) {
    console.error('Error updating high score tokens request:', error);
    return null;
    }
}

async function tokensClaim() {
    let url = '';
    var API_URL = "";
    if (user.main_env) {
    API_URL = BACKEND_ENDPOINT + user.username;
    } else {
    API_URL = BACKEND_ENDPOINT_DEMO + user.username;
    }

    if (user.eventId == null || user.eventId == undefined) {
    url = `${API_URL}/highscore/tokensclaim`
    } else {
    url = `${API_URL}/highscore/tokensclaim?eventID=${user.eventId}`
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
    return data;
    } catch (error) {
    console.error('Error updating high score tokens claim:', error);
    return null;
    }
}
setInterval(updateClaimButtonVisibility, 1000);
