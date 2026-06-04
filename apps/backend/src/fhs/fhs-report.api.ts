import { utils } from "xlsx";
import { prisma } from "#/db";

async function fhsReport() {
  const data = prisma.ftthSurvey.findMany({});
  const book = utils.book_new();
}
