import ConfirmEmailForm from "@/components/auth/ConfirmEmailForm";
import { Helmet } from "react-helmet";

export default function ConfirmEmail() {
  return (
    <>
      <Helmet>
        <title>Confirm Email - Socialite</title>
      </Helmet>
      <ConfirmEmailForm />
    </>
  );
}
