import express from 'express';
import { makeInvoker } from 'awilix-express';
import { AwilixContainer } from 'awilix';
import SchedulesController from './schedules.controller';
import validateRequest from '../../middlewares/validateRequest';
import { getStationScheduleSchema } from '../../middlewares/schemas';

const router = express.Router();

export default (container: AwilixContainer) => {
  const api = makeInvoker<SchedulesController>(() => container.resolve('schedulesController'));

  /**
   * @openapi
   * /schedules/{stationId}:
   *   get:
   *     tags:
   *       - Schedules
   *     summary: Get departure schedule for a station
   *     description: >
   *       Returns the full departure schedule for a given station, including
   *       northbound and southbound directions with dynamically computed
   *       next departure time based on current server time (Asia/Jakarta).
   *       Terminus stations only return one direction.
   *     parameters:
   *       - in: path
   *         name: stationId
   *         required: true
   *         schema:
   *           type: string
   *         description: Station ID (e.g. STN-AS, STN-LB)
   *         example: STN-AS
   *       - in: query
   *         name: dayType
   *         required: false
   *         schema:
   *           type: string
   *           enum: [weekday, weekend]
   *         description: >
   *           Day type for the schedule. If omitted, automatically determined
   *           from the current server day.
   *       - in: query
   *         name: upcomingOnly
   *         required: false
   *         schema:
   *           type: string
   *           enum: ['true', 'false']
   *           default: 'true'
   *         description: >
   *           If true (default), returns only the next 6 upcoming departures.
   *           If false, returns all remaining departures for the day.
   *     responses:
   *       200:
   *         description: Schedule retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Schedule retrieved successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     station:
   *                       type: object
   *                       properties:
   *                         stationId:
   *                           type: string
   *                           example: STN-AS
   *                         name:
   *                           type: string
   *                           example: ASEAN
   *                     dayType:
   *                       type: string
   *                       enum: [weekday, weekend]
   *                     serverTime:
   *                       type: string
   *                       example: "20:35"
   *                     northbound:
   *                       type: object
   *                       properties:
   *                         direction:
   *                           type: string
   *                           example: To Harmoni
   *                         nextDeparture:
   *                           type: string
   *                           example: "20:35"
   *                         upcoming:
   *                           type: array
   *                           items:
   *                             type: string
   *                           example: ["20:45", "20:55", "21:05", "21:15", "21:25", "21:35"]
   *                     southbound:
   *                       type: object
   *                       properties:
   *                         direction:
   *                           type: string
   *                           example: To Lebak Bulus Grab
   *                         nextDeparture:
   *                           type: string
   *                           example: "20:38"
   *                         upcoming:
   *                           type: array
   *                           items:
   *                             type: string
   *                           example: ["20:48", "20:58", "21:08", "21:18", "21:28", "21:38"]
   *       400:
   *         description: Validation failed
   *       404:
   *         description: Station not found
   */
  router.get('/:stationId', validateRequest(getStationScheduleSchema), api('getStationSchedule'));

  return router;
};
