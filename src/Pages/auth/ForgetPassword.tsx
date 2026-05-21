import ForgetPasswordForm from "@/components/auth/ForgetPasswordForm";
import { Helmet } from "react-helmet";

export default function ForgetPassword() {
  return (
    <>
      <Helmet>
        <title>Forgot Password - Socialite</title>
      </Helmet>
      <ForgetPasswordForm />
    </>
  );
}
