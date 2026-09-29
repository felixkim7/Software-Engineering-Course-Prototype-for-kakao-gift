// Shared Korean UI strings. Page-specific copy lives at the top of each page module.

export const STATUS_LABELS = {
  recipient: {
    SENT: "새 선물", OPENED: "확인함", ADDRESS_SUBMITTED: "배송 준비 중", SHIPPED: "배송 중",
    DELIVERED: "배송 완료", USED: "사용 완료", CONVERTED: "금액으로 받음", DECLINED_REFUNDED: "거절함",
  },
  buyer: {
    SENT: "전달 완료", OPENED: "수령자 확인", ADDRESS_SUBMITTED: "배송 준비 중", SHIPPED: "배송 중",
    DELIVERED: "배송 완료", USED: "사용 완료",
    CONVERTED: "전달 완료", // the buyer is not told about a conversion
    DECLINED_REFUNDED: "거절됨 · 환불 완료",
  },
  seller: {
    SENT: "배송지 입력 대기", OPENED: "배송지 입력 대기", ADDRESS_SUBMITTED: "발송 대기", SHIPPED: "배송 중",
    DELIVERED: "배송 완료", USED: "—", CONVERTED: "발송 불필요 (금액 전환)", DECLINED_REFUNDED: "발송 불필요 (거절·환불)",
  },
};

export const RELATION_LABELS = { friend: "친구", family: "가족", coworker: "직장동료", partner: "연인" };
export const GENDER_LABELS = { F: "여성", M: "남성" };
export const AGE_LABELS = { "10s": "10대", "20s": "20대", "30s": "30대", "40s": "40대", "50s+": "50대+" };
export const SITUATION_LABELS = {
  birthday: "생일", thanks: "감사", congrats: "축하", cheer: "응원", casual: "그냥", getwell: "쾌유",
};
export const CATEGORY_LABELS = {
  cafe: "카페", dessert: "케익·디저트", beauty: "뷰티", flower: "꽃", fashion: "패션·주얼리",
  digital: "디지털·가전", health: "건강", food: "식품", living: "리빙", character: "캐릭터·굿즈",
};
export const PAYMENT_METHOD_LABELS = { pay: "간편결제(페이)", card: "신용/체크카드", bank: "계좌이체" };
export const BUYER_STEPS = ["받는 사람", "선물 고르기", "메시지·결제", "완료"];
export const COURIERS = ["CJ대한통운", "롯데택배", "한진택배", "우체국택배", "로젠택배"];

export const COMMON = {
  appTitle: "선물하기",
  yes: "네",
  no: "아니오",
  ok: "확인",
  cancel: "취소",
  close: "닫기",
  back: "뒤로",
  search: "검색",
  more: "더보기",
  newBadge: "NEW",
  loading: "처리 중이에요…",
  freeShipping: "무료배송",
  unsupported: "데모에서는 지원하지 않는 기능이에요.",
};
