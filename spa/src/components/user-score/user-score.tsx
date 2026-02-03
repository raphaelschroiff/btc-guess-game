import { useAnimateOnUpdate } from '../../hooks/useAnimateOnUpdate';
import styles from './user-score.module.css';

export function UserScore({ score }: { score: number }) {

  const animationStyles = useAnimateOnUpdate(score, 'wiggle', '.3s', 'ease-in-out');

  return (
    <div class={styles.userScore} style={animationStyles}>
      Your Score: {score}
    </div>
  );
}
