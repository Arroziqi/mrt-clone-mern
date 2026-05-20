import express from 'express';
import { makeInvoker } from 'awilix-express';
import { AwilixContainer } from 'awilix';
import StationsController from './stations.controller';
import validateRequest from '../../middlewares/validateRequest';
import {
  getAllStationsSchema,
  searchStationsSchema,
  calculateFareSchema,
  getRouteDetailSchema
} from '../../middlewares/schemas';

const router = express.Router();

export default (container: AwilixContainer) => {
  const api = makeInvoker<StationsController>(() => container.resolve('stationsController'));

  /**
   * @openapi
   * /stations/search:
   *   get:
   *     tags:
   *       - Stations
   *     summary: Search active stations by name (paginated)
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: Search keyword
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of stations per page
   *     responses:
   *       200:
   *         description: Stations searched successfully
   */
  router.get('/search', validateRequest(searchStationsSchema), api('searchStations'));

  /**
   * @openapi
   * /stations/fare:
   *   get:
   *     tags:
   *       - Stations
   *     summary: Calculate ticket fare between stations
   *     description: Calculates fare from a station. If destination (to) is omitted, calculates fare to all other active stations.
   *     parameters:
   *       - in: query
   *         name: from
   *         required: true
   *         schema:
   *           type: string
   *         description: Departure station ID (e.g. STN-LB)
   *       - in: query
   *         name: to
   *         required: false
   *         schema:
   *           type: string
   *         description: Destination station ID (e.g. STN-HJ). If omitted, returns fares to all other stations.
   *     responses:
   *       200:
   *         description: Fare calculated successfully
   */
  router.get('/fare', validateRequest(calculateFareSchema), api('calculateFare'));

  /**
   * @openapi
   * /stations/route-detail:
   *   get:
   *     tags:
   *       - Stations
   *     summary: Get detailed route path with all intermediate stations and total price
   *     parameters:
   *       - in: query
   *         name: from
   *         required: true
   *         schema:
   *           type: string
   *         description: Departure station ID (e.g. STN-LB)
   *       - in: query
   *         name: to
   *         required: true
   *         schema:
   *           type: string
   *         description: Destination station ID (e.g. STN-HJ)
   *     responses:
   *       200:
   *         description: Route details retrieved successfully
   */
  router.get('/route-detail', validateRequest(getRouteDetailSchema), api('getRouteDetail'));

  /**
   * @openapi
   * /stations:
   *   get:
   *     tags:
   *       - Stations
   *     summary: Get all active stations (paginated)
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of stations per page
   *     responses:
   *       200:
   *         description: Stations retrieved successfully
   */
  router.get('/', validateRequest(getAllStationsSchema), api('getAllStations'));

  return router;
};
