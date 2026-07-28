import type { UserOutlined } from "@ant-design/icons";
import type { ThumbsUp } from "lucide-react";
import { useMemo } from "react";
import { filter, map, pipe } from "remeda";
import { type UserFullT, userFullZ } from "schema/people";
import type { Maybe } from "schema/utils";
import { useApiGet } from "#/api/helpers";
import type { ModalItemFC } from "#/hooks/useModalViewer";

type Icon = typeof UserOutlined | typeof ThumbsUp;
type Func<I, O> = (t: I) => O;
type MaybeFunc<I, O> = O | ((t: I) => O);

function callFunc<I, O>(f: MaybeFunc<I, O> | undefined, i: I) {
  return typeof f === "function" ? (f as Func<I, O>)(i) : (f ?? undefined);
}

export type DataAction<T, When, Whom> = {
  name: string;
  key?: string;
  form?: ModalItemFC<T>;
  icon?: Icon;
  whom?: Whom[];
  when?: When[];
  notWhen?: When[];
  onlyIf?: Func<T, boolean>;
  notIf?: Func<T, boolean>;
  main?: MaybeFunc<T, boolean>;
  red?: MaybeFunc<T, boolean>;
};

type Matcher<T, W> = (t: T, w: W, u: UserFullT) => boolean;

export type Actions<T, When, Whom> = {
  actions: DataAction<T, When, Whom>[];
  isWhen?: Matcher<T, When>;
  isWhom?: Matcher<T, Whom>;
};

// biome-ignore lint/suspicious/noExplicitAny: only need the first param
export type AnyActions<T> = Actions<T, any, any>;

export function buildActions<T, When, Who>(
  isWhen: Matcher<T, When>,
  isWho: Matcher<T, Who>,
  actions: DataAction<T, When, Who>[],
): Actions<T, When, Who> {
  return { actions, isWhen, isWhom: isWho };
}

function resolve<T, When, Who>(
  acts: Actions<T, When, Who>,
  item: T,
  user: UserFullT,
) {
  function some<T, W>(
    a: Maybe<W[]>,
    t: T,
    f: Maybe<(t: T, w: W, u: UserFullT) => boolean>,
  ) {
    return a?.length && f ? a.some((w) => f(t, w, user)) : null;
  }

  return pipe(
    acts.actions,
    filter((a) => {
      if (some(a.when, item, acts.isWhen) === false) return false;
      if (some(a.notWhen, item, acts.isWhen) === true) return false;
      if (a.onlyIf?.(item) === false) return false;
      if (a.notIf?.(item) === true) return false;
      return true;
    }),
    map((a) => ({
      key: a.key,
      name: a.name,
      form: a.form,
      icon: a.icon,
      main: callFunc(a.main, item) || false,
      red: callFunc(a.red, item) || false,
    })),
  );
}

export function useActions<T>(acts: AnyActions<T>, item: T) {
  const userQ = useApiGet("session/user", userFullZ);
  const user = userQ.data;
  return useMemo(
    () => (user ? resolve(acts, item, user) : []),
    [acts, item, user],
  );
}
