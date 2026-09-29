// Placeholder for the seller center until Phase 5.
import { setCurrentUser } from "../core/store.js";
import { AppHeader, EmptyState, initPage } from "../ui/components.js";

const ROLE = document.body.dataset.role;
const HUB = { actionLabel: "데모 허브로", actionHref: "../index.html" };

const CONFIG = {
  seller: { title: "주문·배송 통합 관리 준비 중", caption: "주문번호 기준 통합 목록과 엑셀 다운로드는 Phase 5에서 만들어져요.", ...HUB },
}[ROLE];

if (CONFIG.userId) setCurrentUser(CONFIG.userId);
const empty = EmptyState(CONFIG);
const app = document.querySelector("#app");

app.innerHTML = ROLE === "seller"
  ? `<h1 class="seller__h1">주문·배송 관리</h1><div class="card">${empty}</div>`
  : `<div class="sticky-top">${CONFIG.header}</div>${empty}`;

initPage();
