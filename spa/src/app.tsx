import './app.css'
import { useLocalStorage } from './hooks/useLocalStorage';
import { useState } from 'preact/hooks';

export function App() {

  const [username, setUsername] = useLocalStorage('username', '');

  const [newUsername, setNewUsername] = useState('');


  return (
    <>
      <h1>BTC Guess</h1>
      <div class="card">
        {username ?
          <span>Welcome back, {username}!</span> :
          <CreateUser />
        }
      </div>
    </>
  )

  function CreateUser() {
    return <div>
      <h2>Please set your username.</h2>
      <input type="text" value={newUsername} onInput={(e) => setNewUsername((e.target as HTMLInputElement).value)} placeholder="Enter your username" />
      <button onClick={() => setUsername(newUsername)}>
        Set Username
      </button>
    </div>;
  }
}
