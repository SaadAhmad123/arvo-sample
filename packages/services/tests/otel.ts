import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { type InstrumentationConfigMap, getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter as GRPCTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPTraceExporter as ProtoTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import * as dotenv from 'dotenv';
dotenv.config();

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const createTelemetrySdk = () => {
  if (!process.env.ENABLE_OTEL) return;
  const telemetryResources = new Resource({
    [ATTR_SERVICE_NAME]: 'icarus-services-tests',
  });

  const nodeInstrumentationConfig: InstrumentationConfigMap = {
    '@opentelemetry/instrumentation-fs': {
      enabled: true,
    },
    '@opentelemetry/instrumentation-http': {
      enabled: true,
    },
  };

  if (process.env.EXPORTER_OTEL === 'JAEGER') {
    return new NodeSDK({
      resource: telemetryResources,
      traceExporter: new GRPCTraceExporter(),
      instrumentations: [getNodeAutoInstrumentations(nodeInstrumentationConfig)],
    });
  }
  if (process.env.EXPORTER_OTEL === 'PHOENIX') {
    return new NodeSDK({
      resource: telemetryResources,
      traceExporter: new ProtoTraceExporter({
        url: 'http://localhost:6006/v1/traces',
      }),
      instrumentations: [getNodeAutoInstrumentations(nodeInstrumentationConfig)],
    });
  }
  return new NodeSDK({
    resource: telemetryResources,
    traceExporter: new ConsoleSpanExporter(),
    instrumentations: [getNodeAutoInstrumentations()],
  });
};

// Console Logger
export const telemetrySdk = createTelemetrySdk();

export const telemetrySdkStart = async () => {
  if (process.env.ENABLE_OTEL === 'TRUE') {
    await telemetrySdk?.start();
  }
};

export const telemetrySdkStop = async () => {
  await telemetrySdk?.shutdown();
};
