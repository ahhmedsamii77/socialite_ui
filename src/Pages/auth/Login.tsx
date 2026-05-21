import LoginForm from "@/components/auth/LoginForm";
import { Helmet } from "react-helmet";

export default function Login() {
  return (
    <>
      <Helmet>
        <title>Login - Socialite</title>
      </Helmet>
      <LoginForm />
    </>
  );
}
