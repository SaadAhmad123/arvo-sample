import * as Services from '@repo/services'
import { 
    SQSEvent, 
    SQSRecord, 
    EventBridgeEvent, 
    APIGatewayProxyResult 
} from 'aws-lambda'
import { createArvoEvent } from 'arvo-core'

interface CustomEventDetail {
    action?: string;
    payload?: any;
    timestamp?: string;
}

type LambdaEvent = SQSEvent | EventBridgeEvent<string, CustomEventDetail>

export const handler = async (event: LambdaEvent): Promise<APIGatewayProxyResult> => {
    try {
        const isSQSEvent = (event: LambdaEvent): event is SQSEvent => {
            return 'Records' in event
        }

        const isEventBridgeEvent = (
            event: LambdaEvent
        ): event is EventBridgeEvent<string, CustomEventDetail> => {
            return 'detail' in event
        }

        console.log('Received event:', JSON.stringify(event, null, 2))

        if (isSQSEvent(event)) {
            await processSQSEvent(event.Records)
        } else if (isEventBridgeEvent(event)) {
            await processEventBridgeEvent(event.detail)
        } else {
            console.log("Unknown event")
        }

        const handler = Services.anthropicCompletions({settings: async () => ({
            ANTHROPIC_API_KEY: ''
        })})

        
        
        const arvoEvent = createArvoEvent(event as any)
        console.log({event, arvoEvent})
        const result = await handler.execute(arvoEvent, {inheritFrom: 'EVENT'})

        return {
            statusCode: 200,
            body: JSON.stringify({arvoEvent, result}),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    } catch (error) {
        console.error('Error processing event:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error processing event',
                error: error instanceof Error ? error.message : 'Unknown error'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    }
}

// Helper function to process SQS records
async function processSQSRecord(record: SQSRecord): Promise<void> {
    try {
        const messageBody = JSON.parse(record.body)
        console.log('Processing SQS message:', messageBody)
        // Add your SQS message processing logic here
    } catch (error) {
        console.error('Error processing SQS record:', error)
        throw error
    }
}

// Helper function to process multiple SQS records
async function processSQSEvent(records: SQSRecord[]): Promise<void> {
    // Process all records in parallel using Promise.all
    await Promise.all(records.map(processSQSRecord))
}

// Helper function to process EventBridge events
async function processEventBridgeEvent(detail: CustomEventDetail): Promise<void> {
    console.log('Processing EventBridge event:', detail)
    // Add your EventBridge event processing logic here
}

handler({
    "type": "com.anthropic.completions",
    "source": "saad.saad.saad",
    "to": "saad.saad.saad",
    "dataschema": "#/services/anthropic/saad/completions/1.0.0",
    "subject": "eJwljdEOwiAMRf+lz0JgQ5n+gZ9RaY0kDkzpjMmyf5fpW2/vzTkrVEkPbiqoVeCyQsGZ4QKpzhaLPqS+crI9vZ6suZYGB3iztH72lbfOOtgOwB9Oi/6eK2Tq1TSS85GiOSOeTODRG5z8YNifcbg5uuHdd1YuWfPfDY3lnRPbKpmLMlmpi7Ls/JkVd3Tjtquvu8FRGEOMdxMjkgk0oemCwcTgaBySx2PwsG1fcfhIGg==",
    "data": {
      "max_tokens": 4096,
      "system_command": "You are a helpful assistant",
      "temperature": 0.5,
      "json_response": false,
      "messages": [
        {
          "role": "user",
          "content": "string"
        }
      ],
      "model": "claude-3-haiku-20240307"
    }
  })