import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import type { IMachineMemory, MachineMemoryRecord } from 'arvo-xstate';
import { backOff } from 'exponential-backoff';

/**
 * DynamoDB implementation of IMachineMemory using separate tables for state data and locks.
 * Provides optimistic locking for state updates and TTL-based locks with retries. This is
 * used by ArvoOrchestrator to manage machine state
 *
 * @template T - Type of state machine data
 */
export class DynamoMachineMemory<T extends MachineMemoryRecord = MachineMemoryRecord> implements IMachineMemory<T> {
  private readonly client: DynamoDBDocumentClient;
  private readonly lockTTLSeconds = 300;
  private readonly maxRetries = 3;

  /**
   * Creates DynamoDB memory store for state machines
   *
   * @param dataTableName - DynamoDB table for state data (requires 'id' partition key)
   * @param lockTableName - DynamoDB table for locks (requires 'id' key and TTL on 'expiresAt')
   * @param config - Optional AWS credentials and region
   */
  constructor(
    private readonly dataTableName: string,
    private readonly lockTableName: string,
    config?: {
      accessKeyId?: string;
      secretAccessKey?: string;
      region?: string;
    },
  ) {
    const dbClient = new DynamoDBClient(config || {});
    this.client = DynamoDBDocumentClient.from(dbClient);
  }

  /**
   * Gets state data for machine ID.
   * No retries on failure - fails fast.
   *
   * @throws Error if read operation fails
   */
  async read(id: string): Promise<T | null> {
    try {
      const result = await this.client.send(
        new GetCommand({
          TableName: this.dataTableName,
          Key: { id },
        }),
      );
      return result.Item?.data || null;
    } catch (error) {
      throw new Error(`Failed to read machine state: ${(error as Error).message}`);
    }
  }

  /**
   * Saves state data with optimistic locking using previous state.
   * No retries on failure - fails fast.
   *
   * @throws Error if write operation fails
   */
  async write(id: string, data: T, prevData: T | null): Promise<void> {
    const params = {
      TableName: this.dataTableName,
      Item: {
        id,
        data,
        updatedAt: Date.now(),
      },
      ConditionExpression: prevData === null ? 'attribute_not_exists(data)' : 'data = :prevData',
      ExpressionAttributeValues: prevData === null ? undefined : { ':prevData': prevData },
    };

    try {
      await this.client.send(new PutCommand(params));
    } catch (error) {
      throw new Error(`Failed to write machine state: ${(error as Error).message}`);
    }
  }

  /**
   * Acquires execution lock with retries.
   * Uses TTL to prevent deadlocks.
   *
   * @returns true if lock acquired, false if unavailable after retries
   * @throws Error if lock operation fails (not from denial)
   */
  async lock(id: string): Promise<boolean> {
    try {
      return await backOff(
        async () => {
          try {
            await this.client.send(
              new PutCommand({
                TableName: this.lockTableName,
                Item: {
                  id,
                  expiresAt: Math.floor(Date.now() / 1000) + this.lockTTLSeconds,
                  lockedAt: Date.now(),
                },
                ConditionExpression: 'attribute_not_exists(id) OR expiresAt < :now',
                ExpressionAttributeValues: {
                  ':now': Math.floor(Date.now() / 1000),
                },
              }),
            );
            return true;
          } catch (error) {
            if ((error as { name?: string }).name === 'ConditionalCheckFailedException') {
              return false;
            }
            throw error;
          }
        },
        {
          numOfAttempts: this.maxRetries,
          startingDelay: 100,
          jitter: 'full',
        },
      );
    } catch (error) {
      throw new Error(`Lock operation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Releases execution lock.
   * Safe to call multiple times - fails silently.
   */
  async unlock(id: string): Promise<boolean> {
    try {
      await this.client.send(
        new DeleteCommand({
          TableName: this.lockTableName,
          Key: { id },
        }),
      );
      return true;
    } catch (error) {
      console.warn(`Failed to unlock ${id}: ${(error as Error).message}`);
      return false;
    }
  }
}
