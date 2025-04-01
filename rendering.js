//-------------------------------------
// 画像の読み込み & 初期化
//-------------------------------------
const playerImage = new Image();
playerImage.src = "player.png";  // 192×64のスプライトシート (横6, 縦2)
playerImage.onload = function() {
    console.log("Player sprite sheet loaded successfully");
};
playerImage.onerror = function() {
    console.error("Error loading player sprite sheet");
};

// スプライト1コマあたりの幅・高さ
const SPRITE_FRAME_WIDTH = 32;
const SPRITE_FRAME_HEIGHT = 32;

// フレーム数 (横に6コマ)
const SPRITE_FRAME_COUNT = 6;

// アニメーション制御用カウンタ
// 毎フレーム加算し、一定周期ごとにフレームを進める
let playerAnimCounter = 0;

//-------------------------------------
// メイン描画処理
//-------------------------------------
function draw() {
    // キャンバスクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ブロック描画 (サンプル)
    stage.blocks.forEach((block) => {
        const bx = block.x * BLOCK_SIZE;
        const by = canvas.height - (block.y + 1) * BLOCK_SIZE;
    
        if (block.kind === 11) {
            // 上三角形 (△)
            ctx.fillStyle = "gray";
            ctx.beginPath();
            ctx.moveTo(bx,     by+16);
            ctx.lineTo(bx+16, by+16);
            ctx.lineTo(bx+8,  by);
            ctx.closePath();
            ctx.fill();
        } else if (block.kind === 12) {
            // 右三角形 (▷)
            ctx.fillStyle = "gray";
            ctx.beginPath();
            ctx.moveTo(bx,     by);
            ctx.lineTo(bx,     by+16);
            ctx.lineTo(bx+16,  by+8);
            ctx.closePath();
            ctx.fill();
        } else if (block.kind === 13) {
            // 下三角形 (▽)
            ctx.fillStyle = "gray";
            ctx.beginPath();
            ctx.moveTo(bx,     by);
            ctx.lineTo(bx+16,  by);
            ctx.lineTo(bx+8,   by+16);
            ctx.closePath();
            ctx.fill();
        } else if (block.kind === 14) {
            // 左三角形 (◁)
            ctx.fillStyle = "gray";
            ctx.beginPath();
            ctx.moveTo(bx+16,  by);
            ctx.lineTo(bx+16,  by+16);
            ctx.lineTo(bx,     by+8);
            ctx.closePath();
            ctx.fill();
        } else {
            // それ以外 (従来の矩形描画)
            ctx.fillStyle =
                block.kind === 1 ? "brown" :
                block.kind === 2 ? "blue" :
                block.kind === 3 ? "green" :
                block.kind === 4 ? "yellow" : "gray";
            ctx.fillRect(bx, by, BLOCK_SIZE, BLOCK_SIZE);
        }
    });


    // プレイヤー
    if (showPlayer) {
        // スプライトシートがロード済みか確認
        if (playerImage.complete && playerImage.naturalWidth !== 0) {
            // アニメーションカウンタを進める
            playerAnimCounter++;

            // 速度に応じて frameIndex を計算 (10フレームに1回コマ送り)
            const frameIndex = Math.floor(playerAnimCounter / 10) % SPRITE_FRAME_COUNT;

            // (1) 上段: idle, (2) 下段: 移動
            // dxが0なら idle、そうでなければ移動アニメ
            const isMoving = (player.dx !== 0);
            const rowIndex = isMoving ? 1 : 0;  // 0=上段, 1=下段

            // スプライトシート上の切り出し座標
            const sx = frameIndex * SPRITE_FRAME_WIDTH;
            const sy = rowIndex * SPRITE_FRAME_HEIGHT;

            // 左向き or 右向きの判定
            // 画像は左向きなので、右向き移動時は反転描画

            ctx.save(); // コンテキスト状態を保存
            if (player.facingLeft) {
                // 左向きに反転
                ctx.translate(player.x + player.width, player.y + 1);
                ctx.scale(-1, 1);

                // 反転した座標系で描画先 (0,0) に描画
                ctx.drawImage(
                    playerImage,
                    sx, sy,
                    SPRITE_FRAME_WIDTH,
                    SPRITE_FRAME_HEIGHT,
                    0, 0,
                    player.width,
                    player.height
                );
            } else {
                // 右向きのまま描画
                ctx.drawImage(
                    playerImage,
                    sx, sy,
                    SPRITE_FRAME_WIDTH,
                    SPRITE_FRAME_HEIGHT,
                    player.x,
                    player.y + 1,
                    player.width,
                    player.height
                );
            }
            ctx.restore(); // コンテキスト状態を元に戻す

        } else {
            // スプライトシートがまだロードされていない場合
            ctx.fillStyle = "red";
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }

        // [追加] デバッグモード時だけ、プレイヤーの円形当たり判定(足元側)を描画
/*        if (debugMode) {
            // 「足元寄り」に配置された中心
            const cx = player.x + player.width / 2;
            const cy = player.y + player.height - 8;
            const r = 8;

            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
*/
    }

    // パーティクル
    ctx.fillStyle = "red";
    for (const p of deathParticles) {
        ctx.fillRect(p.x, p.y, p.width, p.height);
    }
}

//-------------------------------------
// デバッグ情報
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
