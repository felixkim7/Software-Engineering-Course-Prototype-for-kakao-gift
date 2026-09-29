// Overlays: confirm dialog, bottom sheet, toast, loading. Mounted inside the phone frame when there is one.
import { escapeHtml } from "../core/format.js";
import { COMMON } from "../core/strings.js";

const overlayRoot = () => document.querySelector(".phone") ?? document.body;
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Keep Tab focus inside `container`; Escape calls onEscape. Returns a release function that restores focus. */
function trapFocus(container, onEscape) {
  const previous = document.activeElement;
  const onKey = (e) => {
    if (e.key === "Escape") { e.preventDefault(); onEscape(); return; }
    if (e.key !== "Tab") return;
    const items = [...container.querySelectorAll(FOCUSABLE)].filter((el) => !el.disabled);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener("keydown", onKey);
  return () => {
    document.removeEventListener("keydown", onKey);
    previous?.focus?.();
  };
}

/**
 * App-style popup (grey 아니오 + yellow 네). Resolves true on confirm, false on cancel / ESC / backdrop.
 * cancelText: null → single-button notice.
 */
export function confirmModal({ title = "", message, confirmText = COMMON.yes, cancelText = COMMON.no }) {
  return new Promise((resolve) => {
    const layer = document.createElement("div");
    layer.className = "overlay overlay--center";
    layer.innerHTML = `<div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-msg">
      ${title ? `<p class="dialog__title">${escapeHtml(title)}</p>` : ""}
      <p class="dialog__msg" id="dialog-msg">${escapeHtml(message).replaceAll("\n", "<br>")}</p>
      <div class="dialog__actions">
        ${cancelText ? `<button class="btn btn--grey" type="button" data-answer="no">${escapeHtml(cancelText)}</button>` : ""}
        <button class="btn btn--primary" type="button" data-answer="yes">${escapeHtml(confirmText)}</button>
      </div></div>`;
    const close = (answer) => { release(); layer.remove(); resolve(answer); };
    const release = trapFocus(layer, () => close(false));
    layer.addEventListener("click", (e) => {
      if (e.target === layer) close(false);
      const btn = e.target.closest("[data-answer]");
      if (btn) close(btn.dataset.answer === "yes");
    });
    overlayRoot().append(layer);
    layer.querySelector('[data-answer="yes"]').focus();
  });
}

const LAYERS = {
  sheet: { overlay: "overlay--bottom", panel: "sheet", extra: '<span class="sheet__handle" aria-hidden="true"></span>' },
  dialog: { overlay: "overlay--center", panel: "panel", extra: "" },
  drawer: { overlay: "overlay--right", panel: "drawer", extra: "" },
};

/**
 * kind "sheet" (mobile bottom sheet with handle) | "dialog" (centered panel) | "drawer" (right side, desktop).
 * `content` is an HTML string; [data-close] / [data-sheet-close] inside it close the layer.
 * Focus is trapped, ESC and a backdrop click close it. Returns { el, close }; onClose runs once.
 */
function openLayer(kind, { label, content, className = "", onClose = () => {} }) {
  const cfg = LAYERS[kind];
  const layer = document.createElement("div");
  layer.className = `overlay ${cfg.overlay}`;
  layer.innerHTML = `<section class="${cfg.panel} ${className}" role="dialog" aria-modal="true" aria-label="${escapeHtml(label)}" tabindex="-1">
    ${cfg.extra}${content}</section>`;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    release();
    layer.classList.add("is-closing");
    setTimeout(() => layer.remove(), 200);
    onClose();
  };
  const release = trapFocus(layer, close);
  layer.addEventListener("click", (e) => {
    if (e.target === layer || e.target.closest("[data-sheet-close], [data-close]")) close();
  });
  overlayRoot().append(layer);
  const panel = layer.querySelector(`.${cfg.panel}`);
  (panel.querySelector(FOCUSABLE) ?? panel).focus();
  return { el: panel, close };
}

export const openSheet = (options) => openLayer("sheet", options);
export const openDialog = (options) => openLayer("dialog", options);
export const openDrawer = (options) => openLayer("drawer", options);

// ---------- toast ----------
export function ensureToastRegion() {
  let region = document.querySelector(".toast-region");
  if (!region) {
    region = document.createElement("div");
    region.className = "toast-region";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("role", "status");
    overlayRoot().append(region);
  }
  return region;
}

/**
 * variant "plain": dark pill near the bottom. variant "notice": KakaoTalk heads-up banner at the top
 * (like the "카카오톡 선물하기 주문이 취소되었습니다." notification in the screenshots).
 */
export function toast(message, { variant = "plain", title = "카카오톡 선물하기", duration = 2600 } = {}) {
  const el = document.createElement("div");
  el.className = `toast toast--${variant}`;
  el.innerHTML = variant === "notice"
    ? `<img class="toast__icon" src="${new URL("../../img/kakao-talk.jpg", import.meta.url).href}" alt=""><b>${escapeHtml(title)}</b><span>${escapeHtml(message)}</span>`
    : escapeHtml(message);
  ensureToastRegion().append(el);
  setTimeout(() => {
    el.classList.add("is-leaving");
    setTimeout(() => el.remove(), 250);
  }, duration);
}

// ---------- loading ----------
let loadingLayer = null;

export function showLoading(message = COMMON.loading) {
  if (loadingLayer) return;
  loadingLayer = document.createElement("div");
  loadingLayer.className = "overlay overlay--center overlay--loading";
  loadingLayer.setAttribute("role", "alert");
  loadingLayer.setAttribute("aria-busy", "true");
  loadingLayer.innerHTML = `<div class="loading"><span class="spinner" aria-hidden="true"></span>${escapeHtml(message)}</div>`;
  overlayRoot().append(loadingLayer);
}

export function hideLoading() {
  loadingLayer?.remove();
  loadingLayer = null;
}

/** Show the spinner (and block clicks) while `promise` runs. */
export async function withLoading(promise, message) {
  showLoading(message);
  try {
    return await promise;
  } finally {
    hideLoading();
  }
}
