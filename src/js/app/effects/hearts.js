import { hearts } from "../config.js";

function spawnHeart() {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.top = `${100 + Math.random() * 20}vh`;
    heart.style.fontSize = `${18 + Math.random() * 30}px`;

    const duration = 6 + Math.random() * 7;
    heart.style.animationDuration = `${duration}s`;

    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000);
}

export function startHearts() {
    for (let i = 0; i < 12; i++) {
        setTimeout(spawnHeart, i * 180);
    }

    const intervalId = setInterval(spawnHeart, 450);

    return function stopHearts() {
        clearInterval(intervalId);
    };
}
