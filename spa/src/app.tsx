import './app.css'
import { CreateUser } from './components/create-user/create-user';
import { useLocalStorage } from './hooks/useLocalStorage';

export function App() {

  const [username, setUsername] = useLocalStorage('username', '');

  return (
    <>
      <h1>BTC Guess</h1>
      <div class="card">
        {username ?
          <span>Welcome back, {username}!</span> :
          <CreateUser onUserCreated={(newUsername) => setUsername(newUsername)} />
        }
      </div>
    </>
  )


}
