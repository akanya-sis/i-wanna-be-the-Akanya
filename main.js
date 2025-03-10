function triggerDeathEffect() {
    isGameOver = true;
    showPlayer = false;
    gameOverPanel.style.display = "block";
    gameOverSound.play();
    deathStartTime = performance.now();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (PARTICLE_SPEED_MAX - PARTICLE_SPEED_MIN) + PARTICLE_SPEED_MIN;
        const vx = speed * Math.cos(angle);
        const vy = speed * Math.sin(angle);
        deathParticles.push({
            x: player.x + player.width / 2,
            y: player.y - player.height / 2,
            width: PARTICLE_SIZE,
            height: PARTICLE_SIZE,
            dx: vx,
            dy: vy,
        });
    }
}

function updateParticles() {
    for (const p of deathParticles) {
        p.dy += PARTICLE_GRAVITY;
        handleParticleCollisions(p);
    }
    // 0.1秒経過でパーティクル同士の衝突開始
    if (performance.now() - deathStartTime > NO_COLLISION_DURATION) {
        handleParticleInterCollision();
    }
}

function fixedUpdate() {
    if (isGameOver) {
        updateParticles();
        return;
    }

    // 横移動
    if (keys["ArrowLeft"]) {
        player.dx = -MOVE_SPEED;
        player.facingRight = false;
    } else if (keys["ArrowRight"]) {
        player.dx = MOVE_SPEED;
        player.facingRight = true;
    } else {
       player.dx = 0;
    }
    // ジャンプ
    if (player.onGround && keys['z']) {
        player.dy = -JUMP_POWER;
        player.onGround = false;
        canDoubleJump = true;
    } else if (!player.onGround && !oldZDown && keys['z'] && doubleJumpEnabled && canDoubleJump) {
        player.dy = -JUMP_POWER;
        canDoubleJump = false;
    }

    // 重力
    player.dy += GRAVITY;

    handleCollisions();
    oldZDown = keys['z'] || false;
}

// Fixed timestep
let lastTime = 0;
let accumulator = 0;
const STEP = 1/60;

function gameLoop(timestamp) {
    let delta = (timestamp - lastTime) / 1000;
    if (delta > 0.1) delta = 0.1;
    lastTime = timestamp;

    accumulator += delta;
    while (accumulator >= STEP) {
        fixedUpdate();
        accumulator -= STEP;
    }

    draw();
    drawDebugInfo();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
