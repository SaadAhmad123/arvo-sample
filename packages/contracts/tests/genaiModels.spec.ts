import { z } from 'zod';
import { LLMModels } from '../src/genaiModels.js';

describe('Validate GenAI model export', () => {
  it('should be a record with string keys and array of string values', () => {
    const schema = z.record(z.string(), z.string().array());
    expect(() => {
      schema.parse(LLMModels);
    }).not.toThrow();
  });
});
