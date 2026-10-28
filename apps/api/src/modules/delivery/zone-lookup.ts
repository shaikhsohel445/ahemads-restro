import type { PrismaService } from '../../prisma/prisma.service';
import { stringArray } from '../../common/json-array';

// The active zone that covers a pincode. On PostgreSQL this was a
// `pincodes: { has }` filter; D1 keeps the list as a JSON array, so the
// branch's (few) active zones are matched in code.
export async function findZoneForPincode(
  prisma: PrismaService,
  branchId: string,
  pincode: string,
) {
  const zones = await prisma.deliveryZone.findMany({
    where: { branchId, isActive: true },
  });
  return zones.find((z) => stringArray(z.pincodes).includes(pincode)) ?? null;
}
