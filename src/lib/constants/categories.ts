export interface CategoryDefinition {
  id: string;
  name: string; // 1st Depth 대분류
  description: string;
  subCategories: string[]; // 2nd Depth 중/소분류 (용처별)
}

export const PRODUCT_CATEGORIES: CategoryDefinition[] = [
  {
    id: "cleaner",
    name: "세정제류",
    description: "주방, 욕실, 가구, 유리 등 공간 전용 세정 솔루션",
    subCategories: [
      "다목적/올인원",
      "주방/기름때",
      "욕실/물때",
      "유리/거울",
      "바닥/타일",
      "가구/목재",
      "전자제품/가전",
    ],
  },
  {
    id: "deodorizer",
    name: "탈취제류",
    description: "실내 공기 정화 및 섬유, 차량, 반려동물 전용 탈취제",
    subCategories: [
      "실내/공간용",
      "섬유/의류용",
      "차량용",
      "신발/가죽용",
      "반려동물용",
      "냉장고/주방용",
    ],
  },
  {
    id: "disinfectant",
    name: "소독·살균제류",
    description: "안심 살균 및 위생 소독 전문 라인",
    subCategories: [
      "다목적 살균소독",
      "휴대/손소독",
      "기구/식기 살균",
      "장난감/베이비",
    ],
  },
  {
    id: "laundry",
    name: "세탁·섬유케어",
    description: "프리미엄 세탁세제 및 섬유 보호 솔루션",
    subCategories: [
      "친환경 세탁세제",
      "섬유유연제",
      "얼룩/부분제거제",
      "울/고급의류용",
    ],
  },
  {
    id: "accessory",
    name: "기타·액세서리",
    description: "에코 리필 패키지, 전용 분무기 및 클리닝 도구",
    subCategories: [
      "에코 리필팩",
      "전용 분무기/스프레이",
      "디스펜서/공병",
      "극세사 타월/브러시",
    ],
  },
];

export const ALL_MAIN_CATEGORIES = PRODUCT_CATEGORIES.map((c) => c.name);

export function getSubCategoriesByMainCategory(mainCategory: string): string[] {
  const found = PRODUCT_CATEGORIES.find((c) => c.name === mainCategory);
  return found ? found.subCategories : ["일반/기타"];
}
