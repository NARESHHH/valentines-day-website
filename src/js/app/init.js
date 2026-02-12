import { dom } from "./dom.js";
import { appState } from "./state.js";
import { cleanName } from "./utils/text.js";
import { createShareLink, loadByToken } from "./services/api.js";
import { showTopBubble } from "./ui/bubble.js";
import {
    renderGeneratedPage,
    setStatus,
    showAskPage,
    transitionToSuccess,
} from "./ui/render.js";
import { startHearts } from "./effects/hearts.js";
import { setupNoButtonBehavior } from "./effects/noButton.js";
import { createConfettiController } from "./effects/confetti.js";

const samplePayload = {
    fromName: "Aarav",
    toName: "Mira",
    quote: "From little laughs to big dreams, every day is better with you.",
    imageUrl: "assets/sample-couple-garden.svg",
};

function removeLegacyShareBox() {
    const legacyShareBox = document.getElementById("shareBox");
    if (legacyShareBox) legacyShareBox.remove();
}

function collectPayloadFromForm() {
    return {
        fromName: cleanName(dom.fromNameInput.value),
        toName: cleanName(dom.toNameInput.value),
        quote: dom.quoteInput.value.trim(),
        imageDataUrl: appState.uploadedImageDataUrl,
    };
}

function applyPayload(payload) {
    appState.yourName = payload.fromName;
    appState.lovedOneName = payload.toName;
    appState.quoteText = payload.quote || "";
    appState.persistedImageUrl = payload.imageUrl || "";
    appState.uploadedImageDataUrl = payload.imageDataUrl || "";

    renderGeneratedPage();
}

function getTeaseMessages() {
    return [
        `The Yes button is right there, ${appState.lovedOneName}! 💞`,
        `${appState.lovedOneName}... please? 🥺💖`,
        `Aww come on ${appState.lovedOneName}, don't be shy 😌`,
        `Just one YES and I'll smile all day 😄 — ${appState.yourName}`,
        `I promise snacks, laughs & good vibes 🍫😄`,
        `Hehe... you almost clicked it 😜`,
        `Pretty pleaseee 🙈💘`,
        `Okay wow... you're making me beg now 🥺👉👈`,
        `Say YES and I'll plan the cutest date 😍`,
        `My heart says you'll click YES 💓`,
        `Final offer: unlimited love 💝`,
        `Don't break my heart like this 😭💗`,
        `Just tap YES... I'm right here 😌💞`,
        `${appState.lovedOneName} + ${appState.yourName} = Perfect Valentine 💕`,
        `If you click YES, I'll bring a rose 🌹`,
        `I'll owe you one big treat if you click YES 🍦💖`,
    ];
}

function bindPhotoUploadPreview() {
    dom.photoInput.addEventListener("change", () => {
        const file = dom.photoInput.files?.[0];
        if (!file) return;

        if (appState.uploadedImageUrl) URL.revokeObjectURL(appState.uploadedImageUrl);
        appState.uploadedImageUrl = URL.createObjectURL(file);
        appState.persistedImageUrl = "";
        dom.successImg.src = appState.uploadedImageUrl;

        const reader = new FileReader();
        reader.onload = () => {
            appState.uploadedImageDataUrl = typeof reader.result === "string" ? reader.result : "";
        };
        reader.onerror = () => {
            appState.uploadedImageDataUrl = "";
            showTopBubble("Image added, but image encoding failed.");
        };
        reader.readAsDataURL(file);
    });
}

function bindGenerateAction() {
    dom.generateBtn.addEventListener("click", async () => {
        const payload = collectPayloadFromForm();

        if (!payload.fromName) {
            showTopBubble("Please enter your name first ✍️");
            dom.fromNameInput.focus();
            return;
        }

        if (!payload.toName) {
            showTopBubble("Please enter your loved one's name first 💌");
            dom.toNameInput.focus();
            return;
        }

        dom.generateBtn.disabled = true;
        setStatus("Generating your share link...");

        try {
            const result = await createShareLink(payload);
            applyPayload(result.payload);
            showAskPage();
            const localShareUrl = `${window.location.origin}/?v=${encodeURIComponent(result.token)}`;
            try {
                await navigator.clipboard.writeText(result.shareUrl);
                showTopBubble("Share link copied");
            } catch {
                showTopBubble("Shareable link is now in your address bar");
            }
            // Force navigation so URL bar always contains the tokenized share link.
            window.location.assign(localShareUrl);
            setStatus("");
        } catch (error) {
            setStatus(error.message, true);
        } finally {
            dom.generateBtn.disabled = false;
        }
    });
}

function bindYesAction({ stopHearts, startConfetti }) {
    dom.yesBtn.addEventListener("click", () => {
        showTopBubble(`Yayyy ${appState.lovedOneName}!!! 💖`);
        stopHearts();
        startConfetti(1700);
        transitionToSuccess();
    });
}

async function initFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const isSampleMode = params.get("sample") === "1";
    const token = params.get("v");

    if (isSampleMode) {
        applyPayload(samplePayload);
        showAskPage();
        setStatus("");
        showTopBubble("Sample preview mode");
        return;
    }

    if (!token) return;

    try {
        const payload = await loadByToken(token);
        applyPayload(payload);
        showAskPage();
        setStatus("");
    } catch (error) {
        setStatus(error.message, true);
    }
}

export function initApp() {
    removeLegacyShareBox();

    const stopHearts = startHearts();
    const { startConfetti } = createConfettiController(dom.confettiCanvas);

    setupNoButtonBehavior({
        noBtn: dom.noBtn,
        yesBtn: dom.yesBtn,
        getTeaseMessages,
        showTopBubble,
    });

    bindPhotoUploadPreview();
    bindGenerateAction();
    bindYesAction({ stopHearts, startConfetti });

    initFromUrl();
}
