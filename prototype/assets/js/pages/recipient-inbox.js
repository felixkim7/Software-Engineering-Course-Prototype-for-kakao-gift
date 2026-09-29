// SCR-R01 Gift inbox — UC-R1. recipient/index.html (?as=u2 to view as another recipient)
import { escapeHtml, formatDate, givenName } from "../core/format.js";
import { getProduct, getUser, listGiftsBy, subscribe, useRecipientSession } from "../core/store.js";
import { AppHeader, EmptyState, StatusBadge, Thumb, UnderlineTabs, initPage, selectOne } from "../ui/components.js";
import { DeadlineChip, GiftBubble } from "../ui/recipient.js";

const S = {
  title: "받은 선물함",
  owner: (name) => `${name}님이 받은 선물`,
  from: "From.",
  tabs: { usable: "사용 가능", delivery: "배송", done: "완료" },
  empty: { usable: "사용할 수 있는 선물이 없어요", delivery: "배송 중인 선물이 없어요", done: "완료된 선물이 없어요" },
  emptyCaption: "친구에게 선물을 받으면 여기에 보여요.",
};
const TAB_STATUSES = {
  usable: ["SENT", "OPENED"],
  delivery: ["ADDRESS_SUBMITTED", "SHIPPED"],
  done: ["DELIVERED", "USED", "CONVERTED", "DECLINED_REFUNDED"],
};

const me = useRecipientSession(new URLSearchParams(location.search).get("as"));
const app = document.querySelector("#app");
let tab = "usable";

const giftsIn = (key) => listGiftsBy({ recipientId: me }).filter((g) => TAB_STATUSES[key].includes(g.status));

function InboxCard(g) {
  const product = getProduct(g.productId);
  const buyer = getUser(g.buyerId);
  return `<a class="inbox-card ${g.status === "SENT" ? "is-new" : ""}" href="gift.html?gift=${g.id}">
    ${g.status === "SENT" ? GiftBubble(g) : ""}
    <span class="inbox-card__row"><span class="gift-info__thumb">${Thumb(product.thumbnail)}</span>
      <span class="inbox-card__info"><span class="inbox-card__brand">${escapeHtml(product.brand)}</span>
        <span class="inbox-card__name">${escapeHtml(product.name)}</span>
        <span class="inbox-card__from">${S.from} ${escapeHtml(buyer?.name ?? "")} · ${formatDate(g.createdAt)}</span></span></span>
    <span class="inbox-card__foot">${StatusBadge(g.status, "recipient")}${DeadlineChip(g)}</span>
  </a>`;
}

function render() {
  const tabs = Object.entries(S.tabs).map(([value, label]) => ({ value, label: `${label} ${giftsIn(value).length}` }));
  app.innerHTML = `
    <div class="sticky-top">${AppHeader({ variant: "sub", title: S.title })}</div>
    <p class="inbox-owner">${S.owner(escapeHtml(givenName(getUser(me).name)))}</p>
    ${UnderlineTabs({ label: S.title, active: tab, options: tabs })}
    <div class="inbox-list" data-list></div>`;
  renderList();
}

function renderList() {
  const gifts = giftsIn(tab);
  app.querySelector("[data-list]").innerHTML = gifts.length
    ? gifts.map(InboxCard).join("")
    : EmptyState({ title: S.empty[tab], caption: S.emptyCaption });
}

app.addEventListener("click", (e) => {
  const tabBtn = e.target.closest(".utabs__item");
  if (!tabBtn) return;
  selectOne(tabBtn);
  tab = tabBtn.dataset.value;
  renderList();
});
subscribe(render); // a gift sent from the buyer tab shows up without a reload

render();
initPage();
