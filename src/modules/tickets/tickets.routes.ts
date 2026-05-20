import express from 'express';
import { makeInvoker } from 'awilix-express';
import { AwilixContainer } from 'awilix';
import requireAuth from '../../middlewares/requireAuth';
import TicketsController from './tickets.controller';

const router = express.Router();

export default (container: AwilixContainer) => {
  const api = makeInvoker<TicketsController>(() => container.resolve('ticketsController'));
  
  router.use(requireAuth);
  
  router.post('/checkout', api('checkout'));
  router.post('/pay', api('pay'));
  
  return router;
};
