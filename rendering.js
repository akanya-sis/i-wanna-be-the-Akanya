//-------------------------------------
// スプライトシートを用いたアニメーション
//-------------------------------------
// 32x32サイズのコマが横方向に6つ並んだ (192x32) のplayer.pngを使い
// フレームを切り替えながら描画するサンプルです。

// 1. 画像の読み込み
// 2. フレーム制御用の変数を増やす
// 3. draw() 内で frameIndex に応じてスプライトシートを切り出し

//-------------------------------------
// 画像・変数の定義
//-------------------------------------
const playerImage = new Image();
playerImage.src = "player.png";  // ← player.gif ではなく、192x32のスプライトシート
playerImage.onload = function() {
    console.log("Player sprite sheet loaded successfully");
};
playerImage.onerror = function() {
    console.error("Error loading player sprite sheet");
};

// スプライト1コマあたりの幅・高さ
const SPRITE_FRAME_WIDTH = 32;
const SPRITE_FRAME_HEIGHT = 32;

// フレーム数（横に6枚並んでいる想定）
const SPRITE_FRAME_COUNT = 6;

// アニメーション制御用カウンタ
// 今回はゲームループが呼ばれるたびにインクリメントして、一定速度でコマを進める
let playerAnimCounter = 0;

//-------------------------------------
// メインの描画処理 (スプライトシートによるアニメーション)
//-------------------------------------
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
        if (playerImage.complete && playerImage.naturalWidth !== 0) {
            // (A) スプライトシートがロード済みの場合

            // アニメーション用カウンタを進める
            // ここでは毎フレーム加算して、10フレームごとに次のコマへ
            // ※好みに応じて値を調整
            playerAnimCounter++;

            // 現在のコマを計算（0~5 をループ）
            // 例: Math.floor(playerAnimCounter / 10) で10フレームごとに1つ進む
            const frameIndex = Math.floor(playerAnimCounter / 10) % SPRITE_FRAME_COUNT;

            // スプライトシートの描画: drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
            const sx = frameIndex * SPRITE_FRAME_WIDTH; // 切り出すX座標
            const sy = 0;                               // 1行だけなのでYは常に0

            ctx.drawImage(
                playerImage,
                sx,         // スプライトシートからの切り出し開始X
                sy,         // スプライトシートからの切り出し開始Y
                SPRITE_FRAME_WIDTH,  // 切り出し幅
                SPRITE_FRAME_HEIGHT, // 切り出し高さ
                player.x,   // canvas上の描画先X
                player.y,   // canvas上の描画先Y
                player.width,  // 描画先幅（キャラの大きさに合わせる）
                player.height  // 描画先高さ
            );
        } else {
            // (B) スプライトシートがまだロードされていない場合
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

//-------------------------------------
// デバッグ情報描画
//-------------------------------------
function drawDebugInfo() {
    if (!debugMode) return;
    debugPanel.innerHTML = `
        x: ${player.x.toFixed(2)}<br>
        y: ${player.y.toFixed(2)}<br>
        dx: ${player.dx.toFixed(2)}<br>
        dy: ${player.dy.toFixed(2)}<br>
        onGround: ${player.onGround}<br>
        doubleJumpEnabled: ${doubleJumpEnabled}<br>
        canDoubleJump: ${canDoubleJump}<br>
        isGameOver: ${isGameOver}<br>
        oldZDown: ${oldZDown}
    `;
}
