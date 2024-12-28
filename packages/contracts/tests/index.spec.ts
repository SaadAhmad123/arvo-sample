import * as contracts from '../src/index.js';

describe('Contract exports', () => {
  it('should export unique contract URIs', () => {
    const bagOfUris = new Set<string>();
    for (const contract of Object.values(contracts)) {
      expect(bagOfUris.has(contract.uri)).toBe(false);
      bagOfUris.add(contract.uri);
    }
  });

  it('should export unique types', () => {
    const bagOfTypes = new Set<string>();
    for (const contract of Object.values(contracts)) {
      expect(bagOfTypes.has(contract.type)).toBe(false);
      bagOfTypes.add(contract.type);
    }
  });
});
