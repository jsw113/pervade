import { prisma } from "@/lib/prisma";
import { PolicyForm } from "@/components/admin/PolicyForm";

export default async function AdminPoliciesPage() {
  const policies = await prisma.policy.findMany();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">정책 설정</h2>
        <p className="text-muted-foreground">쇼핑몰, 적립금, 배송비 및 공통 안내문구 정책을 통합 설정합니다.</p>
      </div>
      
      <PolicyForm initialPolicies={JSON.parse(JSON.stringify(policies))} />
    </div>
  );
}
