import { createContainer, asClass, asValue } from 'awilix';

// We will register services, controllers, and repositories here.
import StationModel from '../models/Station';
import ScheduleModel from '../models/Schedule';
import StationsService from '../modules/stations/stations.service';
import StationsController from '../modules/stations/stations.controller';
import SchedulesService from '../modules/schedules/schedules.service';
import SchedulesController from '../modules/schedules/schedules.controller';
import TicketModel from '../models/Ticket';
import TicketsService from '../modules/tickets/tickets.service';
import TicketsController from '../modules/tickets/tickets.controller';
import User from '../models/User';
import ActivityModel from '../models/Activity';
import NotificationModel from '../models/Notification';
import PaymentMethodModel from '../models/PaymentMethod';
import AuthService from '../modules/auth/auth.service';
import AuthController from '../modules/auth/auth.controller';
import UsersService from '../modules/users/users.service';
import UsersController from '../modules/users/users.controller';
import ContentService from '../modules/content/content.service';
import ContentController from '../modules/content/content.controller';

// Payment system
import VoucherModel from '../models/Voucher';
import TransactionModel from '../models/Transaction';
import VouchersService from '../modules/vouchers/vouchers.service';
import VouchersController from '../modules/vouchers/vouchers.controller';
import TransactionsService from '../modules/transactions/transactions.service';
import TransactionsController from '../modules/transactions/transactions.controller';
import PaymentsService from '../modules/payments/payments.service';
import PaymentsController from '../modules/payments/payments.controller';

const container = createContainer();

const setupContainer = () => {
  container.register({
    StationModel: asValue(StationModel),
    ScheduleModel: asValue(ScheduleModel),
    TicketModel: asValue(TicketModel),
    UserModel: asValue(User),
    ActivityModel: asValue(ActivityModel),
    NotificationModel: asValue(NotificationModel),
    PaymentMethodModel: asValue(PaymentMethodModel),
    VoucherModel: asValue(VoucherModel),
    TransactionModel: asValue(TransactionModel),
    stationsService: asClass(StationsService).scoped(),
    stationsController: asClass(StationsController).scoped(),
    schedulesService: asClass(SchedulesService).scoped(),
    schedulesController: asClass(SchedulesController).scoped(),
    ticketsService: asClass(TicketsService).scoped(),
    ticketsController: asClass(TicketsController).scoped(),
    authService: asClass(AuthService).scoped(),
    authController: asClass(AuthController).scoped(),
    usersService: asClass(UsersService).scoped(),
    usersController: asClass(UsersController).scoped(),
    contentService: asClass(ContentService).scoped(),
    contentController: asClass(ContentController).scoped(),
    // Payment system
    vouchersService: asClass(VouchersService).scoped(),
    vouchersController: asClass(VouchersController).scoped(),
    transactionsService: asClass(TransactionsService).scoped(),
    transactionsController: asClass(TransactionsController).scoped(),
    paymentsService: asClass(PaymentsService).scoped(),
    paymentsController: asClass(PaymentsController).scoped(),
  });
};

export { container, setupContainer };
