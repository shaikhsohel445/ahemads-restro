import { NotImplementedException } from '@nestjs/common';
import { SYNC_UNAVAILABLE, SyncService } from './sync.service';

// Server sync is not part of the Cloudflare edition (see sync.service.ts):
// status must say so plainly and every action must refuse with 501, never
// pretend to have synced.
describe('SyncService on Cloudflare', () => {
  const sync = new SyncService();

  it('reports itself as disabled and unavailable', async () => {
    const status = await sync.publicStatus();
    expect(status.enabled).toBe(false);
    expect(status.unavailable).toBe(true);
    expect(status.lastError).toBe(SYNC_UNAVAILABLE);
  });

  it.each([
    ['pull', () => sync.pull(0n, 'device')],
    ['push', () => sync.push('device', [])],
    ['enable', () => sync.enable('https://hub', 'key', 'merge')],
    ['runOnce', () => sync.runOnce()],
  ])('%s answers 501 Not Implemented', async (_name, run) => {
    await expect(run()).rejects.toBeInstanceOf(NotImplementedException);
  });
});
