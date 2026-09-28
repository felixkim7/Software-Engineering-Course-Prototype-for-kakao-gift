// Placeholder for screens built in later phases (recipient → Phase 3, checkout → Phase 2, seller → Phase 5).
import { getUser, setCurrentUser } from "../core/store.js";
import { AppHeader, EmptyState, initPage } from "../ui/components.js";

const ROLE = document.body.dataset.role;
const HUB = { actionLabel: "데모 허브로", actionHref: "../index.html" };
const to = getUser(new URLSearchParams(location.search).get("to"));

const CONFIG = {
  recipient: { title: "받은 선물함 준비 중", caption: "선물함과 선물 확인 화면은 Phase 3에서 만들어져요.", userId: "u1", header: AppHeader({ variant: "sub", title: "선물함" }), ...HUB },
  checkout: {
    title: "결제 화면 준비 중", caption: "메시지 카드와 결제는 Phase 2에서 만들어져요.", userId: "u0",
    header: AppHeader({ variant: "modal", title: to ? `${to.name}에게` : "주문/결제" }), actionLabel: "선물하기 홈으로", actionHref: "index.html",
  },
  seller: { title: "주문·배송 통합 관리 준비 중", caption: "주문번호 기준 통합 목록과 엑셀 다운로드는 Phase 5에서 만들어져요.", ...HUB },
}[ROLE];

if (CONFIG.userId) setCurrentUser(CONFIG.userId);
const empty = EmptyState(CONFIG);
const app = document.querySelector("#app");

app.innerHTML = ROLE === "seller"
  ? `<h1 class="seller__h1">주문·배송 관리</h1><div class="card">${empty}</div>`
  : `<div class="sticky-top">${CONFIG.header}</div>${empty}`;

initPage();
