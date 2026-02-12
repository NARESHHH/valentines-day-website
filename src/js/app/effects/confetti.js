export function createConfettiController(canvas) {
    const context = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function startConfetti(durationMs = 1600) {
        const width = canvas.width;
        const height = canvas.height;
        const confetti = Array.from({ length: 140 }, () => ({
            x: Math.random() * width,
            y: -20 - Math.random() * height * 0.4,
            r: 4 + Math.random() * 6,
            vx: -1.8 + Math.random() * 3.6,
            vy: 2.2 + Math.random() * 4.6,
            a: Math.random() * Math.PI * 2,
            va: -0.18 + Math.random() * 0.36,
            life: durationMs + Math.random() * 500,
        }));

        const start = performance.now();

        function tick(now) {
            context.clearRect(0, 0, width, height);
            const elapsed = now - start;

            for (const piece of confetti) {
                piece.x += piece.vx;
                piece.y += piece.vy;
                piece.a += piece.va;
                piece.vy += 0.02;

                if (piece.x < -50) piece.x = width + 50;
                if (piece.x > width + 50) piece.x = -50;

                const alpha = Math.max(0, 1 - elapsed / piece.life);
                context.save();
                context.globalAlpha = alpha;
                context.translate(piece.x, piece.y);
                context.rotate(piece.a);
                context.fillRect(-piece.r / 2, -piece.r / 2, piece.r, piece.r);
                context.restore();
            }

            if (elapsed < durationMs) {
                requestAnimationFrame(tick);
            } else {
                context.clearRect(0, 0, width, height);
            }
        }

        requestAnimationFrame(tick);
    }

    return { startConfetti };
}
