import { render } from 'react-dom';
import App from './App';
import { initContract } from './helpers/utils';

window.nearInitPromise = initContract()
  .then(() => {
    render(<App />, document.querySelector('#root'));
  })
  .catch(console.error);
