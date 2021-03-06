import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as Joi from 'joi';
import { OrderStatus, TicketStatus } from 'src/common/consts/enum';
import { Order } from 'src/database/entities/order.entity';
import { Ticket } from 'src/database/entities/ticket.entity';
import { User } from 'src/database/entities/user.entity';
import { ADMIN_CHANNELID, ORDER_CHANNELID } from './config/slack.const';
import { SlackService } from './slack.service';

describe('SlackService', () => {
  let service: SlackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          // envFilePath: process.env.NODE_ENV === 'test' ? '.env.local' : '.env',
          validationSchema: Joi.object({
            NODE_ENV: Joi.string()
              .valid('dev', 'prod', 'test', 'provision')
              .default('dev'),
            PORT: Joi.number().default(8080),
            ACCESS_SECRET: Joi.string(),
            REGISTER_SECRET: Joi.string(),
            SWAGGER_USER: Joi.string(),
            SWAGGER_PASSWORD: Joi.string(),
            REDIS_HOST: Joi.string(),
            REDIS_PORT: Joi.number(),
            POSTGRES_HOST: Joi.string().default('localhost'),
            POSTGRES_PORT: Joi.number().default(5432),
            POSTGRES_USER: Joi.string().default('gosrock'),
            POSTGRES_PASSWORD: Joi.string().default('gosrock22th'),
            POSTGRES_DB: Joi.string().default('ticket'),
            SLACK_ORDER_CHANNELID: Joi.string(),
            SLACK_ADMIN_CHANNELID: Joi.string()
          })
        }),
        HttpModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            baseURL: 'https://slack.com/api',
            headers: {
              Authorization: 'Bearer ' + configService.get('SLACK_BOT_TOKEN')
            }
          }),
          inject: [ConfigService]
        })
      ],
      providers: [
        SlackService,
        {
          provide: ADMIN_CHANNELID,
          useValue: 'C03MKF0DRRV'
        },
        {
          provide: ORDER_CHANNELID,
          useValue: 'C03MKF2JJ4X'
        }
      ]
    }).compile();

    service = module.get<SlackService>(SlackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('????????? ????????? ?????? ?????? ?????? ???????????? ???????????????.', async () => {
    const order = new Order();
    const user = new User();
    user.id = 1;
    user.name = '?????????';
    user.phoneNumber = '?????????';
    order.id = 10001;
    order.user = user;
    order.ticketCount = 3;
    order.price = 5000;

    const value = await service.newOrderAlarm(order);
    console.log(value);
    expect(value).toBeDefined();
  });

  it('???????????? ????????? ????????? ???????????? ?????? ?????? ???????????? ???????????????.', async () => {
    const order = new Order();
    const adminUser = new User();
    adminUser.id = 1;
    adminUser.name = '?????????';
    adminUser.phoneNumber = '?????????';
    order.id = 10001;
    order.admin = adminUser;
    order.ticketCount = 3;
    order.price = 5000;
    order.status = OrderStatus.DONE;

    const value = await service.orderStateChangedByAdminEvent(order);
    console.log(value);
    expect(value).toBeDefined();
  });

  it('???????????? ????????? ????????? ???????????? ????????? ???????????????.', async () => {
    const ticket = new Ticket();
    const adminUser = new User();
    const orderUser = new User();
    adminUser.id = 1;
    adminUser.name = '?????????';
    adminUser.phoneNumber = '?????????';
    orderUser.id = 1;
    orderUser.name = '??????';
    orderUser.phoneNumber = '?????????';
    ticket.id = 10001;
    ticket.admin = adminUser;
    ticket.user = orderUser;
    ticket.status = TicketStatus.WAIT;

    const value = await service.ticketStateChangedByAdminEvent(ticket);
    console.log(value);
    expect(value).toBeDefined();
  });

  it('?????? ?????? ?????? ???????????? ???????????????.', async () => {
    const ticket = new Ticket();
    const adminUser = new User();
    const orderUser = new User();
    adminUser.id = 1;
    adminUser.name = '?????????';
    adminUser.phoneNumber = '?????????';
    orderUser.id = 1;
    orderUser.name = '??????';
    orderUser.phoneNumber = '?????????';
    ticket.id = 10001;
    ticket.admin = adminUser;
    ticket.user = orderUser;
    ticket.status = TicketStatus.DONE;

    const value = await service.ticketEnterEvent(ticket);
    console.log(value);
    expect(value).toBeDefined();
  });
});
