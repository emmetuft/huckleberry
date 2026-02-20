import { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { Button, Collapse, CollapseProps, Input, Select, Switch } from 'antd';
import {
  CheckCircle,
  Copy,
  Lightning,
  PencilSimple,
  Plus,
  TrashSimple,
  Warning,
} from 'phosphor-react';
import styles from './Automation.module.scss';
// import { getSourceSchema } from 'reducers/data/actions';
// import {
//   selectCreatingRule,
//   selectObservabilitySources,
// } from 'reducers/app/selectors';
// import { selectSchema } from 'reducers/data/selectors';
import { fakeRule } from 'constants/rules';
import { AutomationRule, RuleOperator } from 'models/interfaces/automation';
import { Column } from 'models/interfaces/column';
// import { ObservabilitySource } from 'models/interfaces/observabilitySource';
import Condition from './Condition';
import Action from './Action';

export const Automation = () => {
  // const dispatch = useDispatch();
  // const sources = useSelector(selectObservabilitySources);
  // const schema = useSelector(selectSchema);
  // const creatingRule = useSelector(selectCreatingRule);
  const sources: any[] = [];
  const schema: Record<string, Column[]> = {};
  const [creatingRule, setCreatingRule] = useState<boolean>(false);

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    { ...fakeRule, sourceId: sources.length > 0 ? sources[0].id : undefined },
  ]);
  const [draftRule, setDraftRule] = useState<AutomationRule | null>(null);
  const [ruleNameId, setRuleNameId] = useState<string | null>(null);
  const [ruleName, setRuleName] = useState<string>('');

  const columns = useMemo(() => {
    if (draftRule?.sourceId === undefined) return [];
    const source = sources.find((s: any) => s.id === draftRule.sourceId);
    if (source !== undefined) {
      return (schema[draftRule.sourceId] as Column[]) ?? [];
    }
    return [];
  }, [draftRule, schema]);

  useEffect(() => {
    // Fetch the data source schema if we don't already have it
    if (
      draftRule !== null &&
      draftRule.sourceId !== undefined &&
      schema[draftRule.sourceId] === undefined
    ) {
      // dispatch(getSourceSchema(draftRule.sourceId));
    }
  }, [draftRule?.sourceId]);

  useEffect(() => {
    if (creatingRule) {
      const newRule: AutomationRule = {
        id: uuidv4(),
        name: 'New Rule',
        conditions: [],
        actions: [],
        active: false,
      };
      setAutomationRules((prevRules) => [...prevRules, newRule]);
      setDraftRule(newRule);
    }
  }, [creatingRule]);

  const onSelectDataSource = (value: string) => {
    if (draftRule !== null) {
      setDraftRule({ ...draftRule, sourceId: value });
    }
  };

  const onClickEditRuleName = (e: any, rule: AutomationRule) => {
    e.stopPropagation();
    setRuleNameId(rule.id);
    setRuleName(rule.name);
  };

  const onClickSaveRuleName = (e: any) => {
    e.stopPropagation();
    if (ruleNameId === null) return;

    setAutomationRules((prevRules) =>
      prevRules.map((r) =>
        r.id === ruleNameId ? { ...r, name: ruleName } : r,
      ),
    );
    setRuleNameId(null);
  };

  const onToggleActive = (rule: AutomationRule, checked: boolean) => {
    setAutomationRules((prevRules) =>
      prevRules.map((r) => (r.id === rule.id ? { ...r, active: checked } : r)),
    );
  };

  const onClickNewRule = () => {
    setCreatingRule(true);
  };

  const onClickAddCondition = () => {
    if (draftRule === null) return;

    const newCondition = {
      id: uuidv4(),
      column: '',
      operator: RuleOperator.EQUALS,
      value: '',
    };

    setDraftRule({
      ...draftRule,
      conditions: [...draftRule.conditions, newCondition],
    });
  };

  const onClickAddAction = () => {
    if (draftRule === null) return;

    const newAction = {
      id: uuidv4(),
      type: '',
      value: '',
    };

    setDraftRule({
      ...draftRule,
      actions: [...draftRule.actions, newAction],
    });
  };

  const onSaveRule = () => {
    if (draftRule === null) return;

    setAutomationRules((prevRules) =>
      prevRules.map((r) => (r.id === draftRule.id ? draftRule : r)),
    );
    setDraftRule(null);
  };

  const onClickDelete = (rule: AutomationRule) => {
    setAutomationRules((prevRules) =>
      prevRules.filter((r) => r.id !== rule.id),
    );
    if (draftRule?.id === rule.id) {
      setDraftRule(null);
    }
  };

  const onClickDuplicate = (rule: AutomationRule) => {
    const newRule = { ...rule, id: uuidv4(), name: `${rule.name} (Copy)` };
    setAutomationRules((prevRules) => [...prevRules, newRule]);
    setDraftRule(newRule);
  };

  const items: CollapseProps['items'] = automationRules.map((rule) => {
    const currSource = sources.find((s) => s.id === rule.sourceId);
    const isEditing = draftRule !== null && draftRule.id === rule.id;

    const ruleContent = (
      <div className={styles.ruleContent}>
        {isEditing ? (
          <Select
            prefix={<span style={{ fontWeight: 600 }}>Data source:</span>}
            variant="filled"
            size="large"
            onChange={onSelectDataSource}
            options={sources.map((source) => ({
              value: source.id,
              label: source.entityName,
            }))}
          />
        ) : (
          <p>
            <span style={{ fontWeight: 600 }}>Data source:</span>{' '}
            {currSource?.entityName ?? 'None'}
          </p>
        )}

        {rule.sourceId === undefined &&
        (!isEditing || draftRule.sourceId === undefined) ? (
          <p>Select a data source to create conditions</p>
        ) : (
          <>
            <div>
              <h4>If:</h4>
              <div className={styles.conditionsWrapper}>
                {isEditing && draftRule !== null ? (
                  draftRule.conditions.map((condition) => (
                    <div key={condition.id} className={styles.condition}>
                      <Condition
                        condition={condition}
                        columns={columns}
                        draftRule={draftRule}
                        setDraftRule={setDraftRule}
                      />
                    </div>
                  ))
                ) : rule.conditions.length === 0 ? (
                  <p>No conditions set</p>
                ) : (
                  rule.conditions.map((condition) => (
                    <div key={condition.id} className={styles.condition}>
                      <p>
                        {condition.column} {condition.operator}{' '}
                        {condition.value}
                      </p>
                    </div>
                  ))
                )}
                {isEditing && (
                  <div className={styles.conditionOptions}>
                    <button
                      className={styles.addBtn}
                      onClick={onClickAddCondition}
                    >
                      <Plus />
                      Add condition
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4>Then:</h4>
              <div className={styles.conditionsWrapper}>
                {isEditing && draftRule !== null ? (
                  draftRule.actions.map((action) => (
                    <div key={action.type} className={styles.condition}>
                      <Action
                        action={action}
                        draftRule={draftRule}
                        setDraftRule={setDraftRule}
                      />
                    </div>
                  ))
                ) : rule.actions.length === 0 ? (
                  <p>No actions set</p>
                ) : (
                  rule.actions.map((action) => (
                    <div key={action.type} className={styles.condition}>
                      <p>
                        {action.type}: {action.value}
                      </p>
                    </div>
                  ))
                )}
                {isEditing && (
                  <div className={styles.conditionOptions}>
                    <button
                      className={styles.addBtn}
                      onClick={onClickAddAction}
                    >
                      <Plus />
                      Add action
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {isEditing ? (
          <div className={styles.btnWrapper}>
            <Button icon={<TrashSimple />} onClick={() => setDraftRule(null)}>
              Cancel
            </Button>
            <Button icon={<CheckCircle />} onClick={onSaveRule}>
              Save
            </Button>
          </div>
        ) : (
          <div className={styles.btnWrapper}>
            <Button icon={<TrashSimple />} onClick={() => onClickDelete(rule)}>
              Delete
            </Button>
            <Button icon={<Copy />} onClick={() => onClickDuplicate(rule)}>
              Duplicate
            </Button>
            <Button icon={<PencilSimple />} onClick={() => setDraftRule(rule)}>
              Edit
            </Button>
          </div>
        )}
      </div>
    );

    return {
      key: rule.id,
      label: (
        <div className={styles.ruleHeader}>
          <div className={styles.ruleName}>
            {ruleNameId === rule.id ? (
              <>
                <Input
                  variant="filled"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  onClick={(e) => e.stopPropagation()} // Prevent Collapse toggle
                  style={{ width: `${ruleName.length + 1}ch` }} // Dynamically set width
                />
                <button
                  className={styles.saveIcon}
                  onClick={onClickSaveRuleName}
                >
                  <CheckCircle size={20} />
                </button>
              </>
            ) : (
              <>
                <h4>{rule.name}</h4>
                <button onClick={(e) => onClickEditRuleName(e, rule)}>
                  <PencilSimple size={20} />
                </button>
              </>
            )}
          </div>
          <Switch
            checked={rule.active}
            onChange={(checked) => onToggleActive(rule, checked)}
          />
        </div>
      ),
      children: ruleContent,
    };
  });

  const numActive = automationRules.filter((rule) => rule.active).length;
  const numDisabled = automationRules.length - numActive;
  const numAIGenerated = automationRules.filter(
    (rule) => rule.aiGenerated === true,
  ).length;

  return (
    <div className={styles.automation}>
      <div className={styles.heading}>
        <div className={styles.tags}>
          {numActive > 0 && (
            <div className={`${styles.pill} ${styles.active}`}>
              <CheckCircle />
              <p>{numActive} active</p>
            </div>
          )}
          {numDisabled > 0 && (
            <div className={`${styles.pill} ${styles.disabled}`}>
              <Warning />
              <p>{numDisabled} disabled</p>
            </div>
          )}
          {numAIGenerated > 0 && (
            <div className={`${styles.pill} ${styles.aiGenerated}`}>
              <Lightning />
              <p>{numAIGenerated} AI generated</p>
            </div>
          )}
        </div>
        <div className={styles.buttons}>
          <Button type="primary" icon={<Plus />} onClick={onClickNewRule}>
            New rule
          </Button>
          <Button icon={<Lightning />}>AI suggest</Button>
        </div>
      </div>
      <Collapse size="large" items={items} defaultActiveKey={['1']} />
    </div>
  );
};
