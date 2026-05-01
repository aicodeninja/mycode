import { PIPELINE_STAGES } from '../pipelineConfig';
import { STATUS } from '../hooks/usePipeline';
import LogFeed from './LogFeed';
import styles from './DetailPanel.module.css';

const VALUE_COLORS = {
  green: styles.valGreen,
  blue:  styles.valBlue,
  amber: styles.valAmber,
};

function ResultTable({ result }) {
  if (!result) return null;
  return (
    <div className={styles.outputBox}>
      <div className={styles.outLabel}>{result.label}</div>
      <table className={styles.table}>
        <tbody>
          {result.rows.map(row => (
            <tr key={row.key} className={styles.tableRow}>
              <td className={styles.tdKey}>{row.key}</td>
              <td className={`${styles.tdVal} ${VALUE_COLORS[row.color] || ''}`}>
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({ snippet }) {
  if (!snippet) return null;
  // Simple syntax highlight via spans
  const highlighted = snippet
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(from|import|def|return|class)\b/g, '<span class="kw">$1</span>')
    .replace(/("""[\s\S]*?""")/g, '<span class="str">$1</span>')
    .replace(/(#.*)/g, '<span class="cmt">$1</span>')
    .replace(/(@\w+)/g, '<span class="dec">$1</span>');

  return (
    <div className={styles.codeWrap}>
      <div className={styles.codeHeader}>
        <span className={styles.codeTitle}>Generated Python</span>
        <div className={styles.codeDots}>
          <span /><span /><span />
        </div>
      </div>
      <pre
        className={styles.code}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>⏳</div>
      <p className={styles.emptyTitle}>Waiting to run</p>
      <p className={styles.emptyText}>Press Execute to start the pipeline. Output will appear here once this stage completes.</p>
    </div>
  );
}

function RunningState({ stageName }) {
  return (
    <div className={styles.running}>
      <div className={styles.runningSpinner} />
      <p className={styles.runningText}>{stageName} is running…</p>
    </div>
  );
}

export default function DetailPanel({ selectedIdx, stageStatuses, stageResults, stageLogs }) {
  const stage  = PIPELINE_STAGES[selectedIdx];
  const status = stageStatuses[selectedIdx];
  const result = stageResults[selectedIdx];
  const logs   = stageLogs[selectedIdx];

  return (
    <section className={styles.panel} aria-label={`${stage.name} details`}>
      {/* Stage header */}
      <div className={styles.stageHeader}>
        <div className={styles.stageIconWrap} style={{ background: stage.iconBg }}>
          <span className={styles.stageIconEmoji}>{stage.icon}</span>
        </div>
        <div>
          <h2 className={styles.stageName}>{stage.name}</h2>
          <p className={styles.stageDesc}>{stage.fullDesc}</p>
        </div>
      </div>

      {/* Body */}
      {status === STATUS.IDLE && <EmptyState />}
      {status === STATUS.RUNNING && <RunningState stageName={stage.name} />}
      {status === STATUS.DONE && (
        <div className={styles.doneContent}>
          <ResultTable result={result} />
          {result?.codeSnippet && <CodeBlock snippet={result.codeSnippet} />}
        </div>
      )}

      {/* Log feed — always visible once running starts */}
      {(status === STATUS.RUNNING || status === STATUS.DONE) && logs.length > 0 && (
        <LogFeed logs={logs} stageName={stage.name} />
      )}
    </section>
  );
}
