const playerImage = new Image();
playerImage.src = "player.gif";
playerImage.onload = function() {
    console.log("Player image loaded successfully");
};
playerImage.onerror = function() {
    console.error("Error loading player image");
};

// giflerアニメーション用フレームを保持する変数
let playerGifFrame = null;

// giflerを使ってGIFを読み込み、アニメーションを開始
// ただし、ゲームループでのdraw()呼び出しと統合するため
// animateInCanvas()は使わず、フレームデータだけ取得する

gifler('player.gif').get((anim) => {
    anim.onDrawFrame = (ctx, frame) => {
        // フレームを更新
        playerGifFrame = frame;
    };
    // gifler独自のループは走るが、canvasには直接描画せず
    // フレーム更新のみ行う
    anim.animate();
});

function draw() {
    // メインcanvasをクリア
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
        // GIFフレームが取得できていれば、それを描画
        if (playerGifFrame) {
            ctx.drawImage(
                playerGifFrame.buffer,
                player.x,
                player.y,
                player.width,
                player.height
            );
        } else {
            // フレームがまだない場合のフォールバック
            // もしくはplayerImageが使えるなら
            if (playerImage.complete && playerImage.naturalWidth !== 0) {
                ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
            } else {
                // 静止画もまだなら、赤い四角で代用
                ctx.fillStyle = "red";
                ctx.fillRect(player.x, player.y, player.width, player.height);
            }
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
