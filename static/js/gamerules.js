let wordsData;
let currentWord;
let currentDifficulty;
let score = 0;
let timer;
let timeLeft;
let activeGameMode = null;

const gameModes = new Set(["blinking screen", "black and white", "short time", "on and off cam", "reverse"]);

// Fetch the charades data from the JSON file
fetch(charadesJsonUrl)
    .then(response => response.json())
    .then(data => {
        wordsData = data;
    });

function chooseWord(difficulty) {
    currentDifficulty = difficulty;
    const words = wordsData.data[difficulty];
    const randomIndex = Math.floor(Math.random() * words.length);
    currentWord = words[randomIndex];
    displayWord();
    startTimer();
}

function displayWord() {
    let wordToDisplay = "You are not the actor";
    if (UID === getCurrentActor()) {
        wordToDisplay = currentWord;
        if (activeGameMode === 'reverse') {
            wordToDisplay = wordToDisplay.split('').reverse().join('');
        }
    }
    document.getElementById('word-display').innerText = wordToDisplay;
}

function startTimer() {
    let timeLimit = 60;

    if (activeGameMode === 'short time') {
        timeLimit = Math.floor(timeLimit / 2);
    }

    timeLeft = timeLimit;
    document.getElementById('timer').innerText = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            sendSystemMessage(`Time's up! The word was ${currentWord}`);
            nextActor();
            chooseWord(currentDifficulty);
        }
    }, 1000);
}

function checkGuess(guess) {
    if (guess.toLowerCase() === currentWord.toLowerCase()) {
        score++;
        document.getElementById('score').innerText = score;
        clearInterval(timer);
        sendSystemMessage(`Correct! The word was ${currentWord}`);
        nextActor();
        chooseWord(currentDifficulty);
    } else {
        sendSystemMessage(`'${guess}' is incorrect.`);
    }
}

function applyGameModeEffects() {
    // Reset all effects
    document.body.style.animation = '';
    document.getElementById('video-streams').style.filter = '';
    
    if (activeGameMode === 'blinking screen') {
        document.body.style.animation = 'blink 1s infinite';
    } else if (activeGameMode === 'black and white') {
        document.getElementById('video-streams').style.filter = 'grayscale(100%)';
    } else if (activeGameMode === 'on and off cam') {
        setInterval(toggleCamera, 5000);
    }
    
    displayWord();
    startTimer();
}

function chooseGameMode() {
    const gameModesArray = Array.from(gameModes);
    const randomIndex = Math.floor(Math.random() * gameModesArray.length);
    activeGameMode = gameModesArray[randomIndex];
    sendSystemMessage(`New game mode: ${activeGameMode}`);
    applyGameModeEffects();
}

document.getElementById('guess-input').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        checkGuess(event.target.value);
        event.target.value = '';
    }
});

document.getElementById('easy-btn').addEventListener('click', () => chooseWord('easy'));
document.getElementById('medium-btn').addEventListener('click', () => chooseWord('medium'));
document.getElementById('hard-btn').addEventListener('click', () => chooseWord('hard'));
document.getElementById('new-game-mode-btn').addEventListener('click', chooseGameMode);
