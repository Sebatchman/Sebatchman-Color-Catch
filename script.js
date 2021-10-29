const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const scoreEl = document.querySelector('#scoreNum');
const StartGameBox = document.querySelector('#modalEl');
const StartGameBtn = document.querySelector('#StartGameBtn');
const finalScore = document.querySelector('#bigScoreEl');
const heart_Id_1 = document.createElement('img');
const heart_Id_2 = document.createElement('img');
const heart_Id_3 = document.createElement('img');
heart_Id_1.src = 'heart.png';
heart_Id_2.src = 'heart.png';
heart_Id_3.src = 'heart.png';
heart_Id_1.classList.add("heart");
heart_Id_2.classList.add("heart");
heart_Id_3.classList.add("heart");

let LEFT = false;
let RIGHT = false;
let spawnEnemyInterval;
let spawnFruitInterval;
let spawnRareFruitInterval;
let updatePlayerInterval;
let score = 0;

canvas.width = 900;
canvas.height = 600;

function playAudio(audio) {
	const soundEffect = new Audio(audio);
	soundEffect.play();
}

class Player {
	constructor(x, y, radius, color, speed) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.speed = speed;
	}
	draw() {
		c.strokeStyle = 'black';
		c.lineWidth = 5;
		c.beginPath();
		c.arc(this.x, this.y, this.radius, Math.PI, 0, true);
		c.fillStyle = this.color;
		c.closePath();
		c.fill();
		c.stroke();
	}
}

class Fruit {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}
	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}
	update() {
		this.draw();
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
}

class RareFruit {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}
	draw() {
		c.strokeStyle = '#45A5FF';
		c.lineWidth = 7;
		c.beginPath();
		c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.closePath();
		c.fill();
		c.stroke();
	}
	update() {
		this.draw();
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
}

class Enemy {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}
	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}
	update() {
		this.draw();
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
}

const x = canvas.width / 2;
const y = canvas.height / 1.13;

let player = new Player(x, y, 70, 'white', 10);
let fruits = [];
let enemies = [];
let rareFruits = [];
let enemySpeed = 9;
let fruitSpeed = 9;
let randomFruits = ['red', 'orange', 'yellow'];
let livesLost = [];
let fruitSpawnSpeed = 1000;
let RarefruitSpawnSpeed = 12000;
let enemySpawnSpeed = 5000;

function startGame() {
	player = new Player(x, y, 70, 'white', 18);
	livesLost = [];
	fruits = [];
	rareFruits = [];
	enemies = [];
	enemySpeed = 9;
	fruitSpeed = 9;
	score = 0;
	fruitSpawnSpeed = 1000;
	RarefruitSpawnSpeed = 12000;
	enemySpawnSpeed = 5000;
	scoreEl.innerHTML = score;
	finalScore.innerHTML = score;
	let container = document.getElementById('heart-wrapper');
	createHearts();
	increaseSpeed();
	setTimeout(increaseFruitSpawnTime, 1000);
	setTimeout(increaseEnemySpawnTime, 5000);
	setTimeout(increaseRareFruitSpawnTime, 12000);
}

function generateRandomNumber(min, max) {
	return Math.random() * (max - min) + min;
}
// Math.random() * canvas.width
function spawnFruit() {
	const radius = 30;
	let x;
	let y;
	x = generateRandomNumber(30, canvas.width - 30);
	y = 0 - radius;
	const color = shuffle(randomFruits)[0];
	const angle = Math.atan2(
	canvas.height / 0 - y,
	Math.random() * canvas.width);
	 const velocity = {
		x: Math.cos(angle) * fruitSpeed,
		y: Math.sin(angle) * fruitSpeed
	}
		fruits.push(new Fruit(x, y, radius, color, velocity));
}

function spawnRareFruit() {
	const radius = 20;
	let x;
	let y;
	x = generateRandomNumber(20, canvas.width - 20);
	y = 0 - radius;
	const color = '#00FFBB';
	const angle = Math.atan2(
	canvas.height / 0 - y,
	Math.random() * canvas.width);
	 const velocity = {
		x: Math.cos(angle) * fruitSpeed,
		y: Math.sin(angle) * fruitSpeed
	}
	rareFruits.push(new RareFruit(x, y, radius, color, velocity));
}


function spawnEnemy() {
		const radius = 30;
		let x;
		let y;
		x = generateRandomNumber(30, canvas.width - 30);
		y = 0 - radius;
		const color = 'black';
		const angle = Math.atan2(
	canvas.height / 0 - y,
	Math.random() * canvas.width);
	 const velocity = {
		x: Math.cos(angle) * enemySpeed,
		y: Math.sin(angle) * enemySpeed
	}
		enemies.push(new Enemy(x, y, radius, color, velocity));
}

function animate() {
	animationId = requestAnimationFrame(animate);
	c.clearRect(0, 0, canvas.width, canvas.height)
	player.draw();
	fruits.forEach(fruit => {
		fruit.update();
	})
	enemies.forEach(enemy => {
		enemy.update();
	})
	rareFruits.forEach(rareFruit => {
		rareFruit.update();
	})
	movePlayer();
	player.x = limitMovement(player.x, player.radius, canvas.width - player.radius);
	if (livesLost.length === 3) {
			clearInterval(spawnEnemyInterval);
			clearInterval(spawnFruitInterval);
			clearInterval(spawnRareFruitInterval);
			clearInterval(speedInterval);
			cancelAnimationFrame(animationId);
			playAudio('gameOver.wav');
			StartGameBox.style.display = 'flex';
			finalScore.innerHTML = score;
	}
	fruits.forEach((fruit, index) => {
	if (fruit.x + fruit.radius < 0 ||
			fruit.x - fruit.radius > canvas.width ||
			fruit.y + fruit.radius < 0 ||
			fruit.y - fruit.radius > canvas.height) {
				setTimeout(() => {
					fruits.splice(index, 1);
			}, 0);
		}
	const distance = Math.hypot(player.x - fruit.x, canvas.height - fruit.y );
	if (((player.x - fruit.x) - 0) >= -60 && 
		((player.x - fruit.x) - 0) <= 60 && 
		canvas.height - fruit.y - 105 <=0) {
		setTimeout(() => {
			if (fruit.color === 'yellow') {
				score += 100;
				scoreEl.innerHTML = score;
			}
			else if (fruit.color === 'orange') {
				score += 200;
				scoreEl.innerHTML = score;
			}
			else if (fruit.color === 'red') {
				score += 300;
				scoreEl.innerHTML = score;
			}
			fruits.splice(index, 1);
			playAudio('fruit.wav');
		}, 0);
	}
})
	rareFruits.forEach((rareFruit, index) => {
	if (rareFruit.x + rareFruit.radius < 0 ||
			rareFruit.x - rareFruit.radius > canvas.width ||
			rareFruit.y + rareFruit.radius < 0 ||
			rareFruit.y - rareFruit.radius > canvas.height) {
				setTimeout(() => {
					rareFruits.splice(index, 1);
			}, 0);
		}
	const distance = Math.hypot(player.x - rareFruit.x, canvas.height - rareFruit.y );
	if (((player.x - rareFruit.x) - 0) >= -60 && 
		((player.x - rareFruit.x) - 0) <= 60 && 
		canvas.height - rareFruit.y - 105 <=0) {
		setTimeout(() => {
			score += 1000;
			scoreEl.innerHTML = score;
			rareFruits.splice(index, 1);
			playAudio('rareFruit.wav');
		}, 0);
	}
})
	enemies.forEach((enemy, index) => {
		if (enemy.x + enemy.radius < 0 ||
			enemy.x - enemy.radius > canvas.width ||
			enemy.y + enemy.radius < 0 ||
			enemy.y - enemy.radius > canvas.height) {
				setTimeout(() => {
					enemies.splice(index, 1);
			}, 0);
		}
	const distance = Math.hypot(player.x - enemy.x, canvas.height - enemy.y);
	if (((player.x - enemy.x) - 0) >= -60 && 
		((player.x - enemy.x) - 0) <= 60 && 
		canvas.height - enemy.y - 105 <=0) {
		setTimeout(() => {
			deleteHearts();
			enemies.splice(index, 1);
			playAudio('playerHit.wav');
		}, 0);
	}
	})
}

function deleteHearts() {
	let container = document.getElementById('heart-wrapper');
	let child = container.lastElementChild;
	if (container.hasChildNodes()) {
	container.removeChild(child);
	livesLost.push(child);
	}
}

function createHearts() {
	let container = document.getElementById('heart-wrapper');
	container.append(heart_Id_1, heart_Id_2, heart_Id_3);
}

function shuffle(array) {
	let currentIndex = array.length, randomIndex;
	while (currentIndex != 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
	[array[currentIndex], array[randomIndex]] = [
	array[randomIndex], array[currentIndex]];
	}
	return array;
}

function increaseSpeed() {
	speedInterval = setInterval(() => {
		if (fruitSpeed < 12) {
			fruitSpeed = fruitSpeed + 0.2;
		}
		if (enemySpeed < 16) {
			enemySpeed = enemySpeed + 0.4;
		}
		console.log(fruitSpeed, enemySpeed);
	}, 2500);
}	

function increaseFruitSpawnTime() {
	if (fruitSpawnSpeed > 400) {
		let percentage = (0.13 / 5000) * fruitSpawnSpeed;
		fruitSpawnSpeed = fruitSpawnSpeed - (fruitSpawnSpeed * percentage);
	}
	spawnFruitInterval = setTimeout(increaseFruitSpawnTime, fruitSpawnSpeed);
	spawnFruit();
}

function increaseRareFruitSpawnTime() {
	if (RarefruitSpawnSpeed > 8500) {
		let percentage = (0.12 / 12000) * RarefruitSpawnSpeed;
		RarefruitSpawnSpeed = RarefruitSpawnSpeed - (RarefruitSpawnSpeed * percentage);
	}
	spawnRareFruitInterval = setTimeout(increaseRareFruitSpawnTime, RarefruitSpawnSpeed);
	spawnRareFruit();
}

function increaseEnemySpawnTime() {
	if (enemySpawnSpeed > 600) {
		let percentage = (0.15 / 5000) * enemySpawnSpeed;
		enemySpawnSpeed = enemySpawnSpeed - (enemySpawnSpeed * percentage);
	}
	spawnEnemyInterval = setTimeout(increaseEnemySpawnTime, enemySpawnSpeed);
	spawnEnemy();
}

function limitMovement(v, min, max) {
	if (v < min) {
		return min;
	} else if (v > max) {
		return max;
	} else {
		return v;
	}
}

function movePlayer() {
	if (LEFT) {
		player.x -= player.speed;
	}
	if (RIGHT) {
		player.x += player.speed;
	}
}

document.onkeydown = function(e) {
	if(e.keyCode == 37 || e.keyCode == 65) LEFT = true;
	if(e.keyCode == 39 || e.keyCode == 68) RIGHT = true;
}

document.onkeyup = function(e) {
	if(e.keyCode == 37 || e.keyCode == 65) LEFT = false;
	if(e.keyCode == 39 || e.keyCode == 68) RIGHT = false;
}

StartGameBtn.addEventListener('click', () => {
	StartGameBox.style.display = 'none';
	startGame();
	animate();
	playAudio('gameStart.wav');
})






