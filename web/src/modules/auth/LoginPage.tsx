import { useNavigate } from "@tanstack/react-router";
import { message } from "antd";
import { useState } from "react";
import { type AuthResultT, AuthStatus } from "schema/auth";
import { useAuthToken } from "#/api/auth";
import AuthChangeForm from "./AuthChangeForm";
import AuthChooseForm from "./AuthChooseForm";
import AuthInstallForm from "./AuthInstallForm";
import AuthLoginForm from "./AuthLoginForm";
import AuthOtpForm from "./AuthOtpForm";

export default function LoginPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<AuthResultT>();
  const authToken = useAuthToken();

  const onResult = (res: AuthResultT) => {
    if (res.status === AuthStatus.SUCCESS) {
      authToken.update(res.token);
      message.success(`Bienvenue, ${res.user.name}`);
      navigate({ to: "/ftth-surveys", replace: true });
    } else {
      setResult(res);
    }
  };

  const onCancel = () => {
    setResult(undefined);
  };

  const props = { onResult, onCancel };

  if (result?.status === AuthStatus.NEEDS_OTP) {
    return <AuthOtpForm {...props} res={result} />;
  }

  if (result?.status === AuthStatus.NEEDS_CHANGE) {
    return <AuthChangeForm {...props} res={result} />;
  }

  if (result?.status === AuthStatus.NEEDS_MFA_MODE) {
    return <AuthChooseForm {...props} res={result} />;
  }

  if (result?.status === AuthStatus.NEEDS_INSTALL) {
    return <AuthInstallForm {...props} res={result} />;
  }

  return <AuthLoginForm {...props} />;
}
