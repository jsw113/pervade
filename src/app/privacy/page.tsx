export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-[70vh]">
      <div className="border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">개인정보처리방침</h1>
        <p className="text-xs text-zinc-500 mt-2">최종 개정일: 2026년 8월 17일</p>
      </div>

      <div className="prose prose-zinc text-xs leading-relaxed space-y-6 text-zinc-700">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-zinc-900">1. 개인정보의 수집 항목 및 수집 방법</h2>
          <p>
            회사는 원활한 고객 상담 및 서비스 제공, 전자상거래 계약 이행을 위하여 아래와 같은 개인정보를 수집하고 있습니다.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>필수항목</strong>: 성명, 이메일 주소, 로그인 아이디, 비밀번호, 휴대폰 번호, 배송지 주소</li>
            <li><strong>본인확인 시</strong>: 생년월일, 성별, 통신사, 암호화된 동일인식별정보(CI/DI)</li>
            <li><strong>소셜 로그인 시</strong>: 소셜 고유 식별값, 프로필 닉네임, 이메일</li>
            <li><strong>자동 수집 항목</strong>: IP Address, 쿠키, 방문 일시, 서비스 이용 기록, 불량 이용 기록</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-zinc-900">2. 개인정보의 수집 및 이용 목적</h2>
          <p>
            회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>서비스 제공에 관한 계약 이행 및 요금정산</strong>: 콘텐츠 제공, 구매 및 결제, 물품배송 또는 청구서 등 발송</li>
            <li><strong>회원 관리</strong>: 회원제 서비스 이용에 따른 본인확인, 개인식별, 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인</li>
            <li><strong>마케팅 및 광고에 활용</strong>: 신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 (동의 회원에 한함)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-zinc-900">3. 개인정보의 보유 및 이용 기간</h2>
          <p>
            회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 전자상거래 등에서의 소비자보호에 관한 법률 등 관계 법령에 의하여 보존할 필요가 있는 경우 일정 기간 동안 보존합니다.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
            <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
