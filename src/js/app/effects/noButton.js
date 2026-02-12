const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function moveNoButton(noBtn, tries, awayFromX = null, awayFromY = null) {
    noBtn.classList.add("floating");
    noBtn.textContent = "No";

    const rect = noBtn.getBoundingClientRect();
    const pad = 14;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x = pad;
    let y = pad;

    for (let i = 0; i < 30; i++) {
        const rx = Math.random() * (vw - rect.width - pad * 2) + pad;
        const ry = Math.random() * (vh - rect.height - pad * 2) + pad;

        if (awayFromX == null || awayFromY == null) {
            x = rx;
            y = ry;
            break;
        }

        const cx = rx + rect.width / 2;
        const cy = ry + rect.height / 2;
        if (Math.hypot(cx - awayFromX, cy - awayFromY) > 180) {
            x = rx;
            y = ry;
            break;
        }

        x = rx;
        y = ry;
    }

    noBtn.style.left = `${clamp(x, pad, vw - rect.width - pad)}px`;
    noBtn.style.top = `${clamp(y, pad, vh - rect.height - pad)}px`;
}

export function setupNoButtonBehavior({ noBtn, yesBtn, getTeaseMessages, showTopBubble }) {
    let tries = 0;

    function onNoAttempt(event) {
        event.preventDefault();
        tries += 1;

        const x = event.touches?.[0]?.clientX ?? event.clientX ?? null;
        const y = event.touches?.[0]?.clientY ?? event.clientY ?? null;

        const teaseMessages = getTeaseMessages();
        showTopBubble(teaseMessages[tries % teaseMessages.length]);
        moveNoButton(noBtn, tries, x, y);

        const scale = clamp(1 + tries * 0.05, 1, 1.35);
        yesBtn.style.transform = `scale(${scale})`;
    }

    noBtn.addEventListener("mouseenter", (event) => {
        if (tries > 0) onNoAttempt(event);
    });
    noBtn.addEventListener("click", onNoAttempt);
    noBtn.addEventListener("touchstart", onNoAttempt, { passive: false });
}
