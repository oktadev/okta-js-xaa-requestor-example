import { Controller, Get, Render, Req } from '@nestjs/common';
import type { RequestWithSession } from './common/session.types';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  getHome(@Req() req: RequestWithSession) {
    return { user: req.session.user };
  }
}
