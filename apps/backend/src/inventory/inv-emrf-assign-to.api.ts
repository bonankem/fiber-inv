import { Allow } from "#/auth/guard";
import  {prisma}  from "#/db";
import { postRoute } from "#/utils/routing";
import { EmrfStatus, StaffRole } from "schema/enums";
import { bad, Err } from "schema/errors";
import { emrfAssignToZ, emrfS, type EmrfAssignToT } from "schema/inventory";
import type { UserFullT } from "schema/people";

export const emrfAssignToApi = postRoute({
    url:"/inventory/emrf/assign-to",
    schema: emrfAssignToZ,
    allow: Allow.STAFF,
    handler: (req) => assignTo(req.body, req.authUser),
});

async function assignTo({id, orderNumber}: EmrfAssignToT, user:UserFullT,) {
    if(!user.isAdmin && user.staffRole !== StaffRole.ORACLE_TEAM){
        bad(Err.ACCESS_DENIED);
    }
    const result = await prisma.emrf.updateMany({
        where:{
            id,
            status: EmrfStatus.APPROVED,
            orderNumber: null,
        },
        data:{
            orderNumber,
            status: EmrfStatus.ORDERED,
        },
    });

    if(result.count === 0){
        const existing = await prisma.emrf.findUnique({
            where:{id},
            select: {id: true},        
        });
        if(!existing) bad(Err.NOT_FOUND);
        bad(Err.STATUS_ALREADY_CHANGED);
    }
    return prisma.emrf.findUniqueOrThrow({
        where: {id},
        select: emrfS,
    });
}

