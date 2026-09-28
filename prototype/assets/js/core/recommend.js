// Segmented recommendation (UC-B2 steps 2–3). Pure functions — no DOM, no store.
// Privacy rule: buyer UI only ever sees the derived tags, never birthDate.
//
// How a product is scored against the chips (관계 / 상황 / 연령대 / 성별):
//   points = 3·관계 + 3·상황 + 2·연령대 + 1·성별      (1 if the product's tags include the chip, else 0;
//                                                     a group with nothing selected always counts as a match)
//   score  = points + popularity / 50                (0–2 bonus: popular items win ties)
// A product is recommended when points ≥ 8 of 9: 관계, 상황 and 연령대 must fit; 성별 only adds a bonus.
// Results are sorted by score, then popularity.
import { AGE_LABELS, GENDER_LABELS, RELATION_LABELS } from "./strings.js";

export const WEIGHTS = { relation: 3, situation: 3, ageGroup: 2, gender: 1 };
export const MIN_POINTS = 8;
export const EMPTY_FILTERS = { relation: null, situation: null, ageGroup: null, gender: null };

const TAG_KEY = { relation: "relations", situation: "situations", ageGroup: "ageGroups", gender: "gender" };
const DAY = 24 * 60 * 60 * 1000;
const BIRTHDAY_WINDOW_DAYS = 7;

export function matchPoints(product, filters) {
  return Object.entries(WEIGHTS).reduce((sum, [group, weight]) => {
    const wanted = filters[group];
    return sum + (!wanted || product.tags[TAG_KEY[group]].includes(wanted) ? weight : 0);
  }, 0);
}

export const score = (product, filters) => matchPoints(product, filters) + product.popularity / 50;

export function recommend(products, filters) {
  return products
    .filter((p) => matchPoints(p, filters) >= MIN_POINTS)
    .sort((a, b) => score(b, filters) - score(a, filters) || b.popularity - a.popularity);
}

/** "20대 여성 인기 선물" — only age group and gender, sorted by popularity (alt flow 3a). */
export function popularInSegment(products, { ageGroup, gender }) {
  return products
    .filter((p) => (!ageGroup || p.tags.ageGroups.includes(ageGroup)) && (!gender || p.tags.gender.includes(gender)))
    .sort((a, b) => b.popularity - a.popularity);
}

/** Chips pre-filled from a recipient's derived tags (situation = 생일 only when the birthday is near). */
export function filtersFromTags(tags) {
  return { relation: tags.relation ?? null, situation: tags.upcomingBirthday ? "birthday" : null, ageGroup: tags.ageGroup, gender: tags.gender };
}

function ageGroupOf(age) {
  if (age < 20) return "10s";
  if (age < 30) return "20s";
  if (age < 40) return "30s";
  if (age < 50) return "40s";
  return "50s+";
}

/** user → { ageGroup, gender, relation, upcomingBirthday, birthdayInDays } */
export function deriveProfileTags(user, now = new Date()) {
  const [year, month, day] = user.birthDate.split("-").map(Number); // parse as local date, not UTC
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisYears = new Date(today.getFullYear(), month - 1, day);
  const next = thisYears < today ? new Date(today.getFullYear() + 1, month - 1, day) : thisYears;
  const birthdayInDays = Math.round((next - today) / DAY);
  const age = today.getFullYear() - year - (thisYears <= today ? 0 : 1);

  return {
    ageGroup: ageGroupOf(age),
    gender: user.gender,
    relation: user.relation,
    upcomingBirthday: birthdayInDays <= BIRTHDAY_WINDOW_DAYS,
    birthdayInDays,
  };
}

export const birthdayLabel = (tags) => `🎂 ${tags.birthdayInDays === 0 ? "오늘 생일" : `D-${tags.birthdayInDays}`}`;

/** Derived tags → chip labels, e.g. ["20대", "여성", "친구", "🎂 D-3"] */
export function tagLabels(tags) {
  const labels = [AGE_LABELS[tags.ageGroup], GENDER_LABELS[tags.gender], RELATION_LABELS[tags.relation]].filter(Boolean);
  if (tags.upcomingBirthday) labels.push(birthdayLabel(tags));
  return labels;
}
