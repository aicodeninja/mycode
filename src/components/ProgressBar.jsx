import styles from './ProgressBar.module.css';

export default function ProgressBar({ pct, completedCount, totalStages, elapsedTime, isRunning, isDone }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${isDone ? styles.fillDone : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={styles.meta}>
        <span className={styles.count}>{completedCount} / {totalStages} stages</span>
        <span className={styles.pct}>{pct}%</span>
        <span className={styles.time}>
          {isRunning || isDone ? elapsedTime : '—'}
        </span>
      </div>
    </div>
  );
}
