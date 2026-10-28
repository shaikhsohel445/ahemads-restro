// Jest stand-in for Workers-only modules (`cloudflare:workers`,
// `@prisma/adapter-d1`, font Data modules) that unit tests never exercise.
export default new ArrayBuffer(0);
export class PrismaD1 {}
export abstract class DurableObject {}
export function waitUntil(promise: Promise<unknown>) {
  promise.catch(() => undefined);
}
