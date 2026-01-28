import { render } from 'preact'
import './index.css'
import { App } from './app.js'
import { baseUrl } from './constants';

console.log('Base URL:', baseUrl);

render(<App />, document.getElementById('app'))
