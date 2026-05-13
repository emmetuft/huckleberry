import { Tooltip, TooltipProps } from 'antd';
import { useIsMobile } from 'hooks/useIsMobile';

export default function AppTooltip(props: TooltipProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return props.children;
  }

  return <Tooltip {...props} />;
}
