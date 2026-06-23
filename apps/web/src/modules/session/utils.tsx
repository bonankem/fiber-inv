import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Form, type FormInstance } from "antd";
import type { Rule } from "antd/es/form";
import { m } from "i18n/messages";
import { useState } from "react";
import type { UserFullT } from "schema/people";
import type { Maybe } from "schema/utils";
import { useAuthToken } from "#/api/auth";
import { useApiPost } from "#/api/helpers";

export function useLogout() {
  const logout = useApiPost<void>("/session/logout");
  const client = useQueryClient();
  const token = useAuthToken();
  const navigate = useNavigate();
  const pending = logout.isPending;

  const call = async () => {
    if (pending) return;
    navigate({ to: "/login", replace: true });
    await logout.mutateAsync().catch(() => {});
    client.clear();
    token.update(null);
  };

  return { call, pending };
}

function req(label: string, ok: (p: string) => boolean) {
  return { label, ok };
}

export function usePasswordChecks<
  F extends { oldPassword: string; newPassword: string },
>(
  form: FormInstance<F>,
  user: Maybe<Pick<UserFullT, "name" | "email" | "isAdmin">>,
) {
  const [showNew, setShowNew] = useState(false);
  const visibilityToggle = {
    visible: showNew,
    onVisibleChange: setShowNew,
  };

  const min = user?.isAdmin ? 14 : 12;
  const suffix = user?.isAdmin ? " (admin)" : "";
  const notAllowed = user
    ? [
        ...user.name.split(/[\W_]+/).filter((n) => n.length >= 3),
        user.email.replace(/@.+/, ""),
      ].map((s) => s.toLowerCase())
    : [];

  const noBlockedWords = (p: string) => {
    p = p.toLowerCase();
    return !notAllowed.some((n) => p.includes(n));
  };
  const reqs = [
    req(m.pw_min_length({ min, suffix }), (p) => p.length >= min),
    req(m.pw_uppercase(), (p) => /[A-Z]/.test(p)),
    req(m.pw_lowercase(), (p) => /[a-z]/.test(p)),
    req(m.pw_number(), (p) => /[0-9]/.test(p)),
    req(m.pw_symbol(), (p) => /[\W_]/.test(p)),
    req(m.pw_not_name(), noBlockedWords),
  ];

  const newPass = Form.useWatch("newPassword", form) || "";
  const list = reqs.map((r) => ({ label: r.label, ok: r.ok(newPass) }));
  const allOk = list.every((c) => c.ok);

  const newPassRule: Rule = (form) => ({
    async validator(_, value) {
      if (value && value === form.getFieldValue("oldPassword")) {
        throw new Error(m.error_same_password());
      }
    },
  });

  const confirmRule: Rule = (form) => ({
    async validator(_, value) {
      if (value && value !== form.getFieldValue("newPassword")) {
        throw new Error(m.error_password_mismatch());
      }
    },
  });

  const render = () => {
    return newPass ? (
      <Form.Item>
        <ul>
          {list.map((c, i) => {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: index is the key
              <li key={i}>
                {c.ok ? (
                  <CheckCircleFilled className="text-green-500! mr-3" />
                ) : (
                  <CloseCircleFilled className="text-red-500! mr-3" />
                )}
                <span>{c.label}</span>
              </li>
            );
          })}
        </ul>
      </Form.Item>
    ) : undefined;
  };

  return {
    allOk,
    list,
    render,
    newPassRule,
    confirmRule,
    visibilityToggle,
  };
}
