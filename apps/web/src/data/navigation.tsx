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
        name: "Etudes FTTH",
        path: "/ftth-surveys",
        icon: PencilRuler,
      },
      {
        name: "Projets FTTH",
        path: "/ftth-projects",
        icon: BriefcaseBusiness,
      },
      {
        name: "Connexions FTTH",
        path: "/ftth-connections",
        icon: HousePlug,
      },
    ],
  },
  {
    name: "Gestion",
    list: [
      {
        name: "Personnel de MTN",
        path: "/staff",
        icon: User,
      },
      {
        name: "Fournisseurs",
        path: "/vendors",
        icon: Handshake,
      },
    ],
  },
];
