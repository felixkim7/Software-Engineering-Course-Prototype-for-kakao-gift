// Mock KakaoTalk messaging: the gift message to the recipient and in-app notifications.
import { addNotification, consumeDevFlag, getGift, updateGift } from "../core/store.js";

const latency = () => new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 600));

/** Deliver the gift message. On failure the gift stays stored and the buyer can "재전송". */
export async function sendGiftMessage({ giftId }) {
  await latency();
  if (!getGift(giftId)) return { ok: false, code: "UNKNOWN_GIFT", message: "선물 정보를 찾을 수 없어요." };
  if (consumeDevFlag("failNextMessage")) {
    return { ok: false, code: "MESSAGE_FAILED", message: "선물 메시지를 보내지 못했어요. 결제 정보는 안전하게 저장되었어요." };
  }
  return { ok: true };
}

/** "다시 보내기": resend a gift whose message failed; clears `messageFailed` on success. */
export async function resendGiftMessage({ giftId }) {
  const result = await sendGiftMessage({ giftId });
  if (result.ok) updateGift(giftId, { messageFailed: false });
  return result;
}

export async function notify({ userId, giftId, type, text }) {
  const notification = addNotification({ userId, giftId, type, text });
  return { ok: true, notification };
}
