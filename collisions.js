// 当たり判定用の矩形を取得
function getCollisionRect(player) {
    const offsetX = (player.width - player.collisionWidth) / 2;
    const offsetY = (player.height - player.collisionHeight) - 5;
    return {
        x: player.x + offsetX,
        y: player.y + offsetY,
        w: player.collisionWidth,
        h: player.collisionHeight
    };
}

// 当たり判定用矩形からプレイヤーの座標に反映
function setCollisionRect(player, rect) {
    const offsetX = (player.width - player.collisionWidth) / 2;
    const offsetY = (player.height - player.collisionHeight);
    // rect.x, rect.y は「衝突判定用矩形」の左上の座標
    player.x = rect.x - offsetX;
    player.y = rect.y - offsetY;
}

// AABB collision check
function checkCollision(px, py, pw, ph, bx, by, bs) {
    return (
        px < bx + bs &&
        px + pw > bx &&
        py < by + bs &&
        py + ph > by
    );
}

function handleCollisions() {
    //========== 水平移動 ==========//
    player.x += player.dx;

    // 衝突判定用の矩形を取得
    let cRect = getCollisionRect(player);

    for (const block of stage.blocks) {
        if (block.collision === 2) continue;  // すり抜け等の場合

        const bx = block.x * BLOCK_SIZE;
        const by = canvas.height - (block.y + 1) * BLOCK_SIZE;

        // cRect でチェック (width/h は小さい衝突判定サイズ)
        if (checkCollision(cRect.x, cRect.y, cRect.w, cRect.h, bx, by, BLOCK_SIZE)) {
            // 例えばブロックが「即死トラップ (kind===4)」なら処理
            if (block.kind === 4) {
                triggerDeathEffect();
                return;
            }
            // block.collision===1 (上のみ) は横から衝突しないなどの条件は省略

            // どちらの方向から衝突したか
            if (player.dx > 0) {
                // 右へ進んでブロックに衝突した場合
                //  → 「衝突判定ボックスの右端 = ブロックの左端」
                cRect.x = bx - cRect.w;
            } else if (player.dx < 0) {
                // 左へ進んで衝突
                //  → 「衝突判定ボックスの左端 = ブロックの右端」
                cRect.x = bx + BLOCK_SIZE;
            }

            // cRect を補正したので、player座標へ反映
            setCollisionRect(player, cRect);

            // 衝突したので速度をゼロに (滑らない場合)
            player.dx = 0;
        }
    }

    //========== 垂直移動 ==========//
    player.y += player.dy;
    player.onGround = false;

    // 再取得 (player.x, player.y が更新された可能性があるので)
    cRect = getCollisionRect(player);

    for (const block of stage.blocks) {
        if (block.collision === 2) continue;

        const bx = block.x * BLOCK_SIZE;
        const by = canvas.height - (block.y + 1) * BLOCK_SIZE;

        if (checkCollision(cRect.x, cRect.y, cRect.w, cRect.h, bx, by, BLOCK_SIZE)) {
            if (block.kind === 4) {
                triggerDeathEffect();
                return;
            }

            // block.collision===1 (上のみ衝突) なら、下からぶつかるときのみ有効
            if (block.collision === 1 && player.dy < 0) {
                // 上向きジャンプ時は貫通させるなら continue
                continue;
            }

            // 衝突方向によって cRect を補正
            if (player.dy > 0) {
                // 下向き(＝上から着地)
                //  → 「cRect の下端 = ブロックの上端」
                cRect.y = by - cRect.h;
                player.dy = 0;
                player.onGround = true;
                canDoubleJump = true;  // 二段ジャンプ解除など
            } else if (player.dy < 0) {
                // 上向き(＝天井に頭をぶつけた)
                //  → 「cRect の上端 = ブロックの下端」
                cRect.y = by + BLOCK_SIZE;
                player.dy = 0;
            }

            // cRect を補正後、プレイヤーに反映
            setCollisionRect(player, cRect);
        }
    }
}

function handleParticleCollisions(p) {
    // 水平
    p.x += p.dx;
    for (const block of stage.blocks) {
        if (block.collision === 2) continue;
        if (block.collision === 1) continue;

        const bx = block.x * BLOCK_SIZE;
        const by = canvas.height - (block.y + 1) * BLOCK_SIZE;
        if (checkCollision(p.x, p.y, p.width, p.height, bx, by, BLOCK_SIZE)) {
            if (p.dx > 0) {
                p.x = bx - p.width;
            } else if (p.dx < 0) {
                p.x = bx + BLOCK_SIZE;
            }
            p.dx = 0;
        }
    }

    // 垂直
    p.y += p.dy;
    let onBlock = false;
    for (const block of stage.blocks) {
        if (block.collision === 2) continue;
        const bx = block.x * BLOCK_SIZE;
        const by = canvas.height - (block.y + 1) * BLOCK_SIZE;
        if (checkCollision(p.x, p.y, p.width, p.height, bx, by, BLOCK_SIZE)) {
            if (block.collision === 1 && p.dy < 0) {
                continue;
            }
            if (p.dy > 0) {
                p.y = by - p.height;
                p.dy = 0;
                onBlock = true;
            } else if (p.dy < 0) {
                p.y = by + BLOCK_SIZE;
                p.dy = 0;
            }
        }
    }
    if (onBlock) {
        p.dx *= 0.8;
    }
}

function handleParticleInterCollision() {
    for (let i = 0; i < deathParticles.length; i++) {
        for (let j = i + 1; j < deathParticles.length; j++) {
            const p1 = deathParticles[i];
            const p2 = deathParticles[j];
            if (
                p1.x < p2.x + p2.width &&
                p1.x + p1.width > p2.x &&
                p1.y < p2.y + p2.height &&
                p1.y + p1.height > p2.y
            ) {
                const overlapX = (p1.x < p2.x)
                    ? (p1.x + p1.width - p2.x)
                    : (p2.x + p2.width - p1.x);
                const overlapY = (p1.y < p2.y)
                    ? (p1.y + p1.height - p2.y)
                    : (p2.y + p2.height - p1.y);

                if (overlapX < overlapY) {
                    if (p1.x < p2.x) {
                        p1.x -= overlapX / 2;
                        p2.x += overlapX / 2;
                    } else {
                        p1.x += overlapX / 2;
                        p2.x -= overlapX / 2;
                    }
                    [p1.dx, p2.dx] = [ -p1.dx * 0.5, -p2.dx * 0.5 ];
                } else {
                    if (p1.y < p2.y) {
                        p1.y -= overlapY / 2;
                        p2.y += overlapY / 2;
                    } else {
                        p1.y += overlapY / 2;
                        p2.y -= overlapY / 2;
                    }
                    [p1.dy, p2.dy] = [ -p1.dy * 0.5, -p2.dy * 0.5 ];
                }
            }
        }
    }
}
