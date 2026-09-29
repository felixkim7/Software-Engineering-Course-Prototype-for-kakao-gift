// Demo-only chrome: the floating "역할 전환" menu and presentation mode.
// ?present=1 turns presentation mode on (remembered until ?present=0 or the hub toggle): it hides the role
// switcher and every element marked .demo-helper (helper links, dev buttons). NEW pills stay (own hub toggle).
import { getDevFlags, setDevFlag } from "../core/store.js";
import { icon } from "./icons.js";

const url = (path) => new URL(`../../../${path}`, import.meta.url).href;
const ROLES = [["데모 허브", "index.html"], ["구매자", "buyer/"], ["수령자", "recipient/?as=u1"], ["판매자 센터", "seller/"]];

export function applyDemoMode() {
  const present = new URLSearchParams(location.search).get("present");
  if (present !== null && Boolean(getDevFlags().presentMode) !== (present !== "0")) setDevFlag("presentMode", present !== "0");
  document.documentElement.classList.toggle("is-present", Boolean(getDevFlags().presentMode));
  if (!document.body.classList.contains("hub-page")) mountRoleSwitch();
}

function mountRoleSwitch() {
  if (document.querySelector(".role-switch")) return;
  document.body.insertAdjacentHTML("beforeend", `<details class="role-switch demo-helper">
    <summary>${icon("user", { size: 16 })}역할 전환</summary>
    <nav aria-label="역할 전환">${ROLES.map(([label, path]) => `<a href="${url(path)}">${label}</a>`).join("")}</nav>
  </details>`);
}
