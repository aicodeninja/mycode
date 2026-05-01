import { useState } from 'react';
import { usePipeline } from '../hooks/usePipeline';
import Header from './Header';
import ProgressBar from './ProgressBar';
import Stepper from './Stepper';
import DetailPanel from './DetailPanel';
import styles from './PipelineDashboard.module.css';

export default function PipelineDashboard() {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const pipeline = usePipeline();

  // Auto-select the active stage while running
  const handleStageSelect = (idx) => {
    setSelectedIdx(idx);
  };

  return (
    <div className={styles.root}>
      <Header
        isRunning={pipeline.isRunning}
        isDone={pipeline.isDone}
        speed={pipeline.speed}
        setSpeed={pipeline.setSpeed}
        stageStatuses={pipeline.stageStatuses}
        start={pipeline.start}
        reset={pipeline.reset}
      />

      <ProgressBar
        pct={pipeline.progressPct}
        completedCount={pipeline.completedCount}
        totalStages={pipeline.totalStages}
        elapsedTime={pipeline.elapsedTime}
        isRunning={pipeline.isRunning}
        isDone={pipeline.isDone}
      />

      <div className={styles.body}>
        {/* Left sidebar — stepper */}
        <aside className={styles.sidebar}>
          <Stepper
            stageStatuses={pipeline.stageStatuses}
            selectedIdx={selectedIdx}
            onSelect={handleStageSelect}
          />
        </aside>

        {/* Right — detail panel */}
        <main className={styles.main}>
          <DetailPanel
            selectedIdx={selectedIdx}
            stageStatuses={pipeline.stageStatuses}
            stageResults={pipeline.stageResults}
            stageLogs={pipeline.stageLogs}
          />
        </main>
      </div>
    </div>
  );
}
