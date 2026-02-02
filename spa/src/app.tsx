import { useQuery, useQueryClient } from '@tanstack/react-query';

import './app.css'
import { CreateUser } from './components/create-user/create-user';
import { useLocalStorage } from './hooks/useLocalStorage';
import { UserScore } from './components/user-score/user-score';
import { userQuery } from './data/user';
import { BtcPrice } from './components/btc-price';
import { GuessForm } from './components/guess-form';
import { useMemo } from 'preact/hooks';

export function App() {

  const [username, setUsername] = useLocalStorage('username', '');

  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ['user', username], [username]);

  const { isLoading, error, data: user } = useQuery({
    queryKey,
    queryFn: async () => userQuery(username),
  });

  const noGuessMade = user && !user.currentGuess;

  return (
    <>
      <h1>BTC Guess</h1>

      {user ? <UserScore score={user.score} /> : null}

      {error ? <div class="error">An error occurred: {error.message}</div> : null}
      {isLoading ? <div>Loading...</div> : null}

      <div class="card">
        {username ?
          <>
            <span>Welcome back, {username}!</span>
            {noGuessMade ?
              <>
                <BtcPrice />
                <GuessForm user={user} onGuessMade={() => {
                  queryClient.invalidateQueries({ queryKey });
                }} />
              </> :
              <div>Your current guess is {user?.currentGuess}</div>
            }
          </>
          :
          <CreateUser onUserCreated={(newUsername) => setUsername(newUsername)} />
        }
      </div>
    </>
  )
}
