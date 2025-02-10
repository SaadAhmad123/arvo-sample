import { EventResolver } from '../src/EventResolver';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Generates a JSON file containing all event destinations that the EventResolver listens to.
 * This file is used by Terraform to configure EventBridge rules for event routing.
 *
 * The function:
 * 1. Gets all destinations from EventResolver
 * 2. Creates a dist directory if it doesn't exist
 * 3. Writes destinations to './dist/event_destinations.json'
 *
 * @throws Error if directory creation or file writing fails
 * @example
 * // Run the script:
 * (ts-node|tsx) scripts/generate-destinations.ts
 * // Creates: ./dist/event_destinations.json containing array of destination strings
 */
async function generateEventDestinations(): Promise<void> {
  console.log('Starting event destinations generation...');

  // Get destinations from EventResolver
  const resolver = EventResolver;
  const destinations = resolver.listensTo;
  console.log(`Found ${destinations.length} event destinations handled by this service`);

  // Create dist directory if needed
  const distPath = './dist';
  try {
    await fs.mkdir(distPath, { recursive: true });
    console.log('Ensured dist directory exists');
  } catch (error) {
    console.error('Error creating dist directory:', error);
    process.exit(1);
  }

  // Write destinations to JSON file
  const filePath = path.join(distPath, 'event_destinations.json');
  try {
    await fs.writeFile(filePath, JSON.stringify(destinations, null, 2));
    console.log(`Successfully wrote destinations to ${filePath}`);
  } catch (error) {
    console.error('Error writing destinations file:', error);
    process.exit(1);
  }
}

// Execute the generation
generateEventDestinations().catch(console.error);
