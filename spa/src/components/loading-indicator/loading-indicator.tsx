import styles from './loading-indicator.module.css';
export function LoadingIndicator({ isLoading }: { isLoading: boolean }) {
  return (
    <>
      {isLoading && <div class={styles.loadingIndicator}>₿</div>}
    </>
  );
}
