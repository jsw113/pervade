export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-[70vh]">
      <div className="border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">서비스 이용약관</h1>
        <p className="text-xs text-zinc-500 mt-2">최종 개정일: 2026년 8월 17일</p>
      </div>

      <div className="prose prose-zinc text-xs leading-relaxed space-y-6 text-zinc-700">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-zinc-900">제1조 (목적)</h2>
          <p>
            본 약관은 퍼베이드(이하 "회사"라 함)가 운영하는 공식 온라인 쇼핑몰(이하 "몰"이라 함)에서 제공하는 인터넷 관련 전자상거래 서비스(이하 "서비스"라 함)를 이용함에 있어 몰과 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-zinc-900">제2조 (용어의 정의)</h2>
          <p>
            1. "몰"이란 회사가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말합니다.<br />
            2. "이용자"란 "몰"에 접속하여 본 약관에 따라 "몰"이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.<br />
            3. "회원"이라 함은 "몰"에 개인정보를 제공하여 회원등록을 한 자로서, "몰"의 정보를 지속적으로 제공받으며 서비스를 계속적으로 이용할 수 있는 자를 말합니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-zinc-900">제3조 (회원가입 및 실명인증)</h2>
          <p>
            1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.<br />
            2. 회사는 전자상거래의 안전성과 부정 이용 방지를 위하여 관계 법령에 따른 휴대폰 본인확인(실명인증)을 요구할 수 있습니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-zinc-900">제4조 (계약의 성립 및 대금결제)</h2>
          <p>
            회원은 몰에서 제공하는 결제수단(신용카드, 간편결제, 계좌이체, 무통장입금 등)을 통하여 상품 대금을 결제할 수 있으며, 결제가 정상 완료된 시점에 매매계약이 체결된 것으로 봅니다.
          </p>
        </section>
      </div>
    </div>
  );
}
