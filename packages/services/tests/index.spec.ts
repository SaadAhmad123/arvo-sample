import * as services from '../src/index.js';
import { mockSettings } from './mock.settings.js';

describe('Validating package exports', () => {
  it('should export handlers with unique sources', () => {
    const bagOfTypes = new Set<string>();
    for (const service of Object.values(services)) {
      const instance = service({ settings: mockSettings });
      expect(bagOfTypes.has(instance.source)).toBe(false);
      bagOfTypes.add(instance.source);
    }
  });
});
