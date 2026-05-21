import SignupForm from "@/components/auth/SignupForm";
import { Helmet } from "react-helmet";

export default function Signup() {
  return (
    <>
      <Helmet>
        <title>Sign Up - Socialite</title>
      </Helmet>
      <SignupForm />
    </>
  );
}
