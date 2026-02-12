import { defaults } from "../config.js";
import { dom } from "../dom.js";
import { appState } from "../state.js";
import { quoteToHtml } from "../utils/text.js";

function normalizeLocalUploadUrl(url) {
    const value = (url || "").trim();
    if (!value) return "";
    const localUploadMatch = value.match(/^https?:\/\/[^/]+(\/uploads\/.+)$/i);
    return localUploadMatch ? localUploadMatch[1] : value;
}

export function setStatus(text, isError = false) {
    dom.statusText.textContent = text;
    dom.statusText.classList.toggle("error", isError);
}

export function hydrateForm(payload) {
    dom.fromNameInput.value = payload.fromName || "";
    dom.toNameInput.value = payload.toName || "";
    dom.quoteInput.value = payload.quote || "";
}

export function renderGeneratedPage() {
    dom.askTitle.textContent = `${appState.lovedOneName}, will you be my valentine? 💘`;
    document.title = `${appState.lovedOneName}, will you be my Valentine? 💘`;

    dom.signature.textContent = `— ${appState.yourName}`;
    dom.successImg.alt = `${appState.yourName} & ${appState.lovedOneName} 💞`;
    dom.successQuote.innerHTML = appState.quoteText ? quoteToHtml(appState.quoteText) : defaults.quote;

    if (appState.persistedImageUrl) {
        dom.successImg.src = normalizeLocalUploadUrl(appState.persistedImageUrl);
        return;
    }

    if (appState.uploadedImageDataUrl.startsWith("data:image/")) {
        dom.successImg.src = appState.uploadedImageDataUrl;
        return;
    }

    if (appState.uploadedImageUrl) {
        dom.successImg.src = appState.uploadedImageUrl;
        return;
    }

    dom.successImg.src = defaults.image;
}

export function showAskPage() {
    dom.formPage.style.display = "none";
    dom.askPage.classList.remove("hidden");
}

export function transitionToSuccess() {
    dom.askPage.classList.add("hide");
    dom.footerTag.classList.add("hide");

    setTimeout(() => {
        dom.askPage.style.display = "none";
        dom.footerTag.style.display = "none";
        dom.successPage.classList.add("show");
    }, 260);
}
