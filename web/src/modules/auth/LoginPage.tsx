import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { message } from "antd";
import * as m from "i18n/messages";
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
  const queries = useQueryClient();

  const onResult = async (res: AuthResultT) => {
    if (res.status === AuthStatus.SUCCESS) {
      authToken.update(res.token);
      await queries.invalidateQueries();
      navigate({ to: "/ftth-surveys", replace: true });
      message.success(m.welcome({ name: res.user.name }));
    } else {
      setResult(res);
      navigate({ hash: "setup", replace: true });
    }
  };

  const onCancel = () => {
    setResult(undefined);
    navigate({ hash: "", replace: true });
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
