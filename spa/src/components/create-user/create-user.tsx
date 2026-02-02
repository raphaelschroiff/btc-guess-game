import { useMutation } from "@tanstack/react-query";
import { useState } from "preact/hooks";
import { baseUrl } from "../../constants";
import styles from './create-user.module.css';

export function CreateUser({ onUserCreated }: { onUserCreated?: (username: string) => void }) {
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending }  = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch(`${baseUrl}user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName: username.toLowerCase() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
    },
    onSuccess: (_, username) => {
      if (onUserCreated) {
        onUserCreated(username);
      }
    },
    onError: (error) => {
      console.error("Error creating user:", error);
      setError(error.message);
    }
  });

  const disabled = isPending || !newUsername.trim();

  return <div>
    <h2>Please set your username.</h2>
      <span class={styles.inputField}>
        <input type="text" value={newUsername} disabled={isPending} onChange={(e) => setNewUsername((e.target as HTMLInputElement).value)} placeholder="Enter your username" />
        {error && <div class={styles.errorMessage}>{error}</div>}
      </span>
      <button onClick={() => mutate(newUsername)} disabled={disabled}>
        Set Username
      </button>
  </div>;
}
