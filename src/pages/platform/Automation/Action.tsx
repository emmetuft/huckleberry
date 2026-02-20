import { FC, useMemo } from 'react';
import { Select } from 'antd';
import { actionTypes, actionValues } from 'constants/rules';
import { AutomationRule, RuleAction } from 'models/interfaces/automation';

interface Props {
  action: RuleAction;
  draftRule: AutomationRule;
  setDraftRule: (rule: AutomationRule) => void;
}

const Action: FC<Props> = ({ action, draftRule, setDraftRule }) => {
  const { selectedType, selectedValue } = useMemo(() => {
    const editAction = draftRule.actions.find((act) => act.id === action.id);
    return {
      selectedType: editAction ? editAction.type : action.type,
      selectedValue: editAction ? editAction.value : undefined,
    };
  }, [action, draftRule.actions]);

  const sharedProps = {
    style: { flex: 1 },
    variant: 'filled' as 'filled',
  };

  const onChangeType = (value: string) => {
    setDraftRule({
      ...draftRule,
      actions: draftRule.actions.map((act) => {
        if (act.id === action.id) {
          return {
            ...act,
            type: value,
            value: undefined, // Reset value when type changes
          };
        }
        return act;
      }),
    });
  };

  const onChangeValue = (value: any) => {
    setDraftRule({
      ...draftRule,
      actions: draftRule.actions.map((act) => {
        if (act.id === action.id) {
          return {
            ...act,
            value,
          };
        }
        return act;
      }),
    });
  };

  return (
    <>
      <Select
        {...sharedProps}
        placeholder="Select action type"
        value={selectedType}
        options={actionTypes.map((type) => ({
          value: type,
          label: type,
        }))}
        onChange={onChangeType}
      />
      <Select
        {...sharedProps}
        placeholder="Select action value"
        value={selectedValue}
        options={
          actionValues[selectedType as keyof typeof actionValues]?.map(
            (value) => ({
              value,
              label: value,
            }),
          ) ?? []
        }
        onChange={onChangeValue}
      />
    </>
  );
};

export default Action;
