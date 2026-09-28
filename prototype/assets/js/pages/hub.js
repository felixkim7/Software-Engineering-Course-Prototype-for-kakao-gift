// SCR-00 Demo hub — role switch, demo data reset, failure-injection toggles, component gallery.
import { getDevFlags, resetDemoData, setCurrentUser, setDevFlag, subscribe } from "../core/store.js";
import { initPage, imgSrc } from "../ui/components.js";
import { renderGallery } from "../ui/gallery.js";
import { toast } from "../ui/overlays.js";

const S = {
  label: "CSE4115 prototype",
  title: "카카오톡 선물하기 To-Be 프로토타입",
  course: "CSE4115 Team Assignment 1 · 재구축 서비스 정의",
  sub: "역할을 골라 유스케이스 시나리오를 따라가 보세요. 데이터는 이 브라우저에만 저장됩니다.",
  rolesTitle: "역할 선택",
  open: "열기",
  controlsTitle: "데모 설정",
  reset: "데모 데이터 초기화",
  resetDone: "데모 데이터를 처음 상태로 되돌렸어요.",
  galleryTitle: "컴포넌트 갤러리 (Phase 0 확인용)",
};

const ROLES = [
  { name: "구매자", device: "모바일", href: "buyer/", userId: "u0", image: "kakao-ryan-card",
    ucs: [["UC-B1", "수령자 결정"], ["UC-B2", "선물 검색·구매 (세분화 추천)"], ["UC-B3", "선물 구매 내역 조회"]] },
  { name: "수령자", device: "모바일", href: "recipient/", userId: "u1", image: "msg-theme-2",
    ucs: [["UC-R1", "선물 확인"], ["UC-R2", "배송상품 수령 (옵션·배송지)"], ["UC-R3", "선물 거절 · 금액 전환 ★"]] },
  { name: "판매자 센터", device: "데스크톱", href: "seller/", userId: null, image: "list-exchange",
    ucs: [["UC-S1", "주문·배송 정보 통합 조회 · 엑셀"], ["UC-S2", "발송 처리 · 송장 일괄 업로드"]] },
];

const FLAGS = [
  ["failNextPayment", "다음 결제 실패 (UC-B2 8a)"],
  ["failNextSettlement", "다음 환불·금액 전환 실패 (UC-R3 8a)"],
  ["failNextMessage", "다음 선물 메시지 전송 실패"],
  ["showNewBadges", "NEW 배지 표시"],
];

function render() {
  document.querySelector("#app").innerHTML = `
    <span class="hub__label">${S.label}</span>
    <h1 class="hub__title"><img src="${imgSrc("kakao-talk")}" alt="">${S.title}</h1>
    <p class="hub__sub">${S.course}<br>${S.sub}</p>

    <section class="hub__section" aria-labelledby="roles-h"><h2 class="hub__h2" id="roles-h">${S.rolesTitle}</h2>
      <div class="roles">${ROLES.map((r) => `
        <article class="role-card">
          <div class="role-card__top"><span class="role-card__img"><img class="thumb" src="${imgSrc(r.image)}" alt=""></span>
            <div><p class="role-card__name">${r.name}</p><p class="role-card__device">${r.device}</p></div></div>
          <ul class="role-card__ucs">${r.ucs.map(([id, text]) => `<li><code>${id}</code>${text}</li>`).join("")}</ul>
          <a class="btn btn--primary" href="${r.href}" ${r.userId ? `data-user="${r.userId}"` : ""}>${r.name} ${S.open}</a>
        </article>`).join("")}</div></section>

    <section class="hub__section panel" aria-labelledby="controls-h"><h2 class="hub__h2" id="controls-h">${S.controlsTitle}</h2>
      <div class="controls">
        <button class="btn btn--dark" type="button" data-action="reset">${S.reset}</button>
        ${FLAGS.map(([key, label]) => `<label class="switch"><input type="checkbox" data-flag="${key}">${label}</label>`).join("")}
      </div></section>

    <details class="hub__section gallery" id="gallery" ${location.hash === "#gallery" ? "open" : ""}><summary>${S.galleryTitle}</summary><div data-gallery></div></details>`;
}

function syncFlags() {
  const flags = getDevFlags();
  document.querySelectorAll("[data-flag]").forEach((input) => (input.checked = !!flags[input.dataset.flag]));
  document.documentElement.classList.toggle("hide-new", !flags.showNewBadges);
}

render();
initPage();
syncFlags();
renderGallery(document.querySelector("[data-gallery]"));
subscribe(syncFlags); // flags auto-reset after a service consumes them (also from other tabs)

document.addEventListener("click", (e) => {
  const roleLink = e.target.closest("[data-user]");
  if (roleLink) setCurrentUser(roleLink.dataset.user);
  if (e.target.closest('[data-action="reset"]')) {
    resetDemoData();
    renderGallery(document.querySelector("[data-gallery]"));
    toast(S.resetDone);
  }
});
document.addEventListener("change", (e) => {
  const flag = e.target.dataset.flag;
  if (flag) setDevFlag(flag, e.target.checked);
});
