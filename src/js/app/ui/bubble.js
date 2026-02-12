import { dom } from "../dom.js";

let bubbleTimer = null;

export function showTopBubble(text) {
    dom.topBubble.textContent = text;
    dom.topBubble.style.display = "block";

    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => {
        dom.topBubble.style.display = "none";
    }, 1600);
}
