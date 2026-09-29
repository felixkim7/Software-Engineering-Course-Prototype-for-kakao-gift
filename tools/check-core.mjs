// Self-check for the core logic (store, state machine, mock services). Run: node tools/check-core.mjs
import assert from "node:assert/strict";

// Minimal browser shims so the ES modules run in Node.
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};
globalThis.window = new EventTarget();

const js = "../prototype/assets/js";
const store = await import(`${js}/core/store.js`);
const { transition, canDecide, IllegalTransitionError } = await import(`${js}/core/state-machine.js`);
const { pay, convertToCash } = await import(`${js}/services/payment-service.js`);
const { registerTracking } = await import(`${js}/services/delivery-service.js`);
const { deriveProfileTags, tagLabels, filtersFromTags, recommend, popularInSegment, score, EMPTY_FILTERS } = await import(`${js}/core/recommend.js`);
const fmt = await import(`${js}/core/format.js`);

// Seed shape (data-model.md §5)
const s = store.getState();
assert.equal(s.products.length >= 30, true);
assert.equal(s.products.filter((p) => !p.convertible).length >= 2, true);
assert.equal(store.listGiftsBy({ recipientId: "u1" }).length, 5);
const s1 = store.listGiftsBy({ sellerId: "s1" }).filter((g) => g.id.startsWith("g2"));
const count = (st) => s1.filter((g) => g.status === st).length;
assert.deepEqual([count("ADDRESS_SUBMITTED"), count("SHIPPED"), count("DELIVERED"), count("CONVERTED"), count("DECLINED_REFUNDED")], [5, 3, 2, 1, 1]);
assert.match(s.gifts[0].orderNo, /^\d{8}-\d{6}$/);

// Privacy: derived tags only; u1's birthday is 3 days away on any demo day
const tags = deriveProfileTags(store.getUser("u1"));
assert.deepEqual(tagLabels(tags), ["20대", "여성", "친구", "🎂 D-3"]);

// Segmented recommendation (Phase 1): pre-fill, threshold, ordering, empty result, neutral = everything
const f1 = filtersFromTags(tags);
assert.deepEqual(f1, { relation: "friend", situation: "birthday", ageGroup: "20s", gender: "F" });
const list = recommend(s.products, f1);
assert.equal(list.length, 14);
assert.ok(list.every((p, i) => i === 0 || score(list[i - 1], f1) >= score(p, f1)));
assert.equal(recommend(s.products, { relation: "friend", situation: "cheer", ageGroup: "50s+", gender: "M" }).length, 0);
assert.equal(recommend(s.products, EMPTY_FILTERS).length, s.products.length);
assert.ok(popularInSegment(s.products, { ageGroup: "20s", gender: "F" }).every((p) => p.tags.ageGroups.includes("20s") && p.tags.gender.includes("F")));

// State machine
assert.throws(() => transition("g1003", "SHIPPED"), IllegalTransitionError); // DELIVERED is terminal
transition("g1001", "OPENED", "선물 확인");
assert.equal(store.getGift("g1001").status, "OPENED");
assert.equal(store.getGift("g1001").history.at(-1).status, "OPENED");
assert.deepEqual(canDecide(store.getGift("g1001"), "u1"), { ok: true });
assert.equal(canDecide(store.getGift("g1001"), "u0").reason, "NOT_RECIPIENT");
assert.equal(canDecide(store.getGift("g1003"), "u1").reason, "ALREADY_USED");
const late = new Date(Date.now() + 40 * 24 * 60 * 60 * 1000);
assert.equal(canDecide(store.getGift("g1001"), "u1", late).reason, "DEADLINE_PASSED");

// Payment: idempotency, in-flight double click, failure injection auto-resets
const [a, b] = await Promise.all([pay({ amount: 9000, method: "card", idempotencyKey: "k1" }), pay({ amount: 9000, method: "card", idempotencyKey: "k1" })]);
assert.equal(a.ok, true);
assert.equal(a.txId, b.txId);
assert.equal((await pay({ amount: 9000, method: "card", idempotencyKey: "k1" })).txId, a.txId);
store.setDevFlag("failNextPayment", true);
const failed = await pay({ amount: 9000, method: "card", idempotencyKey: "k2" });
assert.equal(failed.code, "PAYMENT_DECLINED");
assert.equal(store.getDevFlags().failNextPayment, false);
assert.equal((await pay({ amount: 9000, method: "card", idempotencyKey: "k2" })).ok, true); // retry with same key works
store.setDevFlag("failNextSettlement", true);
assert.equal((await convertToCash({ giftId: "g1001", userId: "u1", amount: 32900, idempotencyKey: "c1" })).ok, false);

// Checkout reliability (Phase 2): one gift per payment txId, notifications marked read, message resend
const { sendGiftMessage, resendGiftMessage } = await import(`${js}/services/messaging-service.js`);
const before = store.getState().gifts.length;
const g1 = store.createGift({ buyerId: "u0", recipientId: "u1", productId: "p20", amount: 13500, paymentTxId: "tx_same" });
const g2 = store.createGift({ buyerId: "u0", recipientId: "u1", productId: "p20", amount: 13500, paymentTxId: "tx_same" });
assert.equal(g1.id, g2.id);
assert.equal(store.getState().gifts.length, before + 1);
assert.equal(g1.status, "SENT");
store.markNotificationsRead("u0");
assert.ok(store.listNotifications("u0").every((n) => n.read));
store.setDevFlag("failNextMessage", true);
assert.equal((await sendGiftMessage({ giftId: g1.id })).code, "MESSAGE_FAILED");
store.updateGift(g1.id, { messageFailed: true });
assert.equal((await resendGiftMessage({ giftId: g1.id })).ok, true);
assert.equal(store.getGift(g1.id).messageFailed, false);

// Recipient session (Phase 3): ?as= switches and is remembered; unknown ids are ignored
assert.equal(store.useRecipientSession("u2"), "u2");
assert.equal(store.useRecipientSession(null), "u2");
assert.equal(store.useRecipientSession("nobody"), "u2");
assert.equal(store.getCurrentUserId(), "u2");
assert.equal(store.useRecipientSession("u1"), "u1");

// Delivery: validation + ship
assert.equal((await registerTracking({ giftId: "g2001", courier: "CJ대한통운", trackingNo: "12ab" })).code, "INVALID_TRACKING_NO");
assert.equal((await registerTracking({ giftId: "g2001", courier: "CJ대한통운", trackingNo: "681234567890" })).ok, true);
assert.equal(store.getGift("g2001").status, "SHIPPED");

// Format
assert.equal(fmt.formatKRW(32900), "32,900원");
assert.equal(fmt.formatCount(58000), "5.8만");
assert.equal(fmt.maskPhone("010-1234-5678"), "010-****-5678");
assert.equal(fmt.maskName("김지우"), "김*우");
assert.equal(fmt.escapeHtml('<b>"hi"</b>'), "&lt;b&gt;&quot;hi&quot;&lt;/b&gt;");

// UC-R3 decline / convert (Phase 4): preconditions, alt 8a, no double processing, notifications
const { decideGift } = await import(`${js}/services/decision-service.js`);
store.resetDemoData();
const decide = (giftId, userId, choice = "convert") => decideGift({ giftId, userId, choice });
assert.equal((await decide("g1005", "u1")).code, "NOT_CONVERTIBLE");
assert.equal((await decide("g1004", "u1")).code, "DEADLINE_PASSED");
assert.equal((await decide("g1001", "u2")).code, "NOT_RECIPIENT");
assert.equal((await decide("g1003", "u1")).code, "ALREADY_USED");
store.setDevFlag("failNextSettlement", true);
assert.equal((await decide("g1001", "u1")).ok, false);
assert.equal(store.getGift("g1001").status, "SENT"); // alt 8a: unchanged
assert.equal(store.getWallet("u1").balance, 0);
const buyerNotes = store.listNotifications("u0").length;
const runs = await Promise.all([1, 2, 3].map(() => decide("g1001", "u1"))); // triple click, same key as the failed try
assert.ok(runs.every((r) => r.ok));
assert.equal(new Set(runs.map((r) => r.settlement.txId)).size, 1);
assert.equal(store.getGift("g1001").status, "CONVERTED");
assert.equal(store.getWallet("u1").balance, 32900);
assert.equal(store.getWallet("u1").ledger.length, 1);
assert.equal(store.listNotifications("u0").length, buyerNotes); // convert: buyer NOT notified
assert.ok(!store.getGift("g1001").processing);
assert.equal((await decide("g1001", "u1")).code, "ALREADY_DECIDED");
assert.ok((await decide("g1002", "u1", "decline")).ok);
assert.equal(store.getGift("g1002").status, "DECLINED_REFUNDED");
assert.equal(store.getGift("g1002").settlement.type, "REFUND");
assert.match(store.listNotifications("u5")[0].text, /지우님이 선물을 거절하여 13,500원이 환불되었어요/);

// Reset + persistence
store.resetDemoData();
assert.equal(store.getGift("g1001").status, "SENT");
assert.equal(JSON.parse(localStorage.getItem("giftProto.v1")).gifts.find((g) => g.id === "g2001").status, "ADDRESS_SUBMITTED");

console.log("core check: all passed");
