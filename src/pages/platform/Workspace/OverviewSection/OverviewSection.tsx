import { FC } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';
import styles from './OverviewSection.module.css';
import { Avatar } from 'components/shared/Avatar/Avatar';
import { AttentionCard } from './AttentionCard/AttentionCard';
import { AttentionCardStatus } from 'models/enums/attentionCardStatus';

const mockDecisions = [
  {
    id: 1,
    title: 'Hold extension notices for batch-cleared accounts',
    committed: 'COMMITTED JUL 8',
    ownerName: 'Lena Ortiz',
    falsificationStatus: '640 held · 0 confusion reports',
    falsificationDetail: 'clean since split · holding',
    falsificationColor: 'green',
    checkBack: 'Jul 9',
    checkBackDetail: 'TODAY',
    checkBackColor: 'orange',
  },
  {
    id: 2,
    title: 'Reallocate staff + reroute the at-risk dispute cohort',
    committed: 'COMMITTED JUL 2',
    ownerName: 'Lena Ortiz',
    falsificationStatus: 'Cohort 61% cleared',
    falsificationDetail: '2.3 days ahead of projection · gaining',
    falsificationColor: 'green',
    checkBack: 'Jul 16',
    checkBackDetail: 'IN 7 DAYS',
    checkBackColor: undefined,
  },
  {
    id: 3,
    title: 'Auto-push holding macro on confirmed incidents',
    committed: 'COMMITTED JUN 30',
    ownerName: 'Marcus Bell',
    falsificationStatus: 'First-touch 96%',
    falsificationDetail: '6.0 above line · gaining',
    falsificationColor: 'green',
    checkBack: 'Aug 1',
    checkBackDetail: 'IN 3 WEEKS',
    checkBackColor: undefined,
  },
  {
    id: 4,
    title: 'Kill the descriptor-confusion pattern',
    committed: 'COMMITTED JUN 27',
    ownerName: 'Marcus Bell',
    falsificationStatus: '12 days recurrence-free',
    falsificationDetail: '18 clean days to close · holding',
    falsificationColor: 'green',
    checkBack: 'Jul 27',
    checkBackDetail: 'IN 18 DAYS',
    checkBackColor: undefined,
  },
];

export const OverviewSection: FC = () => {
  return (
    <section className={styles.overviewSection}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2>Overview</h2>
          <CaretDownIcon size={16} weight="bold" />
        </div>
        <span className={styles.sectionLabel}>What needs your attention</span>
      </div>

      <div className={styles.attentionGrid}>
        <AttentionCard
          id="under-review-1"
          category="Decision"
          status={AttentionCardStatus.UnderReview}
          timestamp="2026-06-12T00:00:00"
          title="Reroute fraud-flagged disputes to a shared queue"
          owner={{ name: 'Lena Ortiz', role: 'Action owner' }}
        >
          <p className={styles.cardDescription}>
            Resolution time this quarter: <strong>22% down</strong>. Gain is
            uniform across all 3 teams — the signature of a process fix. The
            call holds.
          </p>
        </AttentionCard>

        <AttentionCard
          id="disputes-aging-1"
          category="Finding"
          status={AttentionCardStatus.Noticed}
          timestamp="2026-07-14T12:44:00"
          title="312 disputes are aging toward Reg E deadlines: Stalled in the servicing → fraud handoff"
          footerContent={
            <span>
              All 312 share one root cause. <strong>0</strong> have a shared
              queue owner between servicing and fraud.
            </span>
          }
        >
          <div className={styles.metricRow}>
            <span className={styles.metricValue}>$1.4M</span>
            <span className={styles.metricLabel}>
              provisional credits exposed
            </span>
          </div>
          <div className={styles.chartSection}>
            <span className={styles.chartLabel}>
              Stalled disputes · by days to deadline
            </span>
            <div className={styles.barChart}>
              {[
                { label: 'Under 10 days', value: 118, max: 118 },
                { label: '10–14 days', value: 87, max: 118 },
                { label: '15–19 days', value: 46, max: 118 },
                { label: '20–24 days', value: 33, max: 118 },
                { label: '25 days or more', value: 28, max: 118 },
              ].map((row) => (
                <div key={row.label} className={styles.barRow}>
                  <span className={styles.barLabel}>{row.label}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${(row.value / row.max) * 100}%` }}
                    />
                  </div>
                  <span className={styles.barCount}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </AttentionCard>

        <AttentionCard
          id="noticed-overnight-1"
          isNew
          category="Finding"
          status={AttentionCardStatus.Noticed}
          timestamp="2026-07-14T04:12:00"
          footerContent={
            <span>
              Rob's team has been on it since the 28th (2 days before yours).
              Post-mortems usually find this in week 6.
            </span>
          }
        >
          <p className={styles.findingText}>
            Of the <strong>2,114 duplicate-posting disputes</strong> your team
            opened since the 28th, <strong>all trace to PB-2214:</strong> The
            same processor defect behind{' '}
            <strong>380 reconciliation breaks</strong> in Rob Chen's back-office
            queue.
          </p>
          <p className={styles.findingEmphasis}>Neither team knows.</p>
          <div className={styles.findingSources}>
            Sources · Disputes · Incident log · Org chart · Slack
          </div>
        </AttentionCard>
      </div>

      {/* Decisions in flight */}
      <div className={styles.decisionsSection}>
        <div className={styles.decisionsSectionHeader}>
          <span className={styles.sectionLabel}>Decisions in flight</span>
          <span className={styles.decisionsCount}>{mockDecisions.length}</span>
        </div>
        <div className={`card ${styles.decisionsTable}`}>
          <div className={styles.decisionsTableHeader}>
            <span>Decision</span>
            <span>Owner</span>
            <span>Falsification status</span>
            <span>Check-back</span>
          </div>
          {mockDecisions.map((d) => (
            <div key={d.id} className={styles.decisionsTableRow}>
              <div className={styles.decisionTitleCell}>
                <span className={styles.decisionTitle}>{d.title}</span>
                <span className={styles.decisionCommitted}>{d.committed}</span>
              </div>
              <div className={styles.decisionOwnerCell}>
                <Avatar name={d.ownerName} showName />
              </div>
              <div className={styles.decisionStatusCell}>
                <span>{d.falsificationStatus}</span>
                <span
                  className={`${styles.decisionStatusDetail} ${d.falsificationColor === 'green' ? styles.statusGreen : ''}`}
                >
                  {d.falsificationDetail}
                </span>
              </div>
              <div className={styles.decisionCheckBackCell}>
                <span
                  className={
                    d.checkBackColor === 'orange' ? styles.checkBackOrange : ''
                  }
                >
                  {d.checkBack}
                </span>
                <span className={styles.checkBackDetail}>
                  {d.checkBackDetail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
