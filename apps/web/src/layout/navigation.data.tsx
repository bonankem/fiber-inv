import { m } from "i18n/messages";
import {
  BriefcaseBusiness,
  Handshake,
  HousePlug,
  Lock,
  PencilRuler,
  User,
} from "lucide-react";

type NavIcon = typeof PencilRuler;

export type NavItem = {
  path: string;
  name: string;
  icon: NavIcon;
  only?: "admin" | "staff";
};

type NavGroup = {
  name: string;
  list: NavItem[];
  only?: "admin" | "staff";
};

export const navigationData: NavGroup[] = [
  {
    name: "FTTx",
    list: [
      {
        name: m.fttx_hp_planning(),
        path: "/ftth-surveys",
        icon: PencilRuler,
      },
      {
        name: m.fttx_hp_delivery(),
        path: "/ftth-projects",
        icon: BriefcaseBusiness,
      },
      {
        name: m.fttx_hc_delivery(),
        path: "/ftth-connections",
        icon: HousePlug,
      },
    ],
  },
  {
    name: m.management(),
    only: "admin",
    list: [
      {
        name: m.staff(),
        path: "/staff",
        icon: User,
      },
      {
        name: m.vendors(),
        path: "/vendors",
        icon: Handshake,
      },
      {
        name: m.security(),
        path: "/security",
        icon: Lock,
        only: "admin",
      },
    ],
  },
];
