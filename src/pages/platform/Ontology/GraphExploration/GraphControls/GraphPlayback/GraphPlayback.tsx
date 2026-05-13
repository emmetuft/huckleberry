import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Slider } from 'antd';
import {
  PauseIcon,
  PlayIcon,
  ArrowCounterClockwiseIcon,
} from '@phosphor-icons/react';
import styles from './GraphPlayback.module.css';
import { PEOPLE_SKILLS_GRAPH } from 'constants/graph';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';

interface GraphPlaybackProps {
  isOpen: boolean;
  onPlaybackChange: (visibleNodeIds: Set<string> | null) => void;
}

// 1 real second = 60 fake seconds
const PLAYBACK_SPEED = 60;
const TICK_MS = 50;

export const GraphPlayback: React.FC<GraphPlaybackProps> = ({
  isOpen,
  onPlaybackChange,
}) => {
  const nodes = PEOPLE_SKILLS_GRAPH.nodes;

  const sortedNodes = useMemo(
    () =>
      nodes
        .filter((n) => n.createdAt)
        .sort(
          (a, b) =>
            new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime(),
        ),
    [nodes],
  );

  const minTime = useMemo(
    () =>
      sortedNodes.length ? new Date(sortedNodes[0].createdAt!).getTime() : 0,
    [sortedNodes],
  );
  const maxTime = useMemo(
    () =>
      sortedNodes.length
        ? new Date(sortedNodes[sortedNodes.length - 1].createdAt!).getTime()
        : 0,
    [sortedNodes],
  );

  const [currentTime, setCurrentTime] = useState(minTime);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastTickRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const prevVisibleCountRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    const visibleNodes = sortedNodes.filter(
      (n) => new Date(n.createdAt!).getTime() <= currentTime,
    );
    prevVisibleCountRef.current = visibleNodes.length;
    onPlaybackChange(new Set(visibleNodes.map((n) => n.id)));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const visibleNodes = sortedNodes.filter(
      (n) => new Date(n.createdAt!).getTime() <= currentTime,
    );
    if (visibleNodes.length !== prevVisibleCountRef.current) {
      prevVisibleCountRef.current = visibleNodes.length;
      onPlaybackChange(new Set(visibleNodes.map((n) => n.id)));
    }
  }, [currentTime, sortedNodes, onPlaybackChange]);

  useEffect(() => {
    if (isPlaying) {
      lastTickRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastTickRef.current;
        lastTickRef.current = now;
        setCurrentTime((prev) => {
          const next = prev + elapsed * PLAYBACK_SPEED;
          if (next >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return next;
        });
      }, TICK_MS);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, maxTime]);

  const sliderValue =
    maxTime > minTime
      ? ((currentTime - minTime) / (maxTime - minTime)) * 100
      : 0;

  const handleSliderChange = (value: number) => {
    setCurrentTime(minTime + (value / 100) * (maxTime - minTime));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(minTime);
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  if (!sortedNodes.length) return null;

  return (
    <div className={styles.graphPlayback}>
      <div>
        <IconBtn icon={<ArrowCounterClockwiseIcon />} onClick={handleReset} />
        <IconBtn
          icon={
            isPlaying ? <PauseIcon weight="fill" /> : <PlayIcon weight="fill" />
          }
          onClick={() => setIsPlaying((p) => !p)}
        />
      </div>
      <div className={styles.sliderWrapper}>
        <span className={styles.timestamp}>{formatTime(currentTime)}</span>
        <Slider
          className={styles.slider}
          value={sliderValue}
          onChange={handleSliderChange}
          tooltip={{ formatter: () => formatTime(currentTime) }}
        />
        <span className={styles.timestamp}>{formatTime(maxTime)}</span>
      </div>
    </div>
  );
};
