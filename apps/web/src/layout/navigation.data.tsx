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
    name: "FTTH",
    list: [
      {
        name: m.ftth_surveys(),
        path: "/ftth-surveys",
        icon: PencilRuler,
      },
      {
        name: m.ftth_projects(),
        path: "/ftth-projects",
        icon: BriefcaseBusiness,
      },
      {
        name: m.ftth_connections(),
        path: "/ftth-connections",
        icon: HousePlug,
      },
    ],
  },
  {
    name: m.management(),
    only: "staff",
    list: [
      {
        name: m.mtn_staff(),
        path: "/staff",
        icon: User,
      },
      {
        name: m.vendors(),
        path: "/vendors",
        icon: Handshake,
      },
      {
        name: m.sec_settings(),
        path: "/security",
        icon: Lock,
        only: "admin",
      },
    ],
  },
];
