// Shared UI components (docs/design-system.md §5, docs/visual-spec.md §5).
// Each returns an HTML string; pages put it into the DOM with innerHTML.
// Anything that can contain user-entered text is escaped here.
import { escapeHtml, formatCount, formatKRW } from "../core/format.js";
import { STATUS_LABELS, COMMON } from "../core/strings.js";
import { getDevFlags } from "../core/store.js";
import { icon } from "./icons.js";
import { ensureToastRegion, toast } from "./overlays.js";

const HUB_URL = new URL("../../../index.html", import.meta.url).href;
export const imgSrc = (name) => new URL(`../../img/${name}.jpg`, import.meta.url).href;
const isImageName = (t) => /^[a-z0-9-]+$/.test(t);

/** Product thumbnail: cropped image, or a tinted box with an emoji when no crop exists. */
export function Thumb(thumbnail, alt = "") {
  return isImageName(thumbnail)
    ? `<img class="thumb" src="${imgSrc(thumbnail)}" alt="${escapeHtml(alt)}" loading="lazy">`
    : `<span class="thumb thumb--emoji" aria-hidden="true">${thumbnail}</span>`;
}

// ---------- app chrome ----------
export function StatusBar(now = new Date()) {
  const time = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, "0")}`;
  return `<div class="statusbar" aria-hidden="true"><span>SKT ${time}</span>
    <span class="statusbar__right">LTE ${icon("signal", { size: 14 })} 61% ${icon("battery", { size: 18, strokeWidth: 1.5 })}</span></div>`;
}

/** variant: "home" (‹ bag · title · search ✕) | "sub" (‹ title-left · search) | "modal" (‹ · title · ✕) */
export function AppHeader({ variant = "home", title = COMMON.appTitle, back = true } = {}) {
  const btn = (name, label, action) => `<button class="icon-btn" type="button" data-action="${action}" aria-label="${label}">${icon(name)}</button>`;
  const left = [back ? btn("back", COMMON.back, "back") : "", variant === "home" ? btn("bag", "장바구니", "cart") : ""].join("");
  const right = variant === "sub" ? btn("search", COMMON.search, "search")
    : variant === "modal" ? btn("close", COMMON.close, "close")
    : btn("search", COMMON.search, "search") + btn("close", COMMON.close, "close");
  return `<header class="app-header app-header--${variant}">
    <div class="app-header__side">${left}</div>
    <h1 class="app-header__title">${escapeHtml(title)}</h1>
    <div class="app-header__side app-header__side--right">${right}</div></header>`;
}

export const GNB_ITEMS = [
  { id: "forme", label: "FOR ME", promo: "키엘 메디립" }, { id: "home", label: "홈" }, { id: "ranking", label: "랭킹" },
  { id: "deal", label: "쨍쨍한특가", promo: "더블할인중!", promoTone: "orange" }, { id: "moist", label: "보습위크" }, { id: "wine", label: "와인/위스키" },
];

/** Top tab bar (GNB): bold labels, optional red promo label, black underline on the active tab. */
export function TopTabs({ items = GNB_ITEMS, active = "home", showPromo = true } = {}) {
  return `<nav class="gnb" aria-label="선물하기 메뉴"><ul class="gnb__list">${items.map((it) => `
    <li><a class="gnb__tab" href="#" data-tab="${it.id}" ${it.id === active ? 'aria-current="page"' : ""}>
      ${showPromo && it.promo ? `<span class="gnb__promo ${it.promoTone ? `gnb__promo--${it.promoTone}` : ""}">${it.promo}</span>` : ""}${it.label}</a></li>`).join("")}</ul></nav>`;
}

export function BottomNav({ active = "home" } = {}) {
  const items = [["home", "홈", icon(active === "home" ? "home" : "homeLine")], ["category", "카테고리", icon("grid")],
    ["lux", "럭스", '<span class="lux-mark" aria-hidden="true">LuX</span>'], ["wish", "위시", icon("heart")], ["box", "선물함", icon("user")]];
  return `<nav class="bottom-nav" aria-label="하단 메뉴">${items.map(([id, label, ic]) => `
    <a class="bottom-nav__item" href="#" ${id === active ? 'aria-current="page"' : ""}>${ic}<span>${label}</span>${id === "box" ? '<i class="dot" aria-hidden="true"></i>' : ""}</a>`).join("")}</nav>`;
}

export function SearchBar({ placeholder = "선물 검색", name = "q" } = {}) {
  return `<label class="searchbar">${icon("search", { size: 20 })}<span class="visually-hidden">${COMMON.search}</span>
    <input type="search" name="${name}" placeholder="${escapeHtml(placeholder)}"></label>`;
}

export function SectionHeader({ title, info = false, moreHref = "" }) {
  return `<div class="section-header"><h2 class="section-header__title">${escapeHtml(title)}${info ? `<span class="section-header__info">${icon("info", { size: 18, strokeWidth: 1.5 })}</span>` : ""}</h2>
    ${moreHref ? `<a class="section-header__more" href="${moreHref}">${COMMON.more}${icon("chevronRight", { size: 16 })}</a>` : ""}</div>`;
}

// ---------- selection controls ----------
/** Grey pill track with a white active pill (선물 테마 | 카테고리 | 최근 본). */
export function Segmented({ options, active, label }) {
  return `<div class="segmented" role="tablist" aria-label="${escapeHtml(label)}">${options.map((o) => `
    <button class="segmented__item" type="button" role="tab" data-value="${o.value}" aria-selected="${o.value === active}">${escapeHtml(o.label)}</button>`).join("")}</div>`;
}

/** Equal-width text tabs with an underline on the active one (전체 | 케이크 | 디저트). */
export function UnderlineTabs({ options, active, label }) {
  return `<div class="utabs" role="tablist" aria-label="${escapeHtml(label)}">${options.map((o) => `
    <button class="utabs__item" type="button" role="tab" data-value="${o.value}" aria-selected="${o.value === active}">${escapeHtml(o.label)}</button>`).join("")}</div>`;
}

/** Outline pill chips; the pressed one is black. Horizontal scroll. */
export function ChipGroup({ chips, active, label, multi = false }) {
  const on = (v) => (multi ? active.includes(v) : v === active);
  return `<div class="chips" role="group" aria-label="${escapeHtml(label)}">${chips.map((c) => `
    <button class="chip" type="button" data-value="${c.value}" aria-pressed="${on(c.value)}">${escapeHtml(c.label)}</button>`).join("")}</div>`;
}

/** Mark `el` as the chosen item in its group (tabs: aria-selected, radios: aria-checked, chips: aria-pressed). */
export function selectOne(el) {
  const attr = ["aria-selected", "aria-checked", "aria-pressed"].find((a) => el.hasAttribute(a));
  el.parentElement.querySelectorAll(`[${attr}]`).forEach((b) => b.setAttribute(attr, String(b === el)));
}

// ---------- badges ----------
const STATUS_TONE = {
  SENT: "blue", OPENED: "grey", ADDRESS_SUBMITTED: "warning", SHIPPED: "warning", DELIVERED: "grey", USED: "grey",
  CONVERTED: "money", DECLINED_REFUNDED: "danger",
};
export const StatusBadge = (status, role = "recipient") =>
  `<span class="badge badge--${STATUS_TONE[status]}">${STATUS_LABELS[role][status]}</span>`;
export const NewBadge = () => `<span class="badge-new">${COMMON.newBadge}</span>`;
export const Tag = (text) => `<span class="tag">${escapeHtml(text)}</span>`;
export const PillBadge = (text) => `<span class="pill-badge">${escapeHtml(text)}</span>`;
const PromoBadge = (badge) => (badge ? `<span class="promo-badge promo-badge--${badge === "단독" ? "exclusive" : "hot"}">${badge}</span>` : "");

// ---------- products ----------
/** variant: "grid3" (ranking) | "grid2" (category list) | "mini" (horizontal rows) */
export function ProductCard(p, { variant = "grid3", rank = null, hrefBase = "product.html", query = "" } = {}) {
  const href = `${hrefBase}?id=${p.id}${query ? `&${query}` : ""}`;
  const full = variant !== "mini";
  return `<article class="pcard pcard--${variant}">
    <a class="pcard__link" href="${href}">
      <div class="pcard__img">${Thumb(p.thumbnail)}${rank ? `<span class="rank-badge">${rank}</span>` : ""}${full ? PromoBadge(p.badge) : ""}</div>
      <p class="pcard__brand">${escapeHtml(p.brand)}${icon("chevronRight", { size: 14, strokeWidth: 2 })}</p>
      <p class="pcard__name">${escapeHtml(p.name)}</p>
      <p class="pcard__price">${p.discountRate ? `<span class="pcard__rate">${p.discountRate}%</span>` : ""}${formatKRW(p.price)}</p>
      ${full && p.benefitPrice ? `<p class="pcard__benefit">최대혜택가 ${formatKRW(p.benefitPrice)}</p>` : ""}
      ${full && p.freeShipping ? Tag(COMMON.freeShipping) : ""}
    </a>
    ${full ? `<div class="pcard__actions">
      <button class="icon-btn icon-btn--s" type="button" data-action="cart" aria-label="장바구니 담기">${icon("bag", { size: 20, strokeWidth: 1.5 })}</button>
      <button class="icon-btn icon-btn--s pcard__wish" type="button" data-action="wish" aria-pressed="false" aria-label="위시 담기">${icon("heart", { size: 20, strokeWidth: 1.5 })}</button>
      <span class="pcard__count">${formatCount(p.wishCount)}</span></div>` : ""}
  </article>`;
}

export function ProductGrid(products, options = {}) {
  const variant = options.variant ?? "grid3";
  return `<div class="pgrid pgrid--${variant}">${products.map((p, i) => ProductCard(p, { ...options, rank: options.ranked ? i + 1 : null })).join("")}</div>`;
}

/** 5-column squircle image tiles with labels. items: [{ label, image, href }] */
export function CategoryGrid(items) {
  return `<ul class="cat-grid">${items.map((it) => `
    <li><a class="cat-grid__item" href="${it.href ?? "#"}"><span class="cat-grid__tile">${Thumb(it.image)}</span>${escapeHtml(it.label)}</a></li>`).join("")}</ul>`;
}

/** Horizontal scroll-snap banners with a "1/3" counter (mount with mountBannerCarousel). */
export function BannerCarousel(slides, { label = "기획전" } = {}) {
  return `<section class="banner" aria-roledescription="carousel" aria-label="${escapeHtml(label)}">
    <div class="banner__track">${slides.map((s, i) => `
      <a class="banner__slide" href="${s.href ?? "#"}" style="--banner-bg: ${s.color}" aria-label="${i + 1} / ${slides.length}">
        <span class="banner__chip">${escapeHtml(s.chip)}</span>
        <strong class="banner__title">${escapeHtml(s.title).replaceAll("\n", "<br>")}</strong>
        <span class="banner__img">${Thumb(s.image)}</span></a>`).join("")}</div>
    ${slides.length > 1 ? `<span class="banner__counter" aria-hidden="true">1/${slides.length}</span>` : ""}</section>`;
}

export function mountBannerCarousel(root) {
  const track = root.querySelector(".banner__track");
  const counter = root.querySelector(".banner__counter");
  if (!counter) return;
  const total = track.children.length;
  track.addEventListener("scroll", () => {
    counter.textContent = `${Math.round(track.scrollLeft / track.clientWidth) + 1}/${total}`;
  }, { passive: true });
}

// ---------- bottom bars ----------
/** variant "detail": ♡ · 공유 · 나에게 · 선물하기(avatar) — variant "single": one full-width yellow button. */
export function BottomCTA({ variant = "single", label = "선물하기", wishCount = 0, to = "", action = "primary", showSelf = true } = {}) {
  if (variant === "single") {
    return `<div class="bottom-cta"><button class="btn btn--primary btn--block" type="button" data-action="${action}">${escapeHtml(label)}</button></div>`;
  }
  return `<div class="bottom-cta bottom-cta--detail">
    <button class="bottom-cta__icon" type="button" data-action="wish" aria-pressed="false">${icon("heart")}<span>${formatCount(wishCount)}+</span></button>
    <button class="bottom-cta__icon" type="button" data-action="share">${icon("share")}<span>공유</span></button>
    ${showSelf ? '<button class="btn btn--dark" type="button" data-action="gift-self">나에게</button>' : ""}
    <button class="btn btn--primary btn--grow" type="button" data-action="${action}">${Avatar(null, { size: "s" })}<span>${to ? `<b>${escapeHtml(to)}</b>에게 ` : ""}${escapeHtml(label)}</span></button>
  </div>`;
}

export function Avatar(user, { size = "m" } = {}) {
  const inner = user?.avatar ? `<span aria-hidden="true">${user.avatar}</span>` : icon("person", { size: 18 });
  return `<span class="avatar avatar--${size}">${inner}</span>`;
}

// ---------- To-Be pieces ----------
/** Subtle progress indicator. steps: ["상품 선택", "메시지·결제", "완료"], current: index. */
export function Stepper(steps, current) {
  return `<ol class="stepper" aria-label="진행 단계">${steps.map((s, i) => `
    <li class="stepper__step ${i < current ? "is-done" : i === current ? "is-current" : ""}" ${i === current ? 'aria-current="step"' : ""}>
      <span class="stepper__dot">${i < current ? icon("check", { size: 12, strokeWidth: 3 }) : i + 1}</span>${escapeHtml(s)}</li>`).join("")}</ol>`;
}

/** Two option cards (convert vs decline). options: [{ id, icon, title, amount, points: [] }] */
export function OptionCompare(options, selected = null) {
  return `<div class="option-compare" role="radiogroup" aria-label="선물 처리 방법">${options.map((o) => `
    <button class="option-card option-card--${o.id}" type="button" role="radio" data-value="${o.id}" aria-checked="${o.id === selected}">
      <span class="option-card__head">${icon(o.icon, { size: 22 })}<strong>${escapeHtml(o.title)}</strong><span class="option-card__radio" aria-hidden="true"></span></span>
      ${o.amount ? `<span class="option-card__amount">${escapeHtml(o.amount)}</span>` : ""}
      <ul class="option-card__points">${o.points.map((pt) => `<li>${escapeHtml(pt)}</li>`).join("")}</ul>
    </button>`).join("")}</div>`;
}

/** Checkout / received-gift message card (blue theme from the checkout screenshot). */
export function GiftMessageCard({ message, editable = false }) {
  return `<figure class="msg-card">
    <blockquote class="msg-card__text">${escapeHtml(message).replaceAll("\n", "<br>")}</blockquote>
    ${editable ? `<button class="msg-card__edit" type="button" data-action="edit-message">${icon("text", { size: 18 })}메시지 편집</button>` : ""}
    <img class="msg-card__art" src="${imgSrc("msg-art-blue")}" alt=""></figure>`;
}

export function InfoBox(text, { tone = "blue", iconName = "info" } = {}) {
  return `<p class="info-box info-box--${tone}">${icon(iconName, { size: 18 })}<span>${escapeHtml(text)}</span></p>`;
}

/** actionName → a <button data-action>; otherwise actionHref → a link. */
export function EmptyState({ title, caption = "", actionLabel = "", actionHref = "#", actionName = "" }) {
  return `<div class="empty-state">${icon("gift", { size: 48, strokeWidth: 1.25 })}
    <p class="empty-state__title">${escapeHtml(title)}</p>${caption ? `<p class="empty-state__caption">${escapeHtml(caption)}</p>` : ""}
    ${!actionLabel ? "" : actionName
      ? `<button class="btn btn--outline" type="button" data-action="${actionName}">${escapeHtml(actionLabel)}</button>`
      : `<a class="btn btn--outline" href="${actionHref}">${escapeHtml(actionLabel)}</a>`}</div>`;
}

export const ScrollTopButton = () =>
  `<button class="scroll-top" type="button" data-action="scroll-top" aria-label="맨 위로" hidden>${icon("arrowUp", { size: 26, strokeWidth: 1.5 })}</button>`;

// ---------- page setup ----------
/** Common setup for every page: status bar, NEW-badge toggle, toast region, shared click actions. */
export function initPage() {
  document.querySelectorAll("[data-statusbar]").forEach((el) => (el.outerHTML = StatusBar()));
  document.documentElement.classList.toggle("hide-new", !getDevFlags().showNewBadges);
  ensureToastRegion();
  const scroller = document.querySelector(".phone__body");
  const topBtn = document.querySelector(".scroll-top");
  if (scroller && topBtn) scroller.addEventListener("scroll", () => (topBtn.hidden = scroller.scrollTop < 400), { passive: true });
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.dataset.action;
    if (action === "back") history.length > 1 ? history.back() : (location.href = HUB_URL);
    if (action === "close") location.href = HUB_URL; // leaving the gift webview → demo hub
    if (action === "search" || action === "cart") toast(COMMON.unsupported);
    if (action === "scroll-top") (document.querySelector(".phone__body") ?? document.scrollingElement).scrollTo({ top: 0, behavior: "smooth" });
    if (action === "wish") el.setAttribute("aria-pressed", String(el.getAttribute("aria-pressed") !== "true"));
  });
}
