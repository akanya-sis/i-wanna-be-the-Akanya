//
// 当たり判定用の矩形を取得
//
function getCollisionRect(player) {
    const offsetX = (player.width - player.collisionWidth) / 2;
    const offsetY = (player.height - player.collisionHeight);
    return {
        x: player.x + offsetX,
        y: player.y + offsetY,
        w: player.collisionWidth,
        h: player.collisionHeight
    };
}

//
// 当たり判定用矩形からプレイヤーの座標に反映
//
function setCollisionRect(player, rect) {
    const offsetX = (player.width - player.collisionWidth) / 2;
    const offsetY = (player.height - player.collisionHeight);
    // rect.x, rect.y は「衝突判定用矩形」の左上の座標
    player.x = rect.x - offsetX;
    player.y = rect.y - offsetY;
}

//
// AABB collision check (旧: 矩形同士の衝突判定用)
//  px, py, pw, ph : AABB1 (左上x, 左上y, 幅, 高さ)
//  bx, by, bs     : AABB2 (左上x, 左上y, 幅=bs, 高さ=bs)
//
function checkCollision(px, py, pw, ph, bx, by, bs) {
    return (
        px < bx + bs &&
        px + pw > bx &&
        py < by + bs &&
        py + ph > by
    );
}

//
// [追加] 円 vs 矩形の衝突判定
//   ※ 今回も残しておくが通常ブロックにはAABBを使用
//
function circleRectCollision(cx, cy, r, rx, ry, rw, rh) {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const distX = cx - closestX;
    const distY = cy - closestY;
    return (distX * distX + distY * distY) < (r * r);
}

//
// [追加] 線分と点の距離^2 (円 vs 三角形 の補助)
//
function pointLineSegmentDistSq(px, py, x1, y1, x2, y2) {
    const vx = x2 - x1;
    const vy = y2 - y1;
    const lenSq = vx*vx + vy*vy;
    let t = ((px - x1) * vx + (py - y1) * vy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const nx = x1 + vx * t;
    const ny = y1 + vy * t;
    const dx = px - nx;
    const dy = py - ny;
    return dx*dx + dy*dy;
}

//
// [追加] 三角形(A,B,C)の面積
//
function triArea(ax, ay, bx, by, cx, cy) {
    return Math.abs((ax*(by-cy) + bx*(cy-ay) + cx*(ay-by)) / 2);
}

//
// [追加] 点(px, py)が三角形ABC内にあるかどうか
//
function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
    const area  = triArea(ax, ay, bx, by, cx, cy);
    const area1 = triArea(px, py, bx, by, cx, cy);
    const area2 = triArea(ax, ay, px, py, cx, cy);
    const area3 = triArea(ax, ay, bx, by, px, py);
    return Math.abs(area - (area1 + area2 + area3)) < 0.0001;
}

//
// [追加] 円 vs 三角形の衝突判定
//
function circleTriangleCollision(cx, cy, r, tri) {
    const [A, B, C] = tri;
    const Ax = A[0], Ay = A[1];
    const Bx = B[0], By = B[1];
    const Cx = C[0], Cy = C[1];

    const rSq = r * r;

    // 各辺との距離チェック
    let distSq = pointLineSegmentDistSq(cx, cy, Ax, Ay, Bx, By);
    if (distSq < rSq) return true;
    distSq = pointLineSegmentDistSq(cx, cy, Bx, By, Cx, Cy);
    if (distSq < rSq) return true;
    distSq = pointLineSegmentDistSq(cx, cy, Cx, Cy, Ax, Ay);
    if (distSq < rSq) return true;

    // 中心が三角形内部の場合
    if (pointInTriangle(cx, cy, Ax, Ay, Bx, By, Cx, Cy)) {
        return true;
    }
    return false;
}

//
// [追加] 底辺16px,高さ16pxの三角形頂点を取得
// collision==11:△ (上), 12:▷ (右), 13:▽ (下), 14:◁ (左)
//
function getTriangleVertices(bx, by, collision) {
    switch(collision) {
        case 11: // △ (上向き)
            return [
                [bx,     by+16],
                [bx+16,  by+16],
                [bx+8,   by]
            ];
        case 12: // ▷ (右向き)
            return [
                [bx,     by],
                [bx,     by+16],
                [bx+16,  by+8]
            ];
        case 13: // ▽ (下向き)
            return [
                [bx,     by],
                [bx+16,  by],
                [bx+8,   by+16]
            ];
        case 14: // ◁ (左向き)
            return [
                [bx+16,  by],
                [bx+16,  by+16],
                [bx,     by+8]
            ];
    }
    return [];
}

//
// プレイヤー vs ブロックの衝突処理
//   (通常ブロックは 2r×2r のAABBで判定, 三角形だけは 円vs三角形 で判定)
//
function handleCollisions() {
    // (1) 水平移動
    player.x += player.dx;

    // 衝突判定用AABBの左上座標(px, py)と幅、高さ(16×16)
    let px = (player.x + player.width / 2) - 8;
    let py = (player.y + player.height / 2) - 8;
    const pw = 16;
    const ph = 16;

    // 円の中心 (AABBの真ん中)
    let cx = px + 8;
    let cy = py + 8;
    const r = 8;

    for (const block of stage.blocks) {
        if (block.collision === 2) continue;  // すり抜け等

        const bx = block.x * BLOCK_SIZE;
        const by = canvas.height - (block.y + 1) * BLOCK_SIZE;

        // 三角形オブジェクトの場合は円 vs 三角形
        if (
            block.collision === 11 ||
            block.collision === 12 ||
            block.collision === 13 ||
            block.collision === 14
        ) {
            const tri = getTriangleVertices(bx, by, block.collision);
            if (circleTriangleCollision(cx, cy, r, tri)) {
                // 即死ブロックかどうか
                if (block.kind === 4) {
                    triggerDeathEffect();
                    return;
                }
                // 他の三角形もスパイク扱いなら即死
                triggerDeathEffect();
                return;
            }
        } else {
            // 通常ブロックはAABB同士の衝突チェック
            if (checkCollision(px, py, pw, ph, bx, by, BLOCK_SIZE)) {
                if (block.kind === 4) {
                    triggerDeathEffect();
                    return;
                }
                // 横押し戻し
                if (player.dx > 0) {
                    px = bx - pw; 
                } else if (player.dx < 0) {
                    px = bx + BLOCK_SIZE;
                }
                player.dx = 0;
                // AABB座標からplayerへ反映
                player.x = px + 8 - (player.width / 2);
                player.y = py + 8 - (player.height / 2);
            }
        }
    }

    // (2) 垂直移動
    player.y += player.dy;
    player.onGround = false;

    // AABB座標再計算
    let px2 = (player.x + player.width / 2) - 8;
    let py2 = (player.y + player.height / 2) - 8;
    cx = px2 + 8;
    cy = py2 + 8;

    for (const block of stage.blocks) {
        if (block.collision === 2) continue;

        const bx = block.x * BLOCK_SIZE;
        const by = canvas.height - (block.y + 1) * BLOCK_SIZE;

        if (
            block.collision === 11 ||
            block.collision === 12 ||
            block.collision === 13 ||
            block.collision === 14
        ) {
            // 三角形 => 円 vs 三角形
            const tri = getTriangleVertices(bx, by, block.collision);
            if (circleTriangleCollision(cx, cy, r, tri)) {
                if (block.kind === 4) {
                    triggerDeathEffect();
                    return;
                }
                triggerDeathEffect();
                return;
            }
        } else {
            // 通常ブロック => AABB
            if (checkCollision(px2, py2, pw, ph, bx, by, BLOCK_SIZE)) {
                if (block.kind === 4) {
                    triggerDeathEffect();
                    return;
                }
                // collision==1 (上のみ衝突) => 下からのジャンプ時はすり抜け
                if (block.collision === 1 && player.dy < 0) {
                    continue;
                }
                // 縦押し戻し
                if (player.dy > 0) {
                    py2 = by - ph; 
                    player.dy = 0;
                    player.onGround = true;
                    canDoubleJump = true;
                } else if (player.dy < 0) {
                    py2 = by + BLOCK_SIZE;
                    player.dy = 0;
                }
                // AABB座標からplayerへ反映
                player.x = px2 + 8 - (player.width / 2);
                player.y = py2 + 8 - (player.height / 2);
            }
        }
    }
}

//
// パーティクルの衝突処理はそのまま
//
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

//
// パーティクル同士の衝突処理はそのまま
//
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
