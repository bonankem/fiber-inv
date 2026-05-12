import { uuidv7 } from "uuidv7";
import { prisma } from "#/prisma";
import { postRoute } from "#/utils";
import { makeKey } from "../utils/queries";

export default postRoute("/setup/localities", null, async () => {
  const old = await prisma.district.findMany({
    select: { id: true, key: true, name: true },
  });
  return prisma.$transaction(setupLocalities(old));
});

export const geoDefaults = [
  {
    name: "Abidjan",
    list: [
      "Abobo",
      "Adjamé",
      "Anyama",
      "Attécoubé",
      "Bingerville",
      "Cocody",
      "Koumassi",
      "Marcory",
      "Plateau",
      "Port-Bouët",
      "Songon",
      "Treichville",
      "Yopougon",
    ],
  },
  {
    name: "Bas-Sassandra",
    list: [
      "Buyo",
      "Fresco",
      "Guéyo",
      "Méagui",
      "San-Pédro",
      "Sassandra",
      "Soubré",
      "Tabou",
    ],
  },
  {
    name: "Comoé",
    list: [
      "Abengourou",
      "Aboisso",
      "Adiaké",
      "Agnibilékrou",
      "Bettié",
      "Grand-Bassam",
      "Tiapoum",
    ],
  },
  {
    name: "Denguélé",
    list: [
      "Gbéléban",
      "Kaniasso",
      "Madinani",
      "Minignan",
      "Odienné",
      "Samatiguila",
      "Séguélon",
    ],
  },
  {
    name: "Gôh-Djiboua",
    list: ["Divo", "Gagnoa", "Guitry", "Lakota", "Oumé"],
  },
  {
    name: "Lacs",
    list: [
      "Arrah",
      "Bocanda",
      "Bongouanou",
      "Daoukro",
      "Didiévi",
      "Dimbokro",
      "Djékanou",
      "Kouassi-Kouassikro",
      "M'Bahiakro",
      "M'Batto",
      "Ouellé",
      "Prikro",
      "Tiébissou",
      "Toumodi",
    ],
  },
  {
    name: "Lagunes",
    list: [
      "Adzopé",
      "Agboville",
      "Akoupé",
      "Alépé",
      "Dabou",
      "Grand-Lahou",
      "Jacqueville",
      "Sikensi",
      "Taabo",
      "Tiassalé",
      "Yakassé-Attobrou",
    ],
  },
  {
    name: "Montagnes",
    list: [
      "Bangolo",
      "Biankouma",
      "Bloléquin",
      "Danané",
      "Duékoué",
      "Facobly",
      "Guiglo",
      "Kouibly",
      "Man",
      "Sipilou",
      "Taï",
      "Toulépleu",
      "Zouan-Hounien",
    ],
  },
  {
    name: "Sassandra-Marahoué",
    list: [
      "Bonon",
      "Bouaflé",
      "Daloa",
      "Gohitafla",
      "Issia",
      "Sinfra",
      "Vavoua",
      "Zoukougbeu",
      "Zuénoula",
    ],
  },
  {
    name: "Savanes",
    list: [
      "Boundiali",
      "Dikodougou",
      "Ferkessédougou",
      "Kong",
      "Korhogo",
      "Kouto",
      "M'Bengué",
      "Ouangolodougou",
      "Sinématiali",
      "Tengréla",
    ],
  },
  {
    name: "Vallée du Bandama",
    list: [
      "Botro",
      "Bouaké",
      "Béoumi",
      "Dabakala",
      "Katiola",
      "Niakaramandougou",
      "Sakassou",
    ],
  },
  {
    name: "Woroba",
    list: [
      "Dianra",
      "Kani",
      "Koro",
      "Kounahiri",
      "Mankono",
      "Ouaninou",
      "Séguéla",
      "Touba",
    ],
  },
  {
    name: "Yamoussoukro",
    list: ["Attiégouakro", "Yamoussoukro"],
  },
  {
    name: "Zanzan",
    list: [
      "Bondoukou",
      "Bouna",
      "Doropo",
      "Koun-Fao",
      "Nassian",
      "Sandégué",
      "Tanda",
      "Transua",
      "Téhini",
    ],
  },
];

export function setupLocalities(
  old?: { id: string; key: string; name: string }[],
) {
  const districts = old?.length
    ? old
    : geoDefaults.map(({ name }) => ({
        id: uuidv7(),
        key: makeKey(name),
        name,
      }));

  const districtIds = Object.fromEntries(districts.map((d) => [d.name, d.id]));

  const localities = geoDefaults.flatMap((d) => {
    return d.list.map((name) => {
      const id = uuidv7();
      const key = makeKey(name);
      // biome-ignore lint/style/noNonNullAssertion: -
      const districtId = districtIds[d.name]!;
      return { id, key, name, districtId };
    });
  });

  return [
    prisma.district.createMany({ data: districts, skipDuplicates: true }),
    prisma.locality.createMany({ data: localities, skipDuplicates: true }),
  ];
}
