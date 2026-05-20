import express from 'express';
import { makeInvoker } from 'awilix-express';
import { AwilixContainer } from 'awilix';
import StationsController from './stations.controller';

const router = express.Router();

// Using awilix-express makeInvoker to resolve the controller and bind methods
export default (container: AwilixContainer) => {
  const api = makeInvoker<StationsController>(() => container.resolve('stationsController'));
  
  router.get('/', api('getAllStations'));
  
  return router;
};
