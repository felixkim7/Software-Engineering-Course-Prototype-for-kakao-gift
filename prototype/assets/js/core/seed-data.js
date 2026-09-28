// Seed data (fictional people; product names/prices modeled on docs/reference-screens/).
// Dates are generated relative to "now" so deadlines and upcoming birthdays stay valid on demo day.

const DAY = 24 * 60 * 60 * 1000;
const DECISION_DAYS = 30;

// "FM", "20s 30s", "friend partner", "birthday thanks" → tag arrays
const tags = (gender, ages, relations, situations) => ({
  gender: gender.split(""),
  ageGroups: ages.split(" "),
  relations: relations.split(" "),
  situations: situations.split(" "),
});
const ALL_AGES = "10s 20s 30s 40s 50s+";

// thumbnail = image name in assets/img (see tools/crop-screens.py) or an emoji fallback
function product(id, sellerId, brand, name, category, type, price, thumbnail, extra) {
  return {
    id, sellerId, brand, name, category, type, price, thumbnail,
    discountRate: 0, benefitPrice: null, badge: null, options: [],
    freeShipping: type === "delivery", convertible: true, popularity: 70, wishCount: 0,
    ...extra,
  };
}

const PRODUCTS = [
  product("p01", "s3", "센티카", "수면케어/꿀잠선물 [선물포장/카드] 센티카 시그니처 수면안대 세트", "living", "delivery", 30000, "p-sentica",
    { discountRate: 45, benefitPrice: 27000, badge: "쨍특", popularity: 92, wishCount: 558, tags: tags("FM", "20s 30s 40s", "friend coworker partner", "birthday thanks cheer getwell") }),
  product("p02", "s5", "널담", "하루 한 개 식단! [대용량팩] 널담 고단백 베이글 20입 세트", "food", "delivery", 33000, "p-neoldam",
    { discountRate: 5, benefitPrice: 27000, badge: "쨍특", popularity: 85, wishCount: 528, tags: tags("FM", "20s 30s", "friend coworker", "cheer casual") }),
  product("p03", "s5", "바디핌", "*목피로회복선물* [수면안대 SET] 저주파 목 마사지기", "health", "delivery", 34900, "p-bodyfim",
    { benefitPrice: 31410, popularity: 88, wishCount: 5200, tags: tags("FM", "30s 40s 50s+", "family coworker", "thanks getwell cheer") }),
  product("p04", "s3", "맥(MAC)", "[각인/선물포장] 맥 NEW 러스터글래스 립스틱", "beauty", "delivery", 39000, "p-mac",
    { benefitPrice: 35100, popularity: 90, wishCount: 58000, tags: tags("F", "10s 20s 30s", "friend partner", "birthday congrats"),
      options: [{ id: "o1", label: "#레디투파티" }, { id: "o2", label: "#러브미" }, { id: "o3", label: "#칠리" }] }),
  product("p05", "s5", "누아트(ACC)", "\"셀카+조명기능\" 빈티지 디지털 카메라 SD카드 포함", "digital", "delivery", 32900, "p-nuart",
    { discountRate: 52, benefitPrice: 29610, badge: "쨍특", popularity: 87, wishCount: 12000, tags: tags("FM", "10s 20s", "friend partner", "birthday congrats") }),
  product("p06", "s3", "이솝", "아로마틱 핸드 밤 75ml", "beauty", "delivery", 39000, "p-aesop",
    { popularity: 84, wishCount: 21000, tags: tags("FM", "20s 30s 40s", "friend coworker partner", "thanks birthday") }),
  product("p07", "s1", "하겐다즈(케이크)", "[단독]하겐다즈 프리미엄 수제 아이스크림 케이크 리얼블랑 (바닐라+벨지안초코)", "dessert", "delivery", 32900, "p-haagen-realblanc",
    { benefitPrice: 29610, badge: "단독", popularity: 96, wishCount: 95000, tags: tags("FM", "20s 30s 40s", "family friend partner", "birthday congrats") }),
  product("p08", "s2", "고디바", "[단독] 고디바 다크 초콜릿 케이크 + 아메리카노 쿠폰 증정", "dessert", "delivery", 39900, "p-godiva",
    { benefitPrice: 35910, badge: "단독", popularity: 91, wishCount: 81000, tags: tags("FM", "20s 30s 40s", "friend partner family", "birthday congrats") }),
  product("p09", "s2", "조선호텔델리", "\"조선호텔 베스트셀러\" 프리미엄 뉴욕 치즈 케이크", "dessert", "delivery", 39900, "p-josun-deli",
    { benefitPrice: 35910, popularity: 83, wishCount: 41000, tags: tags("FM", "30s 40s 50s+", "family coworker", "thanks congrats") }),
  product("p10", "s2", "하트티라미수", "\"하트초 증정!\" 오리지널 티라미수 케이크 (쇼핑백 증정)", "dessert", "delivery", 29000, "p-hart-tiramisu",
    { benefitPrice: 26100, popularity: 86, wishCount: 83000, tags: tags("FM", "10s 20s 30s", "partner friend", "birthday casual") }),
  product("p11", "s2", "파리바게뜨", "\"배달가능\" 마이넘버원 케이크", "dessert", "voucher", 36000, "p-parisbaguette",
    { convertible: false, popularity: 72, wishCount: 334, tags: tags("FM", ALL_AGES, "family", "birthday") }),
  product("p12", "s2", "오설록 디저트", "[단독] 말차&치즈의 클래식 조합, 오설록 프리미엄 녹차 치즈 케이크", "dessert", "delivery", 33900, "p-osulloc",
    { benefitPrice: 30510, badge: "단독", popularity: 82, wishCount: 70000, tags: tags("FM", "20s 30s 40s 50s+", "family coworker", "thanks birthday") }),
  product("p13", "s1", "하겐다즈(케이크)", "[하겐다즈 프리미엄 아이스크림 케이크] 비스킷앤크림", "dessert", "delivery", 32900, "p-haagen-biscuit",
    { benefitPrice: 29610, popularity: 80, wishCount: 28000, tags: tags("FM", "10s 20s 30s", "friend family", "birthday casual") }),
  product("p14", "s1", "하겐다즈(케이크)", "[하겐다즈 2단 미니 아이스크림 케이크] 생초코", "dessert", "delivery", 29900, "p-haagen-mini",
    { benefitPrice: 26910, popularity: 78, wishCount: 6532, tags: tags("FM", "10s 20s", "friend partner", "birthday casual") }),
  product("p15", "s1", "하겐다즈(케이크)", "하겐다즈 비욘드쇼콜라 케이크 + 꾸까 꽃다발 세트", "flower", "delivery", 65900, "p-haagen-kukka",
    { benefitPrice: 60900, popularity: 75, wishCount: 1034, tags: tags("F", "20s 30s 40s", "partner family", "birthday congrats") }),
  product("p16", "s4", "BBQ", "EVENT 황금올리브 반+양념 반+콜라1.25L", "food", "voucher", 23500, "p-bbq",
    { discountRate: 11, popularity: 89, wishCount: 32000, tags: tags("FM", "10s 20s 30s", "friend coworker", "casual cheer") }),
  product("p17", "s4", "가마치통닭", "순살양념+콜라1.25L", "food", "voucher", 19000, "p-gamachi",
    { popularity: 74, wishCount: 4100, tags: tags("FM", "10s 20s", "friend", "casual cheer") }),
  product("p18", "s4", "꾸브라꼬숯불치킨", "양념꾸브+170도 순살+콜라1.25L", "food", "voucher", 42400, "p-kkubrakko",
    { popularity: 71, wishCount: 2600, tags: tags("FM", "20s 30s", "friend coworker family", "casual") }),
  product("p19", "s4", "교촌치킨", "반반콤보+콜라1.25L", "food", "voucher", 26000, "cat-chicken",
    { popularity: 83, wishCount: 27000, tags: tags("FM", "10s 20s 30s 40s", "friend family coworker", "casual cheer") }),
  product("p20", "s4", "투썸플레이스", "스트로베리 초콜릿 생크림 + 아메리카노 R 2잔", "cafe", "voucher", 13500, "p-strawberry-cake-set",
    { popularity: 90, wishCount: 44000, tags: tags("FM", "20s 30s 40s", "friend coworker", "thanks casual birthday") }),
  product("p21", "s4", "배스킨라빈스", "싱글킹 아이스크림 교환권", "cafe", "voucher", 4700, "p-br-icecream",
    { popularity: 81, wishCount: 15000, tags: tags("FM", "10s 20s", "friend family", "casual thanks") }),
  // p22, p25, p26, p28, p31–p35: real 선물하기 listings (names, prices, images) — see tools/fetch-web-images.py
  product("p22", "s4", "스타벅스", "아이스 카페 아메리카노 T 2잔", "cafe", "voucher", 9000, "web-starbucks-americano",
    { popularity: 95, wishCount: 99000, tags: tags("FM", "20s 30s 40s", "coworker friend", "thanks casual cheer") }),
  product("p23", "s5", "제주농장", "제주 애플망고 1.5kg (4~6과)", "food", "delivery", 49900, "p-mango",
    { popularity: 77, wishCount: 9300, tags: tags("FM", "30s 40s 50s+", "family coworker", "thanks getwell") }),
  product("p24", "s2", "코디얼먼트", "벨지안 생초콜릿 16구 선물세트", "dessert", "delivery", 28000, "p-chocolate-box",
    { popularity: 76, wishCount: 5100, tags: tags("FM", "20s 30s", "partner friend coworker", "thanks congrats") }),
  product("p25", "s5", "정관장", "[정관장] 에브리타임 레귤러 (10ml x 30포)", "health", "delivery", 67000, "web-kgc-everytime",
    { convertible: false, popularity: 88, wishCount: 41000, tags: tags("FM", "30s 40s 50s+", "family coworker", "thanks getwell cheer") }),
  product("p26", "s5", "정관장", "[정관장] 홍삼정에브리타임 리미티드 보자기 (10ml x 30포)", "health", "delivery", 144000, "web-kgc-everytime-bojagi",
    { badge: "단독", popularity: 90, wishCount: 18000, tags: tags("FM", "50s+ 40s", "family coworker", "thanks birthday getwell congrats") }),
  product("p27", "s3", "로이드", "14K 클로버 목걸이", "fashion", "delivery", 129000, "cat-jewelry",
    { popularity: 73, wishCount: 6700, tags: tags("F", "20s 30s", "partner", "birthday congrats"),
      options: [{ id: "o1", label: "40cm" }, { id: "o2", label: "45cm" }] }),
  product("p28", "s5", "종근당건강", "종근당건강 락토핏 50대+ 1통 / 장건강 뼈&근육 동시케어", "health", "delivery", 22900, "web-lactofit-50",
    { popularity: 82, wishCount: 12000, tags: tags("FM", "50s+", "family coworker", "getwell thanks") }),
  product("p29", "s5", "르크루제", "스톤웨어 머그 2P 세트", "living", "delivery", 45000, "theme-small-luxury",
    { popularity: 74, wishCount: 7200, tags: tags("FM", "30s 40s 50s+", "coworker family", "congrats thanks") }),
  product("p30", "s5", "젤리캣", "바쉬풀 버니 인형 M", "living", "delivery", 42000, "theme-baby",
    { popularity: 78, wishCount: 11000, tags: tags("F", "10s 20s", "partner family friend", "birthday casual") }),
  product("p31", "s5", "신세계푸드", "신세계푸드 한우 1++등급 구이 선물세트 750g (등심250g+안심250g+채끝250g)", "food", "delivery", 159000, "web-hanwoo-set",
    { popularity: 89, wishCount: 26000, tags: tags("FM", "40s 50s+", "family coworker", "thanks birthday congrats") }),
  product("p32", "s5", "카카오프렌즈", "카카오프렌즈 별별춘식 춘식이 드레스업 인형 (마법사/마스터 2종 택1)", "character", "delivery", 26000, "web-choonsik",
    { popularity: 91, wishCount: 47000, tags: tags("FM", "10s 20s", "friend partner", "birthday casual cheer"),
      options: [{ id: "o1", label: "마법사" }, { id: "o2", label: "마스터" }] }),
  product("p33", "s5", "산리오", "산리오 미드나잇 중형 인형 (쿠로미/마이멜로디)", "character", "delivery", 27900, "web-kuromi",
    { popularity: 87, wishCount: 21000, tags: tags("F", "10s 20s", "friend family", "birthday casual"),
      options: [{ id: "o1", label: "쿠로미" }, { id: "o2", label: "마이멜로디" }] }),
  product("p34", "s5", "포켓몬스터", "포켓몬스터 빙글빙글 피카츄 인형", "character", "delivery", 23000, "web-pikachu",
    { popularity: 84, wishCount: 15000, tags: tags("FM", "10s", "friend family", "birthday casual cheer") }),
  product("p35", "s4", "올리브영", "기프트카드 3만원권", "beauty", "voucher", 30000, "web-oliveyoung-card",
    { popularity: 93, wishCount: 64000, tags: tags("FM", "10s 20s", "friend family", "birthday congrats casual") }),
];

const SELLERS = [
  { id: "s1", name: "하겐다즈 공식스토어" },
  { id: "s2", name: "디저트 셀렉트" },
  { id: "s3", name: "뷰티앤라이프" },
  { id: "s4", name: "모바일 교환권센터" },
  { id: "s5", name: "선물상점" },
];

const HISTORY_NOTES = {
  SENT: "결제 완료, 선물 전송", OPENED: "선물 확인", ADDRESS_SUBMITTED: "배송지 입력", SHIPPED: "상품 발송",
  DELIVERED: "배송 완료", USED: "사용 완료", CONVERTED: "금액으로 전환", DECLINED_REFUNDED: "선물 거절, 구매자 환불",
};
const PATHS = {
  SENT: ["SENT"],
  OPENED: ["SENT", "OPENED"],
  ADDRESS_SUBMITTED: ["SENT", "OPENED", "ADDRESS_SUBMITTED"],
  SHIPPED: ["SENT", "OPENED", "ADDRESS_SUBMITTED", "SHIPPED"],
  DELIVERED: ["SENT", "OPENED", "ADDRESS_SUBMITTED", "SHIPPED", "DELIVERED"],
  CONVERTED: ["SENT", "OPENED", "CONVERTED"],
  DECLINED_REFUNDED: ["SENT", "OPENED", "DECLINED_REFUNDED"],
};

// [id, status, buyerId, recipientId, productId, daysAgo, message, address]
const GIFT_ROWS = [
  // received by the demo recipient u1
  ["g1001", "SENT", "u0", "u1", "p07", 0, "생일 축하해! 🎉 맛있게 먹어~", null],
  ["g1002", "OPENED", "u5", "u1", "p20", 2, "시험 끝난 기념! 커피 한 잔 해 ☕", null],
  ["g1003", "DELIVERED", "u6", "u1", "p06", 6, "늘 고마워 :)", ["김지우", "01234", "서울특별시 마포구 와우산로 94", "302호"]],
  // seller s1 (하겐다즈 공식스토어) orders
  ["g2001", "ADDRESS_SUBMITTED", "u2", "c1", "p07", 1, "승진 축하드려요!", ["이도현", "04157", "서울특별시 마포구 마포대로 33", "1203호"]],
  ["g2002", "ADDRESS_SUBMITTED", "u3", "c2", "p13", 1, "생일 축하해", ["최유나", "06236", "서울특별시 강남구 테헤란로 152", "B동 801호"]],
  ["g2003", "ADDRESS_SUBMITTED", "u5", "c3", "p14", 2, "맛있게 먹어!", ["강민재", "13494", "경기도 성남시 분당구 판교역로 166", "카카오 판교아지트"]],
  ["g2004", "ADDRESS_SUBMITTED", "u6", "c4", "p15", 2, "사랑해 ❤", ["윤서진", "48058", "부산광역시 해운대구 센텀중앙로 79", "2502호"]],
  ["g2005", "ADDRESS_SUBMITTED", "u2", "c5", "p07", 3, "고생 많았어요", ["장하린", "34126", "대전광역시 유성구 대학로 99", "기숙사 A동 412호"]],
  ["g2006", "SHIPPED", "u3", "c6", "p13", 3, "축하합니다", ["오태윤", "61475", "광주광역시 동구 금남로 245", "7층"]],
  ["g2007", "SHIPPED", "u5", "c1", "p14", 4, "힘내!", ["이도현", "04157", "서울특별시 마포구 마포대로 33", "1203호"]],
  ["g2008", "SHIPPED", "u6", "c2", "p07", 4, "생일 축하해 🎂", ["최유나", "06236", "서울특별시 강남구 테헤란로 152", "B동 801호"]],
  ["g2009", "DELIVERED", "u2", "c3", "p15", 5, "감사합니다", ["강민재", "13494", "경기도 성남시 분당구 판교역로 166", "카카오 판교아지트"]],
  ["g2010", "DELIVERED", "u3", "c4", "p13", 6, "생일 축하해", ["윤서진", "48058", "부산광역시 해운대구 센텀중앙로 79", "2502호"]],
  ["g2011", "CONVERTED", "u0", "u6", "p14", 3, "달달한 거 먹고 힘내!", null],
  ["g2012", "DECLINED_REFUNDED", "u0", "u5", "p07", 4, "생일 축하한다 친구야", null],
];

const COURIER = "CJ대한통운";

/** Local date + sequence → "YYYYMMDD-NNNNNN" */
export function orderNo(date, seq) {
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `${ymd}-${String(seq).padStart(6, "0")}`;
}

function buildGift([id, status, buyerId, recipientId, productId, daysAgo, message, address], seq, now, productsById) {
  const product = productsById[productId];
  const created = new Date(now.getTime() - daysAgo * DAY - 3 * 60 * 60 * 1000);
  const deadline = new Date(created.getTime() + DECISION_DAYS * DAY);
  deadline.setHours(23, 59, 59, 0);
  const steps = PATHS[status];
  const at = (i) => new Date(created.getTime() + i * 5 * 60 * 60 * 1000).toISOString();
  const shipped = steps.includes("SHIPPED");
  const phoneTail = String(1000 + seq * 37).slice(-4);

  const gift = {
    id, orderNo: orderNo(created, 120 + seq), buyerId, recipientId, productId,
    optionId: product.options[0]?.id ?? null, quantity: 1, amount: product.price, message,
    cardTheme: "birthday", paymentMethod: "card", status,
    createdAt: created.toISOString(), decisionDeadline: deadline.toISOString(),
    delivery: null,
    history: steps.map((s, i) => ({ at: at(i), status: s, note: HISTORY_NOTES[s] })),
    settlement: null,
  };
  if (product.type === "delivery") {
    const [receiverName, zip, address1, address2] = address ?? ["", "", "", ""];
    gift.delivery = {
      receiverName, phone: address ? `010-0000-${phoneTail}` : "", zip, address1, address2, memo: address ? "문 앞에 놓아주세요" : "",
      courier: shipped ? COURIER : "", trackingNo: shipped ? `6${String(81234500000 + seq * 7919)}` : "",
      shippedAt: shipped ? at(steps.indexOf("SHIPPED")) : null,
      deliveredAt: status === "DELIVERED" ? at(steps.length - 1) : null,
    };
  }
  if (status === "CONVERTED" || status === "DECLINED_REFUNDED") {
    gift.settlement = { type: status === "CONVERTED" ? "CONVERT" : "REFUND", amount: gift.amount, txId: `tx_seed_${id}`, at: at(steps.length - 1) };
  }
  return gift;
}

/** u1's birthday is always 3 days after "now" so the 🎂 D-3 tag shows on demo day. */
function birthdayInDays(year, days, now) {
  const d = new Date(now.getTime() + days * DAY);
  return `${year}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function createSeed(now = new Date()) {
  const users = [
    { id: "u0", name: "김민준", avatar: "🙂", gender: "M", birthDate: "1999-03-02", relation: null, interests: [] },
    { id: "u1", name: "김지우", avatar: "🦊", gender: "F", birthDate: birthdayInDays(2003, 3, now), relation: "friend", interests: ["beauty", "dessert"] },
    { id: "u2", name: "이서연", avatar: "🐰", gender: "F", birthDate: "1994-11-20", relation: "coworker", interests: ["cafe", "living"] },
    { id: "u3", name: "김정훈", avatar: "🐻", gender: "M", birthDate: "1971-06-08", relation: "family", interests: ["health", "food"] },
    { id: "u4", name: "김하은", avatar: "🐥", gender: "F", birthDate: "2011-01-15", relation: "family", interests: ["dessert", "living"] },
    { id: "u5", name: "정우진", avatar: "🐶", gender: "M", birthDate: "1997-08-30", relation: "friend", interests: ["food", "digital"] },
    { id: "u6", name: "한수아", avatar: "🐱", gender: "F", birthDate: "1998-02-11", relation: "partner", interests: ["beauty", "flower"] },
    // other customers (only appear as recipients of seller orders)
    ...["이도현", "최유나", "강민재", "윤서진", "장하린", "오태윤"].map((name, i) => ({ id: `c${i + 1}`, name, avatar: "👤" })),
  ];
  const productsById = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const gifts = GIFT_ROWS.map((row, i) => buildGift(row, i + 1, now, productsById));
  const converted = gifts.find((g) => g.id === "g2011");
  const declined = gifts.find((g) => g.id === "g2012");

  return {
    users,
    sellers: SELLERS,
    products: PRODUCTS,
    gifts,
    notifications: [
      { id: "n1", userId: "u0", giftId: declined.id, type: "DECLINED_REFUNDED", read: false, at: declined.settlement.at,
        text: `우진님이 선물을 거절하여 ${declined.amount.toLocaleString("ko-KR")}원이 환불되었어요.` },
    ],
    wallets: [
      { userId: "u1", balance: 0, ledger: [] },
      { userId: "u6", balance: converted.amount, ledger: [{ at: converted.settlement.at, amount: converted.amount, giftId: converted.id, reason: "CONVERT" }] },
    ],
    devFlags: { failNextPayment: false, failNextSettlement: false, failNextMessage: false, showNewBadges: true },
    idempotency: {},
    session: { currentUserId: "u0" },
    nextSeq: GIFT_ROWS.length + 1,
  };
}
