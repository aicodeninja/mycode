import { useState, useRef, useCallback, useEffect } from 'react';
import { PIPELINE_STAGES } from '../pipelineConfig';

// Stage status constants
export const STATUS = {
  IDLE:    'idle',
  RUNNING: 'running',
  DONE:    'done',
};

// Pipeline execution hook — encapsulates all timer/state logic
export function usePipeline() {
  const [stageStatuses, setStageStatuses] = useState(
    PIPELINE_STAGES.map(() => STATUS.IDLE)
  );
  const [stageResults, setStageResults] = useState(
    PIPELINE_STAGES.map(() => null)
  );
  const [stageLogs, setStageLogs] = useState(
    PIPELINE_STAGES.map(() => [])
  );
  const [completedCount, setCompletedCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [speed, setSpeed] = useState(1);

  const timerRef     = useRef(null);
  const startTimeRef = useRef(null);
  const runningRef   = useRef(false);

  // Tick the elapsed timer
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  const setStageStatus = useCallback((idx, status) => {
    setStageStatuses(prev => {
      const next = [...prev];
      next[idx] = status;
      return next;
    });
  }, []);

  const appendLog = useCallback((stageIdx, log) => {
    setStageLogs(prev => {
      const next = [...prev];
      next[stageIdx] = [...next[stageIdx], { ...log, id: Date.now() + Math.random() }];
      return next;
    });
  }, []);

  const setResult = useCallback((stageIdx, result) => {
    setStageResults(prev => {
      const next = [...prev];
      next[stageIdx] = result;
      return next;
    });
  }, []);

  // Run a single stage sequentially, firing logs with delays
  const runStage = useCallback((stageIdx, currentSpeed) => {
    return new Promise(resolve => {
      const stage = PIPELINE_STAGES[stageIdx];
      const baseDelay = stage.durationMs / (stage.logLines.length + 1);
      const delay = baseDelay / currentSpeed;

      setStageStatus(stageIdx, STATUS.RUNNING);

      stage.logLines.forEach((log, i) => {
        setTimeout(() => {
          appendLog(stageIdx, log);
        }, delay * (i + 1));
      });

      setTimeout(() => {
        setStageStatus(stageIdx, STATUS.DONE);
        setResult(stageIdx, stage.result);
        setCompletedCount(prev => prev + 1);
        resolve();
      }, delay * (stage.logLines.length + 1));
    });
  }, [setStageStatus, appendLog, setResult]);

  const start = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);

    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    const currentSpeed = speed;
    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      if (!runningRef.current) break;
      await runStage(i, currentSpeed);
      // Brief pause between stages
      await new Promise(r => setTimeout(r, 250 / currentSpeed));
    }

    clearInterval(timerRef.current);
    runningRef.current = false;
    setIsRunning(false);
    setIsDone(true);
  }, [speed, runStage]);

  const reset = useCallback(() => {
    runningRef.current = false;
    clearInterval(timerRef.current);
    setStageStatuses(PIPELINE_STAGES.map(() => STATUS.IDLE));
    setStageResults(PIPELINE_STAGES.map(() => null));
    setStageLogs(PIPELINE_STAGES.map(() => []));
    setCompletedCount(0);
    setElapsedSeconds(0);
    setIsRunning(false);
    setIsDone(false);
  }, []);

  const formatTime = useCallback((totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  return {
    stageStatuses,
    stageResults,
    stageLogs,
    completedCount,
    totalStages: PIPELINE_STAGES.length,
    progressPct: Math.round((completedCount / PIPELINE_STAGES.length) * 100),
    elapsedTime: formatTime(elapsedSeconds),
    isRunning,
    isDone,
    speed,
    setSpeed,
    start,
    reset,
  };
}
