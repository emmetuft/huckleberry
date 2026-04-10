import {
  ArrowsSplitIcon,
  DatabaseIcon,
  FileAudioIcon,
  FileCloudIcon,
  FileCodeIcon,
  FileCsvIcon,
  FileDocIcon,
  FileHtmlIcon,
  FileImageIcon,
  FilePdfIcon,
  FilePptIcon,
  FileTextIcon,
  FileVideoIcon,
  FileXlsIcon,
  FileZipIcon,
  Icon,
} from '@phosphor-icons/react';

export function getDataSourceIcon(type: string | undefined): Icon {
  const fileTypeMap: [string[], Icon][] = [
    [['csv'], FileCsvIcon],
    [['xls', 'excel'], FileXlsIcon],
    [['pdf'], FilePdfIcon],
    [['doc', 'word'], FileDocIcon],
    [['ppt', 'powerpoint'], FilePptIcon],
    [['json', 'code'], FileCodeIcon],
    [['html', 'htm'], FileHtmlIcon],
    [['text', 'txt'], FileTextIcon],
    [['image', 'jpg', 'jpeg', 'png'], FileImageIcon],
    [['audio', 'mp3', 'wav'], FileAudioIcon],
    [['video', 'mp4', 'mov'], FileVideoIcon],
    [['zip', 'archive', 'tar', 'gz'], FileZipIcon],
    [['cloud', 'snowflake'], FileCloudIcon],
    [['dataflow'], ArrowsSplitIcon],
  ];

  const normalized = (type ?? '').toLowerCase();
  const match = fileTypeMap.find(([keywords]) =>
    keywords.some((k) => normalized.includes(k)),
  );

  return match?.[1] ?? DatabaseIcon;
}
