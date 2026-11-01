import mongoose from 'mongoose';

import { beforeAll, afterAll, aroundEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});