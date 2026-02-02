import { useMutation } from "@tanstack/react-query";
import { makeGuessMutation, User } from "../data/user";
import { BtcPrice } from "./btc-price";

export function GuessForm({ user, onGuessMade }: { user: User, onGuessMade: () => void }) {

  const makeGuess = useMutation({
    mutationFn: (guess: "UP" | "DOWN") => makeGuessMutation(user.userName, guess),
    onSuccess: (data) => {
      console.log("Guess made successfully", data);
      // Optionally handle success, e.g., refetch user data
      if (typeof onGuessMade === "function") {
        onGuessMade();
      }
    },
  });

  return (
    <>
      <BtcPrice />
      <p>Make your guess - will the price go up or down?</p>

      <button onClick={() => makeGuess.mutate("UP")}>⬆️ Up!</button>
      <button onClick={() => makeGuess.mutate("DOWN")}>⬇️ Down!</button>
    </>
  );
}
