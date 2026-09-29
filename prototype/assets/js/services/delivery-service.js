// Mock courier sync. Registering tracking ships the order; advanceDelivery is the demo "배송 완료" button.
import { getGift, updateGift } from "../core/store.js";
import { transition } from "../core/state-machine.js";
import { COURIERS } from "../core/strings.js";

const latency = () => new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 600));
const TRACKING_NO = /^\d{10,13}$/;

/** Validate without side effects — used for inline and bulk (Excel) upload rows. */
export function validateTracking({ courier, trackingNo }) {
  if (!COURIERS.includes(courier)) return { ok: false, code: "UNKNOWN_COURIER", message: "택배사를 선택해 주세요." };
  if (!TRACKING_NO.test(String(trackingNo).replaceAll("-", ""))) {
    return { ok: false, code: "INVALID_TRACKING_NO", message: "송장번호는 숫자 10~13자리예요." };
  }
  return { ok: true };
}

export async function registerTracking({ giftId, courier, trackingNo }) {
  await latency();
  const check = validateTracking({ courier, trackingNo });
  if (!check.ok) return check;
  const gift = getGift(giftId);
  if (gift?.status !== "ADDRESS_SUBMITTED") return { ok: false, code: "NOT_READY", message: "발송 대기 상태의 주문만 등록할 수 있어요." };
  const number = String(trackingNo).replaceAll("-", "");
  updateGift(giftId, { delivery: { courier, trackingNo: number, shippedAt: new Date().toISOString() } });
  transition(giftId, "SHIPPED", `${courier} ${number}`);
  return { ok: true };
}

/** One courier sync for many rows (bulk Excel upload). Each item is re-validated; returns per-row results. */
export async function registerTrackingBulk(items) {
  await latency();
  return items.map(({ giftId, courier, trackingNo }) => {
    const check = validateTracking({ courier, trackingNo });
    if (!check.ok) return { giftId, ...check };
    if (getGift(giftId)?.status !== "ADDRESS_SUBMITTED") return { giftId, ok: false, code: "NOT_READY" };
    const number = String(trackingNo).replaceAll("-", "");
    updateGift(giftId, { delivery: { courier, trackingNo: number, shippedAt: new Date().toISOString() } });
    transition(giftId, "SHIPPED", `${courier} ${number} (일괄 업로드)`);
    return { giftId, ok: true };
  });
}

export async function advanceDelivery({ giftId }) {
  await latency();
  if (getGift(giftId)?.status !== "SHIPPED") return { ok: false, code: "NOT_SHIPPED", message: "배송 중인 주문이 아니에요." };
  updateGift(giftId, { delivery: { deliveredAt: new Date().toISOString() } });
  transition(giftId, "DELIVERED", "배송 완료");
  return { ok: true };
}
