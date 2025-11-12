// Voice sampler ("Animalese")
let validLetters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","space","backspace"];
let voiceSamplers = {}
for (let letter of validLetters) {
	if (letter == "space" || letter == "backspace") {
		continue
	}
	voiceSamplers[letter] = new Tone.Sampler({
		urls: {
			C2: `voice-${letter}.mp3`
		},
		baseUrl: "assets/audio/",
		volume: -10,
	}).toDestination();
}
function playVoice(letter) {
	letter = letter.toLowerCase();
	if (letter != "space" && letter != "backspace" && validLetters.includes(letter)) {
		let warble = Math.random()*(pitch/10) - pitch/5;
		voiceSamplers[letter].triggerAttackRelease(pitch + warble, Math.max(speed/1000, .25));
	}
}
let playIndex = 0;
let playDelay;
let playing = false;
function playAll() {
	clearTimeout(playDelay);
	playIndex = 0;
	let screenContent = document.querySelector('.screen-content');
	if (screenContent.textContent.trim() == "") {
		return
	}
	playing = true;

	let player = document.querySelector('.player');
	player.dataset.active = 1;

	let temp = "";
	let words = screenContent.textContent.split(' ');
	let wordIndex = 0;
	for (let word of words) {
		temp += `<span>`;
		for (let letter of word) {
			let randomColor = colors[Math.floor(Math.random()*colors.length)];
			temp += `<span style="--primary: var(--${randomColor}); transform: translateY(100%) rotate(${Math.random()*720-360}deg); opacity: 0; transition: ${speed}ms;" class="letter">${letter}</span>`
		}
		wordIndex++;
		if (wordIndex >= words.length) {
			temp += `</span>`;
		} else {
			temp += `</span><span style="visibility: hidden;">&nbsp;</span>`;
		}
	}
	let playerContent = document.querySelector('.player-content');
	playerContent.innerHTML = temp;

	setTimeout(playAllLoop, 50);
}
function playAllLoop() {
	let playerContent = document.querySelector('.player-content');
	let letters = playerContent.querySelectorAll('.letter');
	currentLetter = letters[playIndex];
	currentLetter.style.transform = "translateY(0%) rotate(0deg)";
	currentLetter.style.opacity = 1;
	playVoice(currentLetter.textContent);

	playIndex++;
	if (playIndex >= letters.length) {
		playDelay = setTimeout(endPlayAll, speed+2000);
	} else {
		playDelay = setTimeout(playAllLoop, speed);
	}
}
function endPlayAll() {
	playing = false;
	clearTimeout(playDelay);
	playIndex = 0;
	let player = document.querySelector('.player');
	player.dataset.active = 0;
}

// Change keyboard colors
const colors = ['blue', 'red', 'yellow', 'green', 'purple', 'orange', 'pink', 'lime'];
function changeColors() {
	for (let button of document.querySelectorAll('.keyboard-row button')) {
		let color = colors[Math.floor(Math.random()*colors.length)];
		button.style.setProperty('--primary', `var(--${color})`);
	}
	for (let group of document.querySelectorAll('.controls-group')) {
		let color = colors[Math.floor(Math.random()*colors.length)];
		group.style.setProperty('--primary', `var(--${color})`);
	}
}
// setInterval(changeColors, 1000);

// Controls
let pitch = 200;
function setPitch(newPitch) {
	pitch = Math.abs(Math.log(1 - newPitch/101)*500)+25;
}

let speed = 100;
function speedToDelay(value) {
	// value: 0–100 (0 = slowest, 100 = fastest)
	const minDelay = 1000; // ms
	const maxDelay = 50;   // ms
  
	// normalize to 0–1
	const t = value / 100;
  
	// logarithmic interpolation
	const delay = minDelay * Math.pow(maxDelay / minDelay, t);

	return delay;
}
function setSpeed(newSpeed) {
	speed = speedToDelay(newSpeed);
}

// Convert a linear range (1–100) to a logarithmic dB scale (-60 to 0)
let volume = 100;
function linearToDb(value, min = 1, max = 100, minDb = -60, maxDb = 0) {
	// Normalize to 0–1
	const normalized = (value - min) / (max - min);
  
	// Apply logarithmic curve (more natural to human hearing)
	const logScaled = Math.log10(1 + 9 * normalized); // log(1–10) mapping
  
	// Map to dB range
	return minDb + (maxDb - minDb) * logScaled;
}
function setVolume(newVolume) {
	volume = linearToDb(newVolume);
	Tone.Destination.volume.value = volume;
}

// Add event listeners to virtual keyboard
let delays = {};
function initKeyboard() {
	for (let letter of validLetters) {
		delays[letter] = "";
	}

	changeColors();
	for (let button of document.querySelectorAll('.keyboard-row button')) {
		let letter = button.dataset.letter;
		button.addEventListener('click', () => {
			pressKey(letter);
		})
	}
}
initKeyboard();

// Press virtual keyboard and add letter
function pressKey(letter) {
	if (playing) {
		return
	}
	clearTimeout(delays[letter]);

	const button = document.querySelector(`[data-letter="${letter.toLowerCase()}"]`);
	button.dataset.active = 1;

	delays[letter] = setTimeout(() => {
		button.dataset.active = 0;
	}, 100)

	if (letter == "escape" || letter == "enter") {
		return
	}

	if (letter == "space") {
		addSpace();
	} else if (letter == "backspace") {
		removeLetter();
	} else {
		addLetter(letter);
		playVoice(letter);
	}
}

// Add letter to screen
function addLetter(letter, caps) {
	let screenContent = document.querySelector('.screen-content');
	if (document.activeElement == screenContent) {
		return
	}
	screenContent.innerHTML += letter;
	screenContent.scrollTop = screenContent.scrollHeight;
}
function addSpace() {
	let screenContent = document.querySelector('.screen-content');
	if (document.activeElement == screenContent) {
		return
	}
	if (screenContent.textContent.charAt(screenContent.textContent.length-1) != " ") {
		screenContent.innerHTML += " ";
	}
	screenContent.scrollTop = screenContent.scrollHeight;
}
function removeLetter() {
	let screenContent = document.querySelector('.screen-content');
	if (document.activeElement == screenContent) {
		return
	}
	screenContent.textContent = screenContent.textContent.slice(0, -1);
	screenContent.scrollTop = screenContent.scrollHeight;
}
function clearScreen() {
	let screenContent = document.querySelector('.screen-content');
	screenContent.textContent = "";
}

// Use real keyboard
function typeAnimalese(e) {
	if (e.target.tagName == "BUTTON") {
		e.preventDefault();
	}
	let letter = e.key;
	if (letter == " ") {
		pressKey('space');
	} else if (letter == "Backspace") {
		pressKey('backspace');
	} else if (letter == "Enter") {
		e.preventDefault();
		pressKey('enter');
		playAll();
	} else if (letter == "Escape") {
		e.preventDefault();
		pressKey('escape');
		if (playing) {
			endPlayAll();
		} else {
			clearScreen();
		}
	} else if (!validLetters.includes(letter.toLowerCase())) {
		return
	} else {
		pressKey(letter);
	}
}
document.addEventListener('keydown', typeAnimalese);