import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { PiggyBankIcon } from '@phosphor-icons/react';
import { Skeleton, Tag } from 'antd';
import styles from './SessionOverview.module.css';
import { selectAIModels } from 'reducers/agents/slice';
import { TOKEN_PRICING } from 'constants/tokenPricing';
import {
  AISessionEvent,
  AISessionEventType,
} from 'models/interfaces/sessionEvent';

interface PriceEstimatorProps {
  sessionEvents: AISessionEvent[];
  loading?: boolean;
}

interface ModelUsage {
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  inputCost: number;
  outputCost: number;
}

export const PriceEstimator: FC<PriceEstimatorProps> = ({
  sessionEvents,
  loading = false,
}) => {
  const aiModels = useSelector(selectAIModels);

  const { byModel, total } = useMemo(() => {
    const modelNameMap = Object.fromEntries(
      aiModels.map((m) => [m.id, m.name]),
    );
    const byModel: Record<string, ModelUsage> = {};
    let total = 0;

    for (const event of sessionEvents) {
      if (event.type !== AISessionEventType.AI_SERVICE_RESPONSE) continue;
      const { modelId, modelProviderUsage } = event.serviceResponse;
      const pricing = TOKEN_PRICING[modelId];
      if (!pricing) continue;

      const inputCost =
        modelProviderUsage.inputTokens * pricing.inputPricePerToken;
      const outputCost =
        modelProviderUsage.outputTokens * pricing.outputPricePerToken;

      if (!byModel[modelId]) {
        byModel[modelId] = {
          modelName: modelNameMap[modelId] ?? modelId,
          inputTokens: 0,
          outputTokens: 0,
          inputPricePerMillion: pricing.inputPricePerToken * 1_000_000,
          outputPricePerMillion: pricing.outputPricePerToken * 1_000_000,
          inputCost: 0,
          outputCost: 0,
        };
      }
      byModel[modelId].inputTokens += modelProviderUsage.inputTokens;
      byModel[modelId].outputTokens += modelProviderUsage.outputTokens;
      byModel[modelId].inputCost += inputCost;
      byModel[modelId].outputCost += outputCost;
      total += inputCost + outputCost;
    }

    return { byModel, total };
  }, [sessionEvents, aiModels]);

  const modelEntries = Object.values(byModel);

  return (
    <div className={styles.priceEstimate}>
      <PiggyBankIcon size={22} />
      <div className={styles.priceBreakdown}>
        <p className={styles.priceTitle}>Price estimate</p>
        {loading ? (
          <>
            <Skeleton.Button
              active
              size="small"
              style={{ width: '90%', height: 11 }}
            />
            <Skeleton.Button
              active
              size="small"
              style={{ width: '82%', height: 11 }}
            />
          </>
        ) : modelEntries.length === 0 ? (
          <p className={styles.priceFormula}>No pricing data available</p>
        ) : (
          modelEntries.map((usage) => (
            <div key={usage.modelName}>
              <Tag className={styles.modelTag}>{usage.modelName}</Tag>
              <p className={styles.priceFormula}>
                {`Input:  ${usage.inputTokens.toLocaleString()} tokens × $${usage.inputPricePerMillion.toFixed(4)}/M = $${usage.inputCost.toFixed(4)}`}
              </p>
              <p className={styles.priceFormula}>
                {`Output: ${usage.outputTokens.toLocaleString()} tokens × $${usage.outputPricePerMillion.toFixed(4)}/M = $${usage.outputCost.toFixed(4)}`}
              </p>
            </div>
          ))
        )}
      </div>
      <div className={styles.total}>
        {loading ? (
          <Skeleton.Button
            active
            size="small"
            style={{ width: 80, height: 28 }}
          />
        ) : (
          `$${total.toFixed(4)}`
        )}
      </div>
    </div>
  );
};
