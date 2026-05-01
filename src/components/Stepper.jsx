import { PIPELINE_STAGES } from '../pipelineConfig';
import { STATUS } from '../hooks/usePipeline';
import styles from './Stepper.module.css';

function StepDot({ status, number }) {
  return (
    <div className={`${styles.dot} ${styles[`dot_${status}`]}`}>
      {status === STATUS.DONE ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : status === STATUS.RUNNING ? (
        <span className={styles.dotSpinner} />
      ) : (
        <span className={styles.dotNum}>{number}</span>
      )}
    </div>
  );
}

export default function Stepper({ stageStatuses, selectedIdx, onSelect }) {
  return (
    <nav className={styles.stepper} aria-label="Pipeline stages">
      {PIPELINE_STAGES.map((stage, i) => {
        const status  = stageStatuses[i];
        const isLast  = i === PIPELINE_STAGES.length - 1;
        const isSel   = i === selectedIdx;

        return (
          <div key={stage.id} className={styles.stepWrap}>
            <button
              className={`${styles.step} ${isSel ? styles.stepSel : ''} ${status === STATUS.DONE ? styles.stepDone : ''}`}
              onClick={() => onSelect(i)}
              aria-current={isSel ? 'step' : undefined}
            >
              <div className={styles.leftCol}>
                <StepDot status={status} number={i + 1} />
                {!isLast && (
                  <div className={`${styles.vline} ${status === STATUS.DONE ? styles.vlineDone : ''}`} />
                )}
              </div>
              <div className={styles.content}>
                <span className={styles.stepNum}>0{i + 1} —</span>
                <span className={styles.stepName}>{stage.name}</span>
                <span className={styles.stepDesc}>{stage.shortDesc}</span>
                <span className={`${styles.badge} ${styles[`badge_${status}`]}`}>
                  {status === STATUS.IDLE    && 'Waiting'}
                  {status === STATUS.RUNNING && '● Running'}
                  {status === STATUS.DONE    && '✓ Complete'}
                </span>
              </div>
            </button>
          </div>
        );
      })}
    </nav>
  );
}
