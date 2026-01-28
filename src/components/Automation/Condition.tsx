import { FC, useMemo } from 'react';
// import { useSelector } from 'react-redux';
import { Input, Select } from 'antd';
// import { selectIsFetchingSchema } from 'reducers/data/selectors';
import {
  AutomationRule,
  RuleCondition,
  RuleOperator,
} from 'models/interfaces/automation';
import { Column } from 'models/interfaces/column';

interface Props {
  condition: RuleCondition;
  columns: Column[];
  draftRule: AutomationRule;
  setDraftRule: (rule: AutomationRule) => void;
}

const Condition: FC<Props> = ({
  condition,
  columns,
  draftRule,
  setDraftRule,
}) => {
  // const isFetchingSchema = useSelector(selectIsFetchingSchema);

  const selectedColumn = condition.column;
  const selectedOperator = condition.operator;
  const selectedValue = condition.value;

  const sharedProps = {
    style: { flex: 1 },
    variant: 'filled' as 'filled',
  };

  const onChangeColumn = (value: string) => {
    setDraftRule({
      ...draftRule,
      conditions: draftRule.conditions.map((cond) => {
        if (cond.id === condition.id) {
          return {
            ...cond,
            column: value,
          };
        }
        return cond;
      }),
    });
  };

  const onChangeOperator = (value: RuleOperator) => {
    setDraftRule({
      ...draftRule,
      conditions: draftRule.conditions.map((cond) => {
        if (cond.id === condition.id) {
          return {
            ...cond,
            operator: value,
          };
        }
        return cond;
      }),
    });
  };

  const onChangeValue = (e: any) => {
    setDraftRule({
      ...draftRule,
      conditions: draftRule.conditions.map((cond) => {
        if (cond.id === condition.id) {
          return {
            ...cond,
            value: e.target.value,
          };
        }
        return cond;
      }),
    });
  };

  const inputComponent = useMemo(() => {
    switch (selectedOperator) {
      case RuleOperator.IS_NULL:
      case RuleOperator.IS_NOT_NULL:
        return null;

      default:
        return (
          <Input
            {...sharedProps}
            placeholder="Enter value"
            value={selectedValue}
            onChange={onChangeValue}
          />
        );
    }
  }, [selectedOperator, selectedValue]);

  return (
    <>
      <Select
        {...sharedProps}
        placeholder="Select column"
        // loading={isFetchingSchema}
        value={selectedColumn}
        options={
          columns.map((column) => ({
            value: column.name,
            label: column.name,
          })) ?? []
        }
        onChange={onChangeColumn}
      />
      <Select
        {...sharedProps}
        placeholder="Select operator"
        value={selectedOperator}
        options={Object.keys(RuleOperator).map((key) => ({
          value: RuleOperator[key as keyof typeof RuleOperator],
          label: key.replace(/_/g, ' ').toLowerCase(),
        }))}
        onChange={onChangeOperator}
      />
      {inputComponent}
    </>
  );
};

export default Condition;
