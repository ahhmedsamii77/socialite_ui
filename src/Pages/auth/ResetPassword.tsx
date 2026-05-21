import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Helmet } from "react-helmet";

export default function ResetPassword() {
  return (
    <>
      <Helmet>
        <title>Reset Password - Socialite</title>
      </Helmet>
      <ResetPasswordForm />
    </>
  );
}
