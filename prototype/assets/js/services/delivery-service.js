// Mock courier sync. Registering tracking ships the order; advanceDelivery is the demo "배송 완료" button.
import { getGift, updateGift } from "../core/store.js";
import { transition } from "../core/state-machine.js";
import { COURIERS } from "../core/strings.js";

const latency = () => new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 600));
const TRACKING_NO = /^\d{10,14}$/;

/** Validate without side effects — used for inline and bulk (Excel) upload rows. */
export function validateTracking({ courier, trackingNo }) {
  if (!COURIERS.includes(courier)) return { ok: false, code: "UNKNOWN_COURIER", message: "택배사를 선택해 주세요." };
  if (!TRACKING_NO.test(String(trackingNo).replaceAll("-", ""))) {
    return { ok: false, code: "INVALID_TRACKING_NO", message: "운송장 번호는 숫자 10~14자리입니다." };
  }
  return { ok: true };
}

export async function registerTracking({ giftId, courier, trackingNo }) {
  await latency();
  const check = validateTracking({ courier, trackingNo });
  if (!check.ok) return check;
  const gift = getGift(giftId);
  if (gift?.status !== "ADDRESS_SUBMITTED") return { ok: false, code: "NOT_READY", message: "발송 대기 상태의 주문만 등록할 수 있어요." };
  updateGift(giftId, { delivery: { courier, trackingNo: String(trackingNo).replaceAll("-", ""), shippedAt: new Date().toISOString() } });
  transition(giftId, "SHIPPED", `${courier} ${trackingNo}`);
  return { ok: true };
}

export async function advanceDelivery({ giftId }) {
  await latency();
  if (getGift(giftId)?.status !== "SHIPPED") return { ok: false, code: "NOT_SHIPPED", message: "배송 중인 주문이 아닙니다." };
  updateGift(giftId, { delivery: { deliveredAt: new Date().toISOString() } });
  transition(giftId, "DELIVERED", "배송 완료");
  return { ok: true };
}
