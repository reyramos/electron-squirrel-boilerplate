'use strict';
import express from 'express';
import morgan from 'morgan';


const app = express();


import {asyncHandler, errorHandler1, errorHandler2} from './components/handlers';
import manifest from '../package.json';

import * as homeCtrl from './controllers/home';
import * as updateCtrl from './controllers/updates';


app.use(morgan('common'));

app.get('/', asyncHandler(homeCtrl.main));
app.get('/updates/latest/:name', asyncHandler(updateCtrl.latest));


app.use(errorHandler1);
app.use(errorHandler2);

app.listen(9000, () => {
    console.log('Server listening on port %s.', 9000);
});
