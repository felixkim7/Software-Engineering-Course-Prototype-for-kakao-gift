// Friend picker + recipient summary card (SCR-B01 / SCR-B02), styled after the real home's friend band.
// Only derived tags are shown — never birthDate or exact age (privacy requirement).
import { escapeHtml } from "../core/format.js";
import { RELATION_LABELS } from "../core/strings.js";
import { birthdayLabel, deriveProfileTags, tagLabels } from "../core/recommend.js";
import { Avatar } from "./components.js";
import { icon } from "./icons.js";

const PRIVACY_NOTE = "받는 분의 정보는 추천에만 사용되며 구매자에게 공개되지 않아요.";

/** Friends of the buyer, upcoming birthdays first (soonest first), then by name. */
export function sortFriends(users, now = new Date()) {
  return users
    .filter((u) => u.relation)
    .map((user) => ({ user, tags: deriveProfileTags(user, now) }))
    .sort((a, b) =>
      (b.tags.upcomingBirthday - a.tags.upcomingBirthday) ||
      (a.tags.upcomingBirthday ? a.tags.birthdayInDays - b.tags.birthdayInDays : 0) ||
      a.user.name.localeCompare(b.user.name, "ko"));
}

/** Horizontal row of narrow friend cards. hrefFor(user) → link target. */
export function FriendCards(friends, hrefFor) {
  return `<ul class="friend-cards" aria-label="친구 목록">${friends.map(({ user, tags }) => `
    <li data-name="${escapeHtml(user.name)}"><a class="friend-card" href="${hrefFor(user)}">
      <span class="friend-card__avatar">${Avatar(user)}${tags.upcomingBirthday ? `<span class="pill-badge">${birthdayLabel(tags)}</span>` : ""}</span>
      <span class="friend-card__name">${escapeHtml(user.name)}</span>
      <span class="friend-card__caption">${tags.upcomingBirthday ? "생일 친구" : RELATION_LABELS[user.relation]}</span>
    </a></li>`).join("")}</ul>`;
}

/** Recipient summary (164602 style): avatar, "지우에게 선물하기", 수정, derived tags + privacy tooltip. */
export function RecipientCard(user, tags, changeHref) {
  const labels = tagLabels(tags).filter((l) => !l.startsWith("🎂"));
  return `<section class="recipient-card" aria-label="받는 사람">
    <div class="recipient-card__top">
      ${Avatar(user, { size: "l" })}
      <p class="recipient-card__title"><b>${escapeHtml(user.name)}</b>에게 선물하기</p>
      <a class="mini-btn" href="${changeHref}" aria-label="받는 사람 변경">${icon("userPlus", { size: 16, strokeWidth: 1.5 })}수정</a>
    </div>
    <div class="recipient-card__bottom">
      <p class="recipient-card__tags">${labels.map(escapeHtml).join(" · ")}
        <button class="tip-btn" type="button" data-action="privacy-tip" aria-expanded="false" aria-controls="privacy-tip" aria-label="추천 정보 안내">${icon("info", { size: 16, strokeWidth: 1.5 })}</button>
      </p>
      ${tags.upcomingBirthday ? `<span class="outline-pill">${birthdayLabel(tags)}</span>` : ""}
    </div>
    <p class="tooltip" id="privacy-tip" role="note" hidden>${PRIVACY_NOTE}</p>
  </section>`;
}
