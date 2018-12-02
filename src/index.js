import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import UI from './js/ui';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/index.css';

ReactDOM.render(<UI/>, document.getElementById('root'));
registerServiceWorker();
