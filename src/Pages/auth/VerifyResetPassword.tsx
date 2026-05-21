import VerifyResetPasswordForm from "@/components/auth/VerifyResetPasswordForm";
import { Helmet } from "react-helmet";

export default function VerifyResetPassword() {
  return (
    <>
      <Helmet>
        <title>Verify Code - Socialite</title>
      </Helmet>
      <VerifyResetPasswordForm />
    </>
  );
}
