import * as services from '../src/index.js';
import { getMockSettingsFactory } from './utils/mock.settings.js';

describe('Validating package exports', () => {
  it('should export handlers with unique sources', () => {
    const bagOfSources = new Set<string>();
    for (const service of Object.values(services)) {
      const instance = service({ settings: getMockSettingsFactory() });
      expect(bagOfSources.has(instance.source)).toBe(false);
      bagOfSources.add(instance.source);
    }
  });
});
