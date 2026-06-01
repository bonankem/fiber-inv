import { m } from "i18n/messages";
import {
  BriefcaseBusiness,
  Handshake,
  HousePlug,
  PencilRuler,
  User,
} from "lucide-react";

type NavIcon = typeof PencilRuler;

type NavItem = {
  path: string;
  name: string;
  icon: NavIcon;
};

type NavGroup = {
  name: string;
  list: NavItem[];
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
    ],
  },
];
