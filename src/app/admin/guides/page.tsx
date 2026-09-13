import { redirect } from "next/navigation";

export default function AdminGuidesPage() {
  redirect("/admin/posts?type=GUIDE");
}
