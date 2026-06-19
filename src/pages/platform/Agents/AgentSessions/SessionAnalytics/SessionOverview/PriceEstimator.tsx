import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { PiggyBankIcon } from '@phosphor-icons/react';
import styles from './SessionOverview.module.css';
import { AgentSession } from 'models/interfaces/session';
import {
  AISessionEvent,
  AISessionEventType,
} from 'models/interfaces/sessionEvent';
import { TOKEN_PRICING } from 'constants/tokenPricing';
import { selectAIModels } from 'reducers/agents/slice';
import {
  SkeletonBlock,
  SkeletonGroup,
} from 'components/shared/Skeleton/Skeleton';

interface PriceEstimatorProps {
  agentSession: AgentSession | null;
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
  agentSession,
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
        {loading ? (
          <SkeletonBlock height={13} width={100} />
        ) : (
          <p className={styles.priceTitle}>Price estimate</p>
        )}
        {loading ? (
          <SkeletonGroup>
            <SkeletonBlock height={11} width="90%" />
            <SkeletonBlock height={11} width="82%" />
          </SkeletonGroup>
        ) : modelEntries.length === 0 ? (
          <p className={styles.priceFormula}>No pricing data available</p>
        ) : (
          modelEntries.map((usage) => (
            <div key={usage.modelName}>
              <p className={styles.priceFormula}>
                {`Input:  ${usage.inputTokens.toLocaleString()} tokens × $${usage.inputPricePerMillion.toFixed(4)}/M = $${usage.inputCost.toFixed(6)}`}
              </p>
              <p className={styles.priceFormula}>
                {`Output: ${usage.outputTokens.toLocaleString()} tokens × $${usage.outputPricePerMillion.toFixed(4)}/M = $${usage.outputCost.toFixed(6)}`}
              </p>
            </div>
          ))
        )}
      </div>
      <div className={styles.total}>
        {loading ? (
          <SkeletonBlock height={28} width={80} />
        ) : (
          `$${total.toFixed(6)}`
        )}
      </div>
    </div>
  );
};
