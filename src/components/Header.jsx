import { SPEED_OPTIONS } from '../pipelineConfig';
import { STATUS } from '../hooks/usePipeline';
import styles from './Header.module.css';

export default function Header({
  isRunning, isDone, speed, setSpeed, stageStatuses, start, reset
}) {
  const overallStatus = isDone
    ? STATUS.DONE
    : isRunning
    ? STATUS.RUNNING
    : STATUS.IDLE;

  const statusLabels = {
    [STATUS.IDLE]:    '● Idle',
    [STATUS.RUNNING]: '● Running',
    [STATUS.DONE]:    '✓ Complete',
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.iconWrap}>🔄</div>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Postpay → Prepay · AI Pipeline</h1>
          <p className={styles.subtitle}>SAS MIGRATION · WGS TARGET SCHEMA · 4-AGENT ORCHESTRATION</p>
        </div>
      </div>

      <div className={styles.right}>
        <span className={`${styles.statusChip} ${styles[`status_${overallStatus}`]}`}>
          {statusLabels[overallStatus]}
        </span>

        <div className={styles.speedWrap}>
          <span className={styles.speedLabel}>SPEED</span>
          <select
            className={styles.speedSelect}
            value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))}
            disabled={isRunning}
          >
            {SPEED_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <button
          className={styles.btnGhost}
          onClick={reset}
          disabled={isRunning}
        >
          ↺ Reset
        </button>

        <button
          className={`${styles.btnPrimary} ${isDone ? styles.btnDone : ''}`}
          onClick={start}
          disabled={isRunning || isDone}
        >
          {isDone ? '✓ Done' : isRunning ? '⏸ Running…' : '▶ Execute'}
        </button>
      </div>
    </header>
  );
}
