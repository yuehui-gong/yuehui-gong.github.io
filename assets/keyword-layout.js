/* A stable, loose layout for the focused keyword constellation. */
(function () {
  'use strict';

  function number(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }

  function hash(text) {
    let value = 2166136261;
    for (let i = 0; i < text.length; i++) {
      value ^= text.charCodeAt(i);
      value = Math.imul(value, 16777619);
    }
    return value >>> 0;
  }

  function randomFrom(seed) {
    return function () {
      seed += 0x6D2B79F5;
      let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
      value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  function overlap(a, b) {
    const x = (a.width + b.width) / 2 - Math.abs(a.x - b.x);
    const y = (a.height + b.height) / 2 - Math.abs(a.y - b.y);
    return x > 0 && y > 0 ? x * y : 0;
  }

  window.scatterKeywordLayout = function (items, options) {
    if (!items.length) return [];
    const left = number(options.left, 0);
    const top = number(options.top, 0);
    const right = Math.max(left, number(options.right, left));
    const bottom = Math.max(top, number(options.bottom, top));
    const sceneWidth = Math.max(1, right - left);
    const sceneHeight = Math.max(1, bottom - top);
    const diagonal = Math.hypot(sceneWidth, sceneHeight);
    const obstacles = (options.obstacles || []).map(box => ({
      x: number(box.x, (left + right) / 2),
      y: number(box.y, (top + bottom) / 2),
      width: Math.max(0, number(box.width, 0)),
      height: Math.max(0, number(box.height, 0))
    }));
    const words = items.map((item, index) => ({
      id: item.id,
      index,
      x: number(item.x, (left + right) / 2),
      y: number(item.y, (top + bottom) / 2),
      width: Math.max(0, number(item.width, 0)),
      height: Math.max(0, number(item.height, 0)),
      anchorX: number(item.anchorX, number(item.x, (left + right) / 2)),
      anchorY: number(item.anchorY, number(item.y, (top + bottom) / 2))
    }));
    const seed = hash(JSON.stringify([left, right, top, bottom, words, obstacles]));

    function bounded(word, x, y) {
      const halfWidth = Math.min(word.width / 2, sceneWidth / 2);
      const halfHeight = Math.min(word.height / 2, sceneHeight / 2);
      return {
        ...word,
        x: Math.max(left + halfWidth, Math.min(right - halfWidth, x)),
        y: Math.max(top + halfHeight, Math.min(bottom - halfHeight, y))
      };
    }

    function measure(candidate, occupied) {
      let collision = 0;
      let clearance = diagonal;
      for (const box of occupied) {
        const area = overlap(candidate, box);
        // Any intersection costs more than an otherwise awkward placement.
        if (area) collision += 1 + area / Math.max(1, candidate.width * candidate.height);
        const dx = Math.max(0, Math.abs(candidate.x - box.x) - (candidate.width + box.width) / 2);
        const dy = Math.max(0, Math.abs(candidate.y - box.y) - (candidate.height + box.height) / 2);
        clearance = Math.min(clearance, Math.hypot(dx, dy));
      }
      const anchorDistance = Math.hypot(candidate.x - candidate.anchorX, candidate.y - candidate.anchorY) / diagonal;
      const originalDistance = Math.hypot(candidate.x - words[candidate.index].x, candidate.y - words[candidate.index].y) / diagonal;
      const edgeDistance = Math.min(
        candidate.x - left - candidate.width / 2,
        right - candidate.x - candidate.width / 2,
        candidate.y - top - candidate.height / 2,
        bottom - candidate.y - candidate.height / 2
      );
      const arrangement = anchorDistance * .32 + originalDistance * .08
        - Math.min(clearance, 100) / diagonal * 1.25
        + Math.max(0, 20 - edgeDistance) / diagonal * .5;
      return { collision, score: collision * 1000 + arrangement };
    }

    let bestLayout;
    let bestCollision = Infinity;
    let bestScore = Infinity;
    // A few deterministic restarts avoid trapping small labels behind large ones.
    for (let attempt = 0; attempt < 4; attempt++) {
      const random = randomFrom(seed + attempt * 2654435761);
      const order = words.map(word => ({
        word,
        priority: word.width * word.height * (1 + random() * attempt * .08)
      })).sort((a, b) => b.priority - a.priority || a.word.index - b.word.index);
      const occupied = obstacles.slice();
      const placed = [];
      let layoutCollision = 0;
      let layoutScore = 0;

      for (const entry of order) {
        const word = entry.word;
        let best = bounded(word, word.x, word.y);
        let metric = measure(best, occupied);
        function consider(x, y) {
          const candidate = bounded(word, x, y);
          const next = measure(candidate, occupied);
          if (next.score < metric.score) {
            best = candidate;
            metric = next;
          }
        }

        // Random samples and a rotated spiral give a cloud, without grid columns.
        const phase = random() * Math.PI * 2;
        for (let sample = 0; sample < 320; sample++) {
          if (sample < 80) {
            const radius = Math.sqrt((sample + .5) / 80) * diagonal * .62;
            const angle = phase + sample * 2.399963229728653;
            consider(word.anchorX + Math.cos(angle) * radius, word.anchorY + Math.sin(angle) * radius);
          } else {
            consider(left + word.width / 2 + random() * Math.max(0, sceneWidth - word.width),
              top + word.height / 2 + random() * Math.max(0, sceneHeight - word.height));
          }
        }

        // Only in a crowded scene, try the remaining gaps beside existing boxes.
        if (metric.collision) {
          for (const box of occupied) {
            const offsetX = (word.width + box.width) / 2 + .5;
            const offsetY = (word.height + box.height) / 2 + .5;
            for (const direction of [-1, 1]) {
              consider(box.x + offsetX * direction, box.y);
              consider(box.x, box.y + offsetY * direction);
              consider(box.x + offsetX * direction, box.y + offsetY);
              consider(box.x + offsetX * direction, box.y - offsetY);
            }
          }
        }
        occupied.push(best);
        placed.push(best);
        layoutCollision += metric.collision;
        layoutScore += metric.score;
      }

      if (layoutCollision < bestCollision || (layoutCollision === bestCollision && layoutScore < bestScore)) {
        bestLayout = placed;
        bestCollision = layoutCollision;
        bestScore = layoutScore;
      }
      if (bestCollision === 0) break;
    }
    return bestLayout.sort((a, b) => a.index - b.index).map(word => ({ id: word.id, x: word.x, y: word.y }));
  };
}());
