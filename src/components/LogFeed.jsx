import { useEffect, useRef } from 'react';
import styles from './LogFeed.module.css';

const TYPE_STYLE = {
  info: styles.logInfo,
  ok:   styles.logOk,
  warn: styles.logWarn,
  err:  styles.logErr,
};

const TYPE_ICON = {
  info: '›',
  ok:   '✓',
  warn: '⚠',
  err:  '✕',
};

function getTimestamp() {
  const now = new Date();
  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map(n => String(n).padStart(2, '0'))
    .join(':');
}

export default function LogFeed({ logs, stageName }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>Agent log</span>
        <span className={styles.count}>{logs.length} events</span>
      </div>
      <div className={styles.feed}>
        {logs.map((log, i) => (
          <div key={log.id || i} className={`${styles.line} ${TYPE_STYLE[log.type] || ''}`}>
            <span className={styles.icon}>{TYPE_ICON[log.type] || '›'}</span>
            <span className={styles.text}>{log.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
