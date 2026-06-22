import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Select } from 'antd';
import { CaretDownIcon } from '@phosphor-icons/react';
import { selectAIModels } from 'reducers/agents/slice';
import { isEmpty } from 'utils/misc';

interface ModelSelectProps {
  selectedModelId: string;
  setSelectedModelId: (modelId: string) => void;
}

export const ModelSelect: FC<ModelSelectProps> = ({
  selectedModelId,
  setSelectedModelId,
}) => {
  const models = useSelector(selectAIModels);

  useEffect(() => {
    if (models.length > 0 && isEmpty(selectedModelId)) {
      setSelectedModelId(models[0].id);
    }
  }, [models]);

  return (
    <Select
      popupMatchSelectWidth={false}
      variant="borderless"
      value={selectedModelId}
      onChange={(value) => setSelectedModelId(value)}
      options={models.map((model) => ({
        label: model.name,
        value: model.id,
      }))}
      suffixIcon={<CaretDownIcon color="#000" />}
      styles={{ content: { fontSize: 'var(--font-xs)' } }}
    />
  );
};
