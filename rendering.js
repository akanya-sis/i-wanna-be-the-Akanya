let playerGif;
gifler('player.gif').get((anim) => {
    playerGif = anim;
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Blocks
    stage.blocks.forEach((block) => {
        ctx.fillStyle =
            block.kind === 1 ? "brown" :
            block.kind === 2 ? "blue" :
            block.kind === 3 ? "green" :
            block.kind === 4 ? "yellow" : "gray";
        const bx = block.x * BLOCK_SIZE;
        const by = canvas.height - (block.y + 1) * BLOCK_SIZE;
        ctx.fillRect(bx, by, BLOCK_SIZE, BLOCK_SIZE);
    });

    // Player
    if (showPlayer) {
        if (playerGif) {
            playerGif.onDrawFrame = function(ctx, frame) {
                ctx.drawImage(frame.buffer, player.x, player.y, player.width, player.height);
            };
            playerGif.animateInCanvas(canvas);
        } else {
            ctx.fillStyle = "red";
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }
    }

    // Particles
    ctx.fillStyle = "red";
    for (const p of deathParticles) {
        ctx.fillRect(p.x, p.y, p.width, p.height);
    }
}

function drawDebugInfo() {
    if (!debugMode) return;
    debugPanel.innerHTML =
        `x: ${player.x.toFixed(2)}<br>` +
        `y: ${player.y.toFixed(2)}<br>` +
        `dx: ${player.dx.toFixed(2)}<br>` +
        `dy: ${player.dy.toFixed(2)}<br>` +
        `onGround: ${player.onGround}<br>` +
        `doubleJumpEnabled: ${doubleJumpEnabled}<br>` +
        `canDoubleJump: ${canDoubleJump}<br>` +
        `isGameOver: ${isGameOver}<br>` +
        `oldZDown: ${oldZDown}`;
}
