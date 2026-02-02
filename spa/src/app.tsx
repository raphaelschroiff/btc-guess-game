import { useQuery } from '@tanstack/react-query';

import './app.css'
import { CreateUser } from './components/create-user/create-user';
import { useLocalStorage } from './hooks/useLocalStorage';
import { UserScore } from './components/user-score/user-score';
import { userQuery } from './data/user';

export function App() {

  const [username, setUsername] = useLocalStorage('username', '');

  const {isLoading, error, data: user} = useQuery({
    queryKey: ['user', username],
    queryFn: async () => userQuery(username),
  });

  return (
    <>
      <h1>BTC Guess</h1>

      { user ? <UserScore score={user.score} /> : null }

      { error ? <div class="error">An error occurred: {error.message}</div> : null }
      { isLoading ? <div>Loading...</div> : null }

      <div class="card">
        {username ?
          <span>Welcome back, {username}!</span> :
          <CreateUser onUserCreated={(newUsername) => setUsername(newUsername)} />
        }
      </div>
    </>
  )
}
