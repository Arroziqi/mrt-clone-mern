import express from 'express';
import { makeInvoker } from 'awilix-express';
import { AwilixContainer } from 'awilix';
import SchedulesController from './schedules.controller';

const router = express.Router();

export default (container: AwilixContainer) => {
  const api = makeInvoker<SchedulesController>(() => container.resolve('schedulesController'));
  
  router.get('/:stationId', api('getStationSchedule'));
  
  return router;
};
