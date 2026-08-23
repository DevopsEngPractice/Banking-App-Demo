import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';

const resource = resourceFromAttributes({
  'service.name': 'banking-frontend',
});

const exporter = new OTLPMetricExporter({
  url: 'http://your-otel-collector-address:4318/v1/metrics',
});

const meterProvider = new MeterProvider({
  resource: resource,
});

meterProvider.addMetricReader(new PeriodicExportingMetricReader({
  exporter: exporter,
  exportIntervalMillis: 60000,
}));

export const meter = meterProvider.getMeter('react-app-meter');

export const routeDurationHistogram = meter.createHistogram('frontend_route_duration_seconds', {
  description: 'Measures the time users spend on each route in seconds',
  unit: 's',
});

export const apiLatencyHistogram = meter.createHistogram('frontend_api_latency_seconds', {
  description: 'Measures the response time of outgoing backend API calls',
  unit: 's',
});