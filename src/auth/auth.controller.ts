import {
  Controller,
  Get,
  Query,
  Res,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import type { RequestWithSession } from '../common/session.types';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('login')
  async login(
    @Req() req: RequestWithSession,
    @Res() res: Response,
  ): Promise<void> {
    const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
    const host = req.get('x-forwarded-host') || req.get('host');
    const redirectUri = `${proto}://${host}/auth/callback`;

    const { authUrl, codeVerifier } =
      await this.authService.generateAuthUrl(redirectUri);

    req.session.codeVerifier = codeVerifier;

    res.redirect(authUrl);
  }

  @Get('callback')
  async callback(
    @Query('code') code?: string,
    @Req() req?: RequestWithSession,
    @Res() res?: Response,
  ): Promise<void> {
    if (!code) {
      throw new HttpException('Missing code', HttpStatus.BAD_REQUEST);
    }

    if (!req || !res) {
      throw new HttpException(
        'Invalid request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!req.session.codeVerifier) {
      throw new HttpException('Missing code verifier', HttpStatus.BAD_REQUEST);
    }

    const currentProto = req.get('x-forwarded-proto') || req.protocol || 'http';
    const currentHost = req.get('x-forwarded-host') || req.get('host');
    const currentUrl = new URL(
      `${currentProto}://${currentHost}${req.originalUrl}`,
    );
    const result = await this.authService.handleCallback(
      currentUrl,
      req.session.codeVerifier,
    );

    // Note: Storing tokens in session for demo purposes.
    // Production apps should use secure token storage (e.g., encrypted cookies, secure backend storage).
    req.session.user = {
      accessToken: result.accessToken,
      idToken: result.idToken,
      claims: (result.claims || {}) as Record<string, unknown>,
    };

    delete req.session.codeVerifier;

    res.redirect('/notes');
  }

  @Get('logout')
  logout(@Req() req: RequestWithSession, @Res() res: Response): void {
    req.session.destroy((err) => {
      if (err) {
        this.logger.error('Error destroying session:', err);
      }
      res.redirect('/');
    });
  }
}
