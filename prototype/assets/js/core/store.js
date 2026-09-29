// Single source of state. Everything persists in localStorage["giftProto.v1"].
// Pages read with the getters and change data only through the mutators below.
import { createSeed, orderNo } from "./seed-data.js";

const KEY = "giftProto.v1";
const VERSION = 5; // bump whenever seed-data changes so browsers reseed
const CHANGE_EVENT = "store:change";
const DAY = 24 * 60 * 60 * 1000;

let state = load();
const listeners = new Set();

// Another tab (e.g. hub + buyer + recipient side by side) changed the data → reload so we never overwrite it.
window.addEventListener("storage", (e) => {
  if (e.key !== KEY) return;
  state = load();
  listeners.forEach((fn) => fn(state, { type: "external" }));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { type: "external" } }));
});

export function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved?.version === VERSION) return saved;
  } catch {
    // corrupted JSON → fall through to seed
  }
  return seed();
}

function seed() {
  const fresh = { version: VERSION, ...createSeed(new Date()) };
  localStorage.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}

function save(change) {
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((fn) => fn(state, change));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: change }));
}

/** Call fn(state, change) after every change. Returns an unsubscribe function. */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function resetDemoData() {
  state = seed();
  save({ type: "reset" });
}

// ---------- getters ----------
export const getState = () => state;
export const getUser = (id) => state.users.find((u) => u.id === id);
export const getProduct = (id) => state.products.find((p) => p.id === id);
export const getSeller = (id) => state.sellers.find((s) => s.id === id);
export const getGift = (id) => state.gifts.find((g) => g.id === id);
export const listProducts = () => state.products;
export const getWallet = (userId) => state.wallets.find((w) => w.userId === userId) ?? { userId, balance: 0, ledger: [] };
export const getDevFlags = () => state.devFlags;
export const getCurrentUserId = () => state.session.currentUserId;
export const getCurrentUser = () => getUser(state.session.currentUserId);

/** Filter gifts by any combination of buyerId / recipientId / sellerId (newest first). */
export function listGiftsBy({ buyerId, recipientId, sellerId } = {}) {
  return state.gifts
    .filter((g) => !buyerId || g.buyerId === buyerId)
    .filter((g) => !recipientId || g.recipientId === recipientId)
    .filter((g) => !sellerId || getProduct(g.productId)?.sellerId === sellerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listNotifications(userId) {
  return state.notifications.filter((n) => n.userId === userId).sort((a, b) => b.at.localeCompare(a.at));
}

// ---------- mutators ----------
/**
 * Recipient pages act as u1 by default. `?as=u2` switches the viewing recipient and is remembered
 * for the other recipient pages (buyer pages set u0 separately). Returns the recipient's id.
 */
export function useRecipientSession(asParam) {
  const wanted = asParam && getUser(asParam) ? asParam : state.session.recipientId ?? "u1";
  if (state.session.recipientId !== wanted || state.session.currentUserId !== wanted) {
    state.session.recipientId = wanted;
    state.session.currentUserId = wanted;
    save({ type: "session", userId: wanted });
  }
  return wanted;
}

export function setCurrentUser(userId) {
  state.session.currentUserId = userId;
  save({ type: "session", userId });
}

/**
 * Create a gift in status SENT. `data` needs buyerId, recipientId, productId, amount; the rest is optional.
 * Idempotent per payment: a second call with the same `paymentTxId` returns the existing gift (no duplicate order).
 */
export function createGift(data) {
  const existing = data.paymentTxId && state.gifts.find((g) => g.paymentTxId === data.paymentTxId);
  if (existing) return existing;
  const now = new Date();
  const seq = state.nextSeq++;
  const deadline = new Date(now.getTime() + 30 * DAY);
  deadline.setHours(23, 59, 59, 0);
  const product = getProduct(data.productId);
  const gift = {
    id: `g${3000 + seq}`,
    orderNo: orderNo(now, 120 + seq),
    optionId: null, quantity: 1, message: "", cardTheme: "birthday", paymentMethod: "card",
    ...data,
    status: "SENT",
    createdAt: now.toISOString(),
    decisionDeadline: deadline.toISOString(),
    delivery: product?.type === "delivery"
      ? { receiverName: "", phone: "", zip: "", address1: "", address2: "", memo: "", courier: "", trackingNo: "", shippedAt: null, deliveredAt: null }
      : null,
    history: [{ at: now.toISOString(), status: "SENT", note: "결제 완료, 선물 전송" }],
    settlement: null,
  };
  state.gifts.push(gift);
  save({ type: "gift:create", giftId: gift.id });
  return gift;
}

/** Shallow-merge `patch` into a gift (nested `delivery` is merged too). Use state-machine.js for status changes. */
export function updateGift(id, patch) {
  const gift = getGift(id);
  if (!gift) throw new Error(`Unknown gift ${id}`);
  const { delivery, ...rest } = patch;
  Object.assign(gift, rest);
  if (delivery) gift.delivery = { ...gift.delivery, ...delivery };
  save({ type: "gift:update", giftId: id });
  return gift;
}

export function addNotification({ userId, giftId, type, text }) {
  const n = { id: `n${Date.now()}${Math.floor(Math.random() * 1000)}`, userId, giftId, type, text, read: false, at: new Date().toISOString() };
  state.notifications.push(n);
  save({ type: "notification", userId });
  return n;
}

export function markNotificationsRead(userId) {
  const unread = state.notifications.filter((n) => n.userId === userId && !n.read);
  if (!unread.length) return;
  unread.forEach((n) => (n.read = true));
  save({ type: "notification:read", userId });
}

export function creditWallet(userId, amount, giftId, reason) {
  let wallet = state.wallets.find((w) => w.userId === userId);
  if (!wallet) state.wallets.push((wallet = { userId, balance: 0, ledger: [] }));
  wallet.balance += amount;
  wallet.ledger.push({ at: new Date().toISOString(), amount, giftId, reason });
  save({ type: "wallet", userId });
  return wallet;
}

export function setDevFlag(name, value) {
  state.devFlags[name] = value;
  save({ type: "devFlag", name });
}

/** Returns true (and turns the flag off) if a one-shot failure flag is set. Used by mock services. */
export function consumeDevFlag(name) {
  if (!state.devFlags[name]) return false;
  setDevFlag(name, false);
  return true;
}

export const getIdempotentResult = (key) => state.idempotency[key];

export function saveIdempotentResult(key, result) {
  state.idempotency[key] = result;
  save({ type: "idempotency", key });
}
