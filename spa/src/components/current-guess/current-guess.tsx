import { useEffect, useState } from "preact/hooks";
import { User } from "../../data/user";
import { useMutation } from "@tanstack/react-query";
import { resolveGuessMutation } from "../../data/guess";

export function CurrentGuess({ user }: { user: User }) {

  const [secondsToResolve, setSecondsToResolve] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !user.guessMadeAt) {
      setSecondsToResolve(null);
      return;
    }
    const updateSeconds = () => {
      const seconds = Math.max(0, 60 - Math.floor((Date.now() - user.guessMadeAt!.getTime()) / 1000));
      setSecondsToResolve(seconds);
    };
    updateSeconds();
    const interval = setInterval(updateSeconds, 1000);
    return () => clearInterval(interval);
  }, [user, user?.guessMadeAt]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => resolveGuessMutation(user.userName),
    onSuccess: (data) => {
      alert(`Your guess was ${data.guessCorrect ? 'correct' : 'incorrect'}! New score: ${data.newScore}`);
    },
    onError: (error) => {
      alert(`Failed to resolve guess: ${error.message}`);
    }
  });
  return (
    <>
      <div>Your current guess is {user.currentGuess}</div>
      <div>Guess can be resolved in {secondsToResolve !== null ? `${secondsToResolve} seconds` : 'N/A'}</div>
      <button onClick={() => mutate()} disabled={isPending || (secondsToResolve !== null && secondsToResolve > 0)}>
        Resolve Guess
      </button>
    </>
  );
}
