// Game constants
const BLOCK_SIZE = 32;
const MOVE_SPEED = 5;
const JUMP_POWER = 15;
const GRAVITY = 0.8;
const PARTICLE_COUNT = 50;
const PARTICLE_SIZE = 8;
const PARTICLE_SPEED_MIN = 1;
const PARTICLE_SPEED_MAX = 10;
const PARTICLE_GRAVITY = 0.4;
const NO_COLLISION_DURATION = 100; // ms

// DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const debugPanel = document.getElementById('debugPanel');
const gameOverPanel = document.getElementById('gameOver');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
let isGameOver = false;
let showPlayer = true;
let oldZDown = false;
let deathStartTime = 0;
let debugMode = true;
let doubleJumpEnabled = true;
let canDoubleJump = true;

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Restart game on R key press
    if (e.key === 'r' && isGameOver) {
        resetGame();
    }
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game objects
const player = {
    x: 50,
    y: 400,
    width: 32,
    height: 32,
    dx: 0,
    dy: 0,
    onGround: false
};

const deathParticles = [];

// Example stage setup (you'll need to adapt this to your game's needs)
const stage = {
    blocks: [
        // Bottom platform
        { x: 0, y: 0, kind: 1, collision: 0 },
        { x: 1, y: 0, kind: 1, collision: 0 },
        { x: 2, y: 0, kind: 1, collision: 0 },
        { x: 3, y: 0, kind: 1, collision: 0 },
        { x: 4, y: 0, kind: 1, collision: 0 },
        { x: 5, y: 0, kind: 1, collision: 0 },
        { x: 6, y: 0, kind: 1, collision: 0 },
        { x: 7, y: 0, kind: 1, collision: 0 },
        { x: 8, y: 0, kind: 1, collision: 0 },
        { x: 9, y: 0, kind: 1, collision: 0 },
        
        // Obstacle
        { x: 12, y: 1, kind: 4, collision: 0 },
        
        // Platform
        { x: 15, y: 3, kind: 1, collision: 0 },
        { x: 16, y: 3, kind: 1, collision: 0 },
        { x: 17, y: 3, kind: 1, collision: 0 }
    ]
};

// Reset game function
function resetGame() {
    isGameOver = false;
    showPlayer = true;
    player.x = 50;
    player.y = 400;
    player.dx = 0;
    player.dy = 0;
    deathParticles.length = 0;
    gameOverPanel.style.display = "none";
}
