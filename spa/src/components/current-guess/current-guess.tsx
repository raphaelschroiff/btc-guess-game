import { useEffect, useState } from "preact/hooks";
import { User } from "../../data/user";
import { useMutation } from "@tanstack/react-query";
import { ResolvedGuess, resolveGuessMutation } from "../../data/guess";

export function CurrentGuess({ user, onGuessResolved }: { user: User, onGuessResolved: () => void }) {

  const [secondsToResolve, setSecondsToResolve] = useState<number | null>(null);
  const [resolvedGuess, setResolvedGuess] = useState<ResolvedGuess | null>(null);


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

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => resolveGuessMutation(user.userName),
    onSuccess: (data) => {
      setResolvedGuess(data);
      onGuessResolved();
    }
  });
  return (
    <>
      {error ? <div class="error">An error occurred: {error.message}</div> : null}
      {resolvedGuess ?
        <>
          <div>Your guess was {resolvedGuess.guessCorrect ? 'correct' : 'incorrect'}!</div>
          <div>Your guess: {resolvedGuess.guess}</div>
          <div>Price at guess: {resolvedGuess.priceAtGuess}</div>
          <div>Price after: {resolvedGuess.priceAfter}</div>
        </>
        :
        <>
          <div>Your current guess is {user.currentGuess}</div>
          <div>Guess can be resolved in {secondsToResolve !== null ? `${secondsToResolve} seconds` : 'N/A'}</div>
          <button onClick={() => mutate()} disabled={isPending || (secondsToResolve !== null && secondsToResolve > 0)}>
            Resolve Guess
          </button>
        </>
      }
    </>
  );
}
