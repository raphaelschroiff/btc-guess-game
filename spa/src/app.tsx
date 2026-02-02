import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'preact/hooks';

import './app.css'
import { CreateUser } from './components/create-user/create-user';
import { useLocalStorage } from './hooks/useLocalStorage';
import { UserScore } from './components/user-score/user-score';
import { userQuery } from './data/user';
import { GuessForm } from './components/guess-form';
import { CurrentGuess } from './components/current-guess/current-guess';

export function App() {

  const [username, setUsername] = useLocalStorage('username', '');

  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ['user', username], [username]);

  const { isLoading, error, data: user } = useQuery({
    queryKey,
    queryFn: async () => userQuery(username),
  });

  const hasMadeGuess = user && !!user.currentGuess;

  return (
    <>
      <h1>BTC Guess</h1>


      {error ? <div class="error">An error occurred: {error.message}</div> : null}

      <div class="card">
        {username ?
          <>
            <span>Welcome back, {username}!</span>

            {error ? <div class="error">An error occurred: {error.message}</div> : null}
            {isLoading ? <div>Loading...</div> : null}

            {user ?
              <>
                <UserScore score={user.score} />
                {hasMadeGuess ?
                  <CurrentGuess user={user} /> :
                  <>
                    <GuessForm user={user} onGuessMade={() => {
                      queryClient.invalidateQueries({ queryKey });
                    }} />
                  </>
                }
              </>
              : null}
          </>
          :
          <CreateUser onUserCreated={(newUsername) => setUsername(newUsername)} />
        }
      </div>
    </>
  )
}
