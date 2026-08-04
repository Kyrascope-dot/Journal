import { redirect } from "next/navigation";

export default function SubmissionsRedirect() {
  redirect("/for-authors/submit-manuscript");
}
