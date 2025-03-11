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
    // 水平移動
    player.x += player.dx;

    // 当たり判定用の座標を計算
    const collisionX = player.x - player.collisionWidth;
    const collisionY = player.y - player.collisionHeight;

    for (const block of stage.blocks) {
        // (略) collision===2や1の考慮は同じ

        const bx = block.x * BLOCK_SIZE;
        const by = canvas.height - (block.y + 1) * BLOCK_SIZE;

        // プレイヤー当たり判定の位置/サイズで衝突検出
        if (checkCollision(
            collisionX, 
            collisionY, 
            player.collisionWidth, 
            player.collisionHeight,
            bx, 
            by, 
            BLOCK_SIZE
        )) {
            if (block.kind === 4) {
                triggerDeathEffect();
                return;
            }
            if (player.dx > 0) {
                player.x = bx - player.collisionWidth;
            } else if (player.dx < 0) {
                player.x = bx + BLOCK_SIZE;
            }
            player.dx = 0;
        }
    }

    // 垂直移動
    player.y += player.dy;
    player.onGround = false;
    const cX2 = player.x - player.collisionWidth;
    const cY2 = player.y + player.collisionHeight;

    for (const block of stage.blocks) {
        const bx = block.x * BLOCK_SIZE;
        const by = canvas.height - (block.y + 1) * BLOCK_SIZE;

        if (checkCollision(
            cX2, 
            cY2, 
            player.collisionWidth, 
            player.collisionHeight,
            bx, 
            by,
            BLOCK_SIZE
        )) {
            if (block.kind === 4) {
                triggerDeathEffect();
                return;
            }

            if (block.collision === 1 && player.dy < 0) {
                continue;
            }

            if (player.dy > 0) {
                player.y = by - player.collisionHeight;
                player.dy = 0;
                player.onGround = true;
                canDoubleJump = true;
            } else if (player.dy < 0) {
                player.y = by + BLOCK_SIZE;
                player.dy = 0;
            }
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
