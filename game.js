// Game constants
const BLOCK_SIZE = 16;
const MOVE_SPEED = 5;
const JUMP_POWER = 15;
const GRAVITY = 0.8;
const PARTICLE_COUNT = 200;
const PARTICLE_SIZE = 3;
const PARTICLE_SPEED_MIN = -20;
const PARTICLE_SPEED_MAX = 20;
const PARTICLE_GRAVITY = 0.4;
const NO_COLLISION_DURATION = 100; // ms

// DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const debugPanel = document.getElementById('debugPanel');
const gameOverPanel = document.getElementById('gameOver');
const gameOverSound = new Audio("GameOver.mp3");

// Set canvas size
canvas.width = 1024;
canvas.height = 576;

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
    if (e.key === 'r') {
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
    onGround: false,
    collisionWidth: 16,
    collisionHeight: 16
};

const deathParticles = [];

// Example stage setup (you'll need to adapt this to your game's needs)
const stage = {
    blocks: [
        //左壁
        {kind:1,x:1,y:1,collision:0},
        {kind:1,x:1,y:2,collision:0},
        {kind:1,x:1,y:3,collision:0},
        {kind:1,x:1,y:4,collision:0},
        {kind:1,x:1,y:5,collision:0},
        {kind:1,x:1,y:6,collision:0},
        {kind:1,x:1,y:7,collision:0},
        {kind:1,x:1,y:8,collision:0},
        {kind:1,x:1,y:9,collision:0},
        {kind:1,x:1,y:10,collision:0},
        {kind:1,x:1,y:11,collision:0},
        {kind:1,x:1,y:12,collision:0},
        {kind:1,x:1,y:13,collision:0},
        {kind:1,x:1,y:14,collision:0},
        {kind:1,x:1,y:15,collision:0},
        {kind:1,x:1,y:16,collision:0},
        {kind:1,x:1,y:17,collision:0},
        {kind:1,x:1,y:18,collision:0},
        {kind:1,x:1,y:19,collision:0},
        {kind:1,x:1,y:20,collision:0},
        {kind:1,x:1,y:21,collision:0},
        {kind:1,x:1,y:22,collision:0},
        {kind:1,x:1,y:23,collision:0},
        {kind:1,x:1,y:24,collision:0},
        {kind:1,x:1,y:25,collision:0},
        {kind:1,x:1,y:26,collision:0},
        {kind:1,x:1,y:27,collision:0},
        {kind:1,x:1,y:28,collision:0},
        {kind:1,x:1,y:29,collision:0},
        {kind:1,x:1,y:30,collision:0},
        {kind:1,x:1,y:31,collision:0},
        {kind:1,x:1,y:32,collision:0},
        {kind:1,x:1,y:33,collision:0},
        {kind:1,x:1,y:34,collision:0},
        {kind:1,x:1,y:35,collision:0},
        {kind:1,x:1,y:36,collision:0},
        {kind:1,x:1,y:37,collision:0},
        {kind:1,x:1,y:38,collision:0},
        {kind:1,x:1,y:39,collision:0},
        {kind:1,x:1,y:40,collision:0},
        
        //右壁
        {kind:1,x:63,y:1,collision:0},
        {kind:1,x:63,y:2,collision:0},
        {kind:1,x:63,y:3,collision:0},
        {kind:1,x:63,y:4,collision:0},
        {kind:1,x:63,y:5,collision:0},
        {kind:1,x:63,y:6,collision:0},
        {kind:1,x:63,y:7,collision:0},
        {kind:1,x:63,y:8,collision:0},
        {kind:1,x:63,y:9,collision:0},
        {kind:1,x:63,y:10,collision:0},
        {kind:1,x:63,y:11,collision:0},
        {kind:1,x:63,y:12,collision:0},
        {kind:1,x:63,y:13,collision:0},
        {kind:1,x:63,y:14,collision:0},
        {kind:1,x:63,y:15,collision:0},
        {kind:1,x:63,y:16,collision:0},
        {kind:1,x:63,y:17,collision:0},
        {kind:1,x:63,y:18,collision:0},
        {kind:1,x:63,y:19,collision:0},
        {kind:1,x:63,y:20,collision:0},
        {kind:1,x:63,y:21,collision:0},
        {kind:1,x:63,y:22,collision:0},
        {kind:1,x:63,y:23,collision:0},
        {kind:1,x:63,y:24,collision:0},
        {kind:1,x:63,y:25,collision:0},
        {kind:1,x:63,y:26,collision:0},
        {kind:1,x:63,y:27,collision:0},
        {kind:1,x:63,y:28,collision:0},
        {kind:1,x:63,y:29,collision:0},
        {kind:1,x:63,y:30,collision:0},
        {kind:1,x:63,y:31,collision:0},
        {kind:1,x:63,y:32,collision:0},
        {kind:1,x:63,y:33,collision:0},
        {kind:1,x:63,y:34,collision:0},
        {kind:1,x:63,y:35,collision:0},
        {kind:1,x:63,y:36,collision:0},
        {kind:1,x:63,y:37,collision:0},
        {kind:1,x:63,y:38,collision:0},
        {kind:1,x:63,y:39,collision:0},
        {kind:1,x:63,y:40,collision:0},

        // ステージ
        {kind:1,x:0,y:0,collision:0},
        {kind:1,x:1,y:0,collision:0},
        {kind:1,x:2,y:0,collision:0},
        {kind:1,x:3,y:0,collision:0},
        {kind:1,x:4,y:0,collision:0},
        {kind:1,x:5,y:0,collision:0},
        {kind:1,x:6,y:0,collision:0},
        {kind:1,x:7,y:0,collision:0},
        {kind:1,x:8,y:0,collision:0},
        {kind:1,x:9,y:0,collision:0},
        {kind:1,x:10,y:0,collision:0},
        {kind:1,x:10,y:1,collision:0},
        {kind:1,x:10,y:2,collision:0},
        {kind:1,x:10,y:3,collision:0},
        {kind:1,x:11,y:3,collision:0},
        {kind:1,x:12,y:3,collision:0},
        {kind:1,x:13,y:3,collision:0},
        {kind:1,x:14,y:3,collision:0},
        {kind:1,x:15,y:3,collision:0},
        {kind:1,x:15,y:3,collision:0},
        {kind:1,x:16,y:3,collision:0},
        {kind:1,x:17,y:3,collision:0},
        {kind:1,x:18,y:3,collision:0},
        {kind:1,x:19,y:3,collision:0},
        {kind:2,x:15,y:6,collision:1},
        {kind:2,x:16,y:6,collision:1},
        {kind:2,x:17,y:6,collision:1},
        {kind:2,x:18,y:6,collision:1},
        {kind:2,x:19,y:6,collision:1},
        {kind:3,x:15,y:4,collision:2},
        {kind:3,x:16,y:4,collision:2},
        {kind:3,x:17,y:4,collision:2},
        {kind:3,x:18,y:4,collision:2},
        {kind:3,x:19,y:4,collision:2},
        // 即死ブロック
        {kind:4,x:20,y:0,collision:0},
        {kind:4,x:21,y:0,collision:0},
        {kind:4,x:22,y:0,collision:0},
        {kind:4,x:23,y:0,collision:0},
        {kind:4,x:24,y:0,collision:0},
        {kind:4,x:25,y:0,collision:0},
        {kind:4,x:26,y:0,collision:0},
        {kind:4,x:27,y:0,collision:0},
        {kind:4,x:28,y:0,collision:0},
        {kind:4,x:29,y:0,collision:0},
        {kind:4,x:30,y:0,collision:0},
        {kind:4,x:31,y:0,collision:0},
        {kind:1,x:32,y:0,collision:0},
        {kind:1,x:33,y:0,collision:0},
        {kind:1,x:34,y:0,collision:0},
        {kind:1,x:35,y:0,collision:0},
        {kind:1,x:36,y:0,collision:0},
        {kind:1,x:37,y:0,collision:0},
        {kind:1,x:38,y:0,collision:0},
        {kind:1,x:39,y:0,collision:0},
        {kind:1,x:40,y:0,collision:0},
        {kind:1,x:41,y:0,collision:0},
        {kind:1,x:42,y:0,collision:0},
        {kind:1,x:43,y:0,collision:0},
        {kind:1,x:44,y:1,collision:0},
        {kind:1,x:45,y:2,collision:0},
        {kind:1,x:46,y:3,collision:0},
        {kind:1,x:47,y:4,collision:0},
        {kind:1,x:48,y:4,collision:0},
        {kind:1,x:49,y:4,collision:0},
        {kind:1,x:50,y:4,collision:0},
        {kind:1,x:51,y:4,collision:0},
        {kind:1,x:52,y:4,collision:0},
        {kind:1,x:53,y:4,collision:0},
        {kind:1,x:54,y:4,collision:0},
        {kind:1,x:55,y:4,collision:0},
        {kind:1,x:56,y:4,collision:0},
        {kind:1,x:57,y:4,collision:0},
        {kind:1,x:58,y:4,collision:0},
        {kind:1,x:59,y:4,collision:0},
        {kind:1,x:60,y:4,collision:0},
        {kind:1,x:61,y:4,collision:0},
        {kind:1,x:62,y:4,collision:0},
        {kind:14,x:62,y:6,collision:14},
        {kind:14,x:62,y:7,collision:14},
        {kind:14,x:62,y:8,collision:14},
        {kind:14,x:62,y:9,collision:14},
        {kind:14,x:62,y:10,collision:14},
        {kind:14,x:62,y:11,collision:14},
        {kind:14,x:62,y:12,collision:14},
        {kind:14,x:62,y:13,collision:14},
        {kind:1,x:62,y:14,collision:0},
        {kind:1,x:63,y:14,collision:0},
        {kind:1,x:62,y:14,collision:0},
        {kind:1,x:61,y:14,collision:0},
        {kind:1,x:60,y:14,collision:0},
        {kind:1,x:59,y:14,collision:0},
        {kind:1,x:58,y:14,collision:0},
        {kind:1,x:57,y:14,collision:0},
        {kind:1,x:56,y:14,collision:0},
        {kind:1,x:55,y:14,collision:0},
        {kind:1,x:54,y:14,collision:0},
        {kind:1,x:53,y:14,collision:0},
        {kind:1,x:52,y:14,collision:0},
        {kind:1,x:51,y:14,collision:0},
        {kind:1,x:50,y:14,collision:0},
        {kind:1,x:49,y:14,collision:0},
        {kind:1,x:48,y:14,collision:0},
        {kind:1,x:47,y:14,collision:0},
        {kind:1,x:46,y:14,collision:0},
        {kind:1,x:45,y:14,collision:0},
        {kind:1,x:44,y:14,collision:0},
        {kind:1,x:43,y:14,collision:0},
        {kind:1,x:42,y:14,collision:0},
        {kind:1,x:41,y:14,collision:0},
        {kind:1,x:40,y:14,collision:0},
    ]
};

// Reset game function
function resetGame() {
    isGameOver = false;
    showPlayer = true;
    player.x = 50;
    player.y = 100;
    player.dx = 0;
    player.dy = 0;
    deathParticles.length = 0;
    gameOverPanel.style.display = "none";
    gameOverSound.pause();
    gameOverSound.currentTime = 0;
}
