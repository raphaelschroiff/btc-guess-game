import  styles from './user-score.module.css';

export function UserScore({score}: {score: number}) {

  return (
    <div class={styles.userScore}>
      Score: {score}
    </div>
  );
}
