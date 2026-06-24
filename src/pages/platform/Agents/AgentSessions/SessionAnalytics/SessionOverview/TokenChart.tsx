import { FC } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './SessionOverview.module.css';
import { nodeColors } from 'constants/styles';
import {
  AISessionEvent,
  ModelProviderUsage,
} from 'models/interfaces/sessionEvent';
import { formatCompactNumber } from 'utils/datetime';

type ServiceEvent = AISessionEvent & {
  service: string;
  serviceResponse: {
    modelProviderUsage?: ModelProviderUsage;
  };
};

interface TokenChartProps {
  sessionEvents: ServiceEvent[];
}

export const TokenChart: FC<TokenChartProps> = ({ sessionEvents }) => {
  const serviceNames = [...new Set(sessionEvents.map((e) => e.service))].sort();

  const serviceColorMap = Object.fromEntries(
    serviceNames.map((name, i) => [name, nodeColors[i % nodeColors.length]]),
  );

  const tokenChartData = [...sessionEvents].map((e) => ({
    id: e.eventId,
    name: e.service,
    inputTokens: e.serviceResponse?.modelProviderUsage?.inputTokens ?? 0,
    outputTokens: e.serviceResponse?.modelProviderUsage?.outputTokens ?? 0,
  }));

  return (
    <div>
      <p className={styles.chartTitle}>Token usage</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={tokenChartData} margin={{ left: -15, bottom: -15 }}>
          <XAxis
            dataKey="id"
            tickFormatter={(id) =>
              tokenChartData.find((d) => d.id === id)?.name ?? id
            }
            tick={false}
          />
          <YAxis tickFormatter={(v) => formatCompactNumber(v)} />
          <Tooltip
            cursor={false}
            formatter={(v) => formatCompactNumber(v as number)}
            labelFormatter={(id) =>
              tokenChartData.find((d) => d.id === id)?.name ?? id
            }
            labelStyle={{ fontWeight: '600' }}
            contentStyle={{
              padding: 'var(--space-lg)',
              background: 'var(--background)',
              borderRadius: 'var(--br-lg)',
              boxShadow: 'var(--box-shadow)',
              border: 'none',
            }}
          />
          <Bar dataKey="inputTokens" stackId="a" name="Input">
            {tokenChartData.map((entry) => (
              <Cell
                key={entry.id}
                fill={serviceColorMap[entry.name]}
                fillOpacity={0.4}
              />
            ))}
          </Bar>
          <Bar dataKey="outputTokens" stackId="a" name="Output">
            {tokenChartData.map((entry) => (
              <Cell key={entry.id} fill={serviceColorMap[entry.name]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className={styles.chartLegend}>
        {serviceNames.map((name) => (
          <div key={name} className={styles.chartLegendItem}>
            <span
              className={styles.chartLegendSwatch}
              style={{ backgroundColor: serviceColorMap[name] }}
            />
            {name}
          </div>
        ))}
      </div>
    </div>
  );
};
