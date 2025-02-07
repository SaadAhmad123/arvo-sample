# AWS Serverless Sample

This workspace demonstrates the implementation of an Arvo system in AWS serverless environment. The architecture follows a modular monolithic approach packaged into AWS Lambda functions, showcasing how Arvo's event-driven patterns can be effectively deployed in a serverless context.

## Architecture Overview

The system consists of two primary Lambda functions working in conjunction with **AWS EventBridge**. The first Lambda function, referred to as `federated_handler`, serves as a centralized event handler hosting multiple services. When an event arrives, the lambda examines the `event.to` field to determine the appropriate handler. This consolidation of services into a single Lambda function simplifies the deployment while demonstrating the core architectural principles.

The second Lambda function, `api_lambda`, implements a thin API layer, providing an interface for external interaction with the system. This layer serves two crucial purposes: 

- It forwards incoming requests to EventBridge and manages response handling. 
- When services need to return results to users, they target this layer using the designated address 'api.thin.lambda'. These responses are persisted in **DynamoDB**, enabling state querying through the `subject` string provided to users.

EventBridge functions as the event broker in this architecture. It manages event routing and implements event queuing when necessary to maintain controlled processing rates. The queuing mechanism helps prevent overwhelming the handlers during high-load scenarios.

## About This Sample

### What This Sample Shows

- This implementation demonstrates how Arvo naturally fits into serverless environments, showing how business logic remains clean and unchanged regardless of deployment model. The sample particularly shines in showing how event routing and handling work in AWS Lambda.
  
- You'll see practical integration between Arvo and AWS services, with EventBridge serving as the event broker. This shows how Arvo's event routing concepts map cleanly to AWS's native capabilities.
  
- The sample emphasizes modularity in action. While it packaged services together for simplicity, the code structure clearly shows how these could be separated without changing their implementation.

### What This Sample Is Not About

- This, out of the box, isn't meant to be a high-scale production-ready implementation. **You won't find advanced error handling patterns or retry mechanisms that you'd need in a real-world system.**
  
- It has intentionally skipped over optimization concerns like Lambda cold starts and connection pooling. These are crucial for large scale production application but would distract from the core architectural concepts.
  
- The sample doesn't dive into security patterns. While it shows basic event flow, it doesn't demonstrate access controls, event encryption, or secure secret management.
  
- You won't see multiple deployment options here. While Arvo supports various configurations, from fully distributed to in-memory, this sample focuses on one clear approach.

## Final Notes

This workspace serves as a practical reference for developers exploring how Arvo's abstractions translate to real-world serverless infrastructure. It's designed to be clear and focused, showing one solid way to implement Arvo in AWS Lambda while leaving room for you to adapt and expand based on your specific needs.

The implementation choices here prioritize clarity over optimization, making it easier to understand how Arvo's event-driven patterns work in a serverless context. Use this as a starting point for understanding the possibilities, not as a blueprint for production systems.
