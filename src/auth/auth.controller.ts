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
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import type { RequestWithSession } from '../common/session.types';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('login')
  async login(
    @Req() req: RequestWithSession,
    @Res() res: Response,
  ): Promise<void> {
    const redirectUri =
      this.configService.get<string>('REDIRECT_URI') ??
      `${req.protocol}://${req.get('host')}/auth/callback`;
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

    const redirectUri =
      this.configService.get<string>('REDIRECT_URI') ??
      `${req.protocol}://${req.get('host')}/auth/callback`;
    const queryString = req.url.split('?')[1] || '';
    const currentUrl = new URL(
      `${redirectUri}${queryString ? '?' + queryString : ''}`,
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
