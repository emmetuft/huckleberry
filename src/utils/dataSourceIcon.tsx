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
  const normalized = (type ?? '').toLowerCase();

  if (normalized.includes('csv')) return FileCsvIcon;
  if (normalized.includes('xls') || normalized.includes('excel'))
    return FileXlsIcon;
  if (normalized.includes('pdf')) return FilePdfIcon;
  if (normalized.includes('doc') || normalized.includes('word'))
    return FileDocIcon;
  if (normalized.includes('ppt') || normalized.includes('powerpoint'))
    return FilePptIcon;
  if (normalized.includes('json') || normalized.includes('code'))
    return FileCodeIcon;
  if (normalized.includes('html') || normalized.includes('htm'))
    return FileHtmlIcon;
  if (normalized.includes('text') || normalized.includes('txt'))
    return FileTextIcon;
  if (
    normalized.includes('image') ||
    normalized.includes('jpg') ||
    normalized.includes('jpeg') ||
    normalized.includes('png')
  )
    return FileImageIcon;
  if (
    normalized.includes('audio') ||
    normalized.includes('mp3') ||
    normalized.includes('wav')
  )
    return FileAudioIcon;
  if (
    normalized.includes('video') ||
    normalized.includes('mp4') ||
    normalized.includes('mov')
  )
    return FileVideoIcon;
  if (
    normalized.includes('zip') ||
    normalized.includes('archive') ||
    normalized.includes('tar') ||
    normalized.includes('gz')
  )
    return FileZipIcon;
  if (normalized.includes('dataflow')) return ArrowsSplitIcon;

  return DatabaseIcon;
}
