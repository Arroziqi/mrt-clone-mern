import express from 'express';
import { makeInvoker } from 'awilix-express';
import { AwilixContainer } from 'awilix';
import ContentController from './content.controller';

const router = express.Router();

export default (container: AwilixContainer) => {
  const api = makeInvoker<ContentController>(() => container.resolve('contentController'));
  
  router.get('/banners', api('getBanners'));
  router.get('/lifestyle', api('getLifestyle'));
  
  return router;
};
