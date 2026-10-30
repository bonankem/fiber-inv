import { Allow } from "#/auth/guard";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";
import { EmrfStatus, StaffRole } from "schema/enums";
import { bad, Err } from "schema/errors";
import { emrfS } from "schema/inventory";
import z from "zod";

export const emrfOracleQueueApi = getRoute({
    url:"/inventory/emrf/oracle-queue",
    schema: z.object({}),
    allow: Allow.STAFF,
    handler: async({authUser}) =>{
        if(!authUser.isAdmin && authUser.staffRole !== StaffRole.ORACLE_TEAM){
            bad(Err.ACCESS_DENIED);
        }
        return prisma.emrf.findMany({
            where:{
                status: EmrfStatus.APPROVED,
                orderNumber: null,
            },
            select: emrfS,
            orderBy: {approvedAt: "asc"},
        });
    },
});