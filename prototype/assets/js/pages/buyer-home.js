// SCR-B01 (choose recipient) + SCR-B02 (segmented recommendation) — UC-B1, UC-B2 steps 1–4, alt 3a / 3b.
// State A: buyer/index.html · State B: ?to=u1 (recipient) or ?browse=1 (no recipient). Chips live in the URL.
import { AGE_LABELS, CATEGORY_LABELS, GENDER_LABELS, RELATION_LABELS, SITUATION_LABELS } from "../core/strings.js";
import { getState, getUser, listProducts } from "../core/store.js";
import { EMPTY_FILTERS, deriveProfileTags, filtersFromTags, popularInSegment, recommend } from "../core/recommend.js";
import {
  AppHeader, BannerCarousel, BottomNav, CategoryGrid, ChipGroup, EmptyState, NewBadge, ProductGrid, ScrollTopButton,
  SectionHeader, Segmented, Stepper, TopTabs, initPage, selectOne,
} from "../ui/components.js";
import { FriendCards, RecipientCard, sortFriends } from "../ui/friends.js";
import { icon } from "../ui/icons.js";

const S = {
  steps: ["받는 사람", "선물 고르기", "메시지·결제", "완료"],
  pickTitle: "선물할 친구를 선택해 주세요.",
  search: "친구 이름 검색",
  noFriend: "검색 결과가 없어요.",
  browse: "받는 사람 없이 둘러보기",
  history: "선물 보낸 내역",
  ranking: "실시간 선물랭킹",
  recentTitle: '내가 본 <b class="text-blue">BBQ</b>와 비슷한 상품',
  filterTitle: "조건별 추천",
  count: (n) => `추천 <b>${n}개</b>`,
  reset: "필터 초기화",
  forName: (name) => `${name}님에게 딱 맞는 선물`,
  forAll: "지금 추천하는 선물",
  popular: (segment) => (segment ? `${segment} 인기 선물` : "지금 인기 선물"),
  allCategories: "전체 카테고리",
  all: "전체",
  emptyTitle: "조건에 맞는 선물이 없어요",
  emptyCaption: "조건을 줄이거나 필터를 초기화해 보세요.",
  more: "더보기",
};

// Chip groups (the To-Be segmented recommendation). Gender has an explicit "전체" chip (= no filter).
const GROUPS = [
  { key: "relation", param: "rel", label: "관계", labels: RELATION_LABELS, order: ["friend", "partner", "family", "coworker"] },
  { key: "situation", param: "sit", label: "상황", labels: SITUATION_LABELS, order: ["birthday", "thanks", "congrats", "cheer", "getwell", "casual"] },
  { key: "ageGroup", param: "age", label: "연령대", labels: AGE_LABELS, order: ["10s", "20s", "30s", "40s", "50s+"] },
  { key: "gender", param: "gen", label: "성별", labels: GENDER_LABELS, order: ["F", "M"] },
];

// Dynamic banner copy (UC-B2 step 2): situation chip first, then relation, then a neutral default.
const SITUATION_BANNERS = {
  thanks: "고마운 마음을 전하는\n감사 선물", congrats: "축하의 마음을 담은\n특별한 선물", cheer: "힘내라는 응원을\n선물로 전해요",
  getwell: "빠른 쾌유를 바라는\n건강 선물", casual: "부담 없이\n가볍게 건네는 선물",
};
const RELATION_BANNERS = {
  coworker: "고마운 동료에게\n부담 없는 선물", family: "사랑하는 가족에게\n마음을 전하세요", partner: "연인에게 전하는\n특별한 선물", friend: "친구에게 건네는\n센스 있는 선물",
};
const BANNER_COLORS = { birthday: "var(--color-pink)", coworker: "var(--color-banner-teal)", thanks: "var(--color-banner-teal)", family: "var(--color-blue)", partner: "var(--color-pink)" };

// Home tiles (164450 선물 테마 / 164501 카테고리) → browse links with a chip or category pre-selected.
const THEME_TILES = [
  ["생일", "theme-birthday", "sit=birthday"], ["보습위크", "theme-moisture", "cat=beauty"], ["맛있는선물", "theme-tasty", "cat=food"],
  ["건강·비타민", "theme-health", "sit=getwell"], ["쨍쨍한특가", "theme-hotdeal", ""], ["가벼운선물", "theme-light", "sit=casual"],
  ["명품선물", "theme-luxury", "cat=fashion"], ["스몰럭셔리", "theme-small-luxury", "cat=living"], ["출산·돌", "theme-baby", "sit=congrats"],
  ["결혼·집들이", "theme-wedding", "sit=congrats"], ["교환권", "theme-voucher", "cat=cafe"], ["직장동료", "theme-coworker", "rel=coworker"],
  ["합격·응원", "theme-cheer", "sit=cheer"], ["웃긴선물", "theme-funny", "sit=casual"], ["신상선물", "theme-new", ""],
];
const CATEGORY_TILES = [
  ["추천선물", "kakao-ryan-card", ""], ["케익·디저트", "cat-cake", "cat=dessert"], ["비타민·홍삼", "cat-vitamin", "cat=health"],
  ["미니가전", "cat-headphone", "cat=digital"], ["과일·소고기", "cat-mango", "cat=food"], ["기초·색조", "cat-makeup", "cat=beauty"],
  ["향수·바디", "cat-perfume", "cat=beauty"], ["패션·주얼리", "cat-jewelry", "cat=fashion"], ["리빙·키친", "cat-living", "cat=living"],
  ["카페·치킨", "cat-cafe", "cat=cafe"], ["와인·위스키", "cat-wine", ""], ["골프·스포츠", "cat-golf", ""],
  ["상품권", "cat-giftcard", ""], ["육아용품", "cat-kids", ""], ["팬덤·캐릭터", "cat-fandom", ""],
];
const tileHref = (q) => (q.startsWith("cat=") ? `?browse=1&${q}#all-categories` : q ? `?browse=1&f=1&${q}` : "?browse=1");
const toTiles = (rows) => rows.map(([label, image, q]) => ({ label, image, href: tileHref(q) }));

// ---------- state ----------
const params = new URLSearchParams(location.search);
const recipient = params.get("to") ? getUser(params.get("to")) : null;
const isRecommend = Boolean(recipient?.relation) || params.has("browse");
const tags = recipient?.relation ? deriveProfileTags(recipient) : null;
const products = listProducts();
const app = document.querySelector("#app");

function initialFilters() {
  if (!params.has("f")) return tags ? filtersFromTags(tags) : { ...EMPTY_FILTERS };
  return Object.fromEntries(GROUPS.map((g) => {
    const v = params.get(g.param);
    return [g.key, g.order.includes(v) ? v : null];
  }));
}
let filters = initialFilters();
let category = CATEGORY_LABELS[params.get("cat")] ? params.get("cat") : "all";
let categoryLimit = 6;

const productQuery = () =>
  [recipient && `to=${recipient.id}`, !recipient && "browse=1", filters.situation && `situation=${filters.situation}`].filter(Boolean).join("&");

function syncUrl() {
  const p = new URLSearchParams(recipient ? { to: recipient.id } : { browse: "1" });
  p.set("f", "1");
  GROUPS.forEach((g) => filters[g.key] && p.set(g.param, filters[g.key]));
  if (category !== "all") p.set("cat", category);
  history.replaceState(null, "", `?${p}${location.hash}`);
}

// ---------- SCR-B01: choose recipient ----------
function renderPick() {
  const friends = sortFriends(getState().users);
  const ranking = [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 6);
  app.innerHTML = `
    <div class="sticky-top">${AppHeader()}${TopTabs()}</div>
    ${Stepper(S.steps, 0)}
    <section class="friend-band" aria-labelledby="pick-h">
      <div class="pick-card"><h2 class="pick-card__title" id="pick-h"><span class="plus-tile">${icon("plus", { strokeWidth: 2 })}</span>${S.pickTitle}</h2>
        <label class="searchbar">${icon("search", { size: 20 })}<span class="visually-hidden">${S.search}</span><input type="search" data-friend-search placeholder="${S.search}"></label></div>
      ${FriendCards(friends, (u) => `?to=${u.id}`)}
      <p class="friend-empty" data-friend-empty hidden>${S.noFriend}</p>
      <div class="friend-links"><a class="link-more" href="?browse=1">${S.browse}${icon("chevronRight", { size: 16 })}</a>
        <button class="link-muted" type="button" disabled title="Phase 2">${S.history}</button></div>
    </section>
    <section class="home-section">
      ${Segmented({ label: "선물 둘러보기", active: "theme", options: [{ value: "theme", label: "선물 테마" }, { value: "category", label: "카테고리" }, { value: "recent", label: "최근 본" }] })}
      <div data-home-grid>${CategoryGrid(toTiles(THEME_TILES))}</div>
    </section>
    <section class="home-section home-section--last">${SectionHeader({ title: S.ranking, info: true })}
      ${ProductGrid(ranking, { variant: "grid3", ranked: true, query: "browse=1" })}</section>`;
}

function renderHomeGrid(tab) {
  const grid = app.querySelector("[data-home-grid]");
  if (tab === "theme") grid.innerHTML = CategoryGrid(toTiles(THEME_TILES));
  if (tab === "category") grid.innerHTML = CategoryGrid(toTiles(CATEGORY_TILES));
  if (tab === "recent") {
    grid.innerHTML = `<p class="recent-title">${S.recentTitle}</p>
      ${ProductGrid(["p16", "p17", "p18", "p19"].map((id) => products.find((p) => p.id === id)), { variant: "mini", query: "browse=1" })}`;
  }
}

function filterFriends(query) {
  const q = query.trim();
  let shown = 0;
  app.querySelectorAll(".friend-cards li").forEach((li) => {
    li.hidden = !li.dataset.name.includes(q);
    shown += li.hidden ? 0 : 1;
  });
  app.querySelector("[data-friend-empty]").hidden = shown > 0;
}

// ---------- SCR-B02: segmented recommendation ----------
function renderRecommend() {
  app.innerHTML = `
    <div class="sticky-top">${AppHeader()}${TopTabs()}</div>
    ${Stepper(S.steps, 1)}
    ${recipient ? `<div class="friend-band">${RecipientCard(recipient, tags, "index.html")}</div>` : ""}
    <div data-banner></div>
    <section class="filter-block" aria-labelledby="filter-h">
      <h2 class="filter-block__head" id="filter-h">${S.filterTitle}${NewBadge()}</h2>
      ${GROUPS.map((g) => `<div class="filter-row" data-group="${g.key}"><span class="filter-row__label">${g.label}</span>
        ${ChipGroup({ label: g.label, active: null, chips: [...g.order.map((v) => ({ value: v, label: g.labels[v] })), ...(g.key === "gender" ? [{ value: "", label: S.all }] : [])] })}</div>`).join("")}
      <div class="filter-block__foot"><span class="filter-block__count" data-count aria-live="polite"></span>
        <button class="reset-btn" type="button" data-action="reset-filters">${icon("undo", { size: 16 })}${S.reset}</button></div>
    </section>
    <section class="home-section" id="reco" data-reco></section>
    <section class="home-section" data-popular></section>
    <section class="home-section home-section--last" id="all-categories">${SectionHeader({ title: S.allCategories })}
      ${ChipGroup({ label: S.allCategories, active: category, chips: [{ value: "all", label: S.all }, ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))] })}
      <div data-categories></div></section>`;
  update();
  renderCategories();
}

function bannerFor(list) {
  const { situation, relation } = filters;
  let title = SITUATION_BANNERS[situation] ?? RELATION_BANNERS[relation] ?? "지금 가장 많이 주고받는\n인기 선물";
  let chip = SITUATION_LABELS[situation] ?? RELATION_LABELS[relation] ?? "추천";
  if (situation === "birthday") {
    chip = "생일 선물 BEST";
    const givenName = recipient?.name.slice(1); // "김지우" → "지우"
    title = tags?.upcomingBirthday
      ? `${givenName}님 생일이\n${tags.birthdayInDays === 0 ? "바로 오늘이에요" : `${tags.birthdayInDays}일 남았어요`} 🎂`
      : "특별한 날을 위한\n생일 선물 모음";
  }
  return {
    chip,
    title,
    image: list[0]?.thumbnail ?? "p-haagen-realblanc",
    color: BANNER_COLORS[situation] ?? BANNER_COLORS[relation] ?? "var(--color-message-blue)",
    href: "#reco",
  };
}

function update() {
  const list = recommend(products, filters);
  const query = productQuery();
  app.querySelectorAll("[data-group]").forEach((row) => {
    const value = filters[row.dataset.group] ?? "";
    row.querySelectorAll(".chip").forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.value === value)));
  });
  app.querySelector("[data-banner]").innerHTML = BannerCarousel([bannerFor(list)], { label: "추천 기획전" });
  app.querySelector("[data-count]").innerHTML = S.count(list.length);
  app.querySelector("[data-reco]").innerHTML = SectionHeader({ title: recipient ? S.forName(recipient.name) : S.forAll }) + (list.length
    ? ProductGrid(list.slice(0, 8), { variant: "grid2", query })
    : EmptyState({ title: S.emptyTitle, caption: S.emptyCaption, actionLabel: S.reset, actionName: "reset-filters" }));
  const segment = [AGE_LABELS[filters.ageGroup], GENDER_LABELS[filters.gender]].filter(Boolean).join(" ");
  app.querySelector("[data-popular]").innerHTML = SectionHeader({ title: S.popular(segment) }) +
    ProductGrid(popularInSegment(products, filters).slice(0, 6), { variant: "grid3", ranked: true, query });
  syncUrl();
}

function renderCategories() {
  const list = products.filter((p) => category === "all" || p.category === category).sort((a, b) => b.popularity - a.popularity);
  app.querySelector("[data-categories]").innerHTML = `<p class="count-line">${list.length}개</p>
    ${ProductGrid(list.slice(0, categoryLimit), { variant: "grid2", query: productQuery() })}
    ${list.length > categoryLimit ? `<button class="more-btn" type="button" data-action="more">${S.more}${icon("chevronDown", { size: 16 })}</button>` : ""}`;
  syncUrl();
}

// ---------- events ----------
app.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  const row = chip?.closest("[data-group]");
  if (row) {
    const key = row.dataset.group;
    const value = chip.dataset.value || null;
    filters = { ...filters, [key]: filters[key] === value ? null : value }; // tap the active chip again to clear it
    update();
  } else if (chip?.closest("#all-categories")) {
    selectOne(chip);
    category = chip.dataset.value;
    categoryLimit = 6;
    renderCategories();
  }
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (action === "reset-filters") { filters = { ...EMPTY_FILTERS }; update(); }
  if (action === "more") { categoryLimit += 6; renderCategories(); }
  if (action === "privacy-tip") {
    const btn = e.target.closest("[data-action]");
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    app.querySelector("#privacy-tip").hidden = !open;
  }
  const seg = e.target.closest(".segmented__item");
  if (seg) { selectOne(seg); renderHomeGrid(seg.dataset.value); }
});
app.addEventListener("input", (e) => {
  if (e.target.matches("[data-friend-search]")) filterFriends(e.target.value);
});

if (isRecommend) renderRecommend();
else renderPick();
app.insertAdjacentHTML("afterend", ScrollTopButton() + BottomNav());
initPage();
if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
