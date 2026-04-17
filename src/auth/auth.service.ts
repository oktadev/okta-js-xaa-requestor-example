import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as openidClient from 'openid-client';
import { loggedFetch } from '../common/http-logger';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private config!: openidClient.Configuration;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const idpUrl = this.configService.get<string>('IDP_URL');
    const clientId = this.configService.get<string>('CLIENT_ID');
    const clientSecret = this.configService.get<string>('CLIENT_SECRET');

    if (!idpUrl || !clientId) {
      throw new Error('IDP_URL and CLIENT_ID must be configured');
    }

    this.config = await openidClient.discovery(
      new URL(idpUrl),
      clientId,
      clientSecret,
      openidClient.ClientSecretPost(clientSecret ?? ''),
    );
    this.config[openidClient.customFetch] = loggedFetch;
  }

  async generateAuthUrl(redirectUri: string): Promise<{
    authUrl: string;
    codeVerifier: string;
  }> {
    const codeVerifier = openidClient.randomPKCECodeVerifier();
    const codeChallenge =
      await openidClient.calculatePKCECodeChallenge(codeVerifier);

    const authUrl = openidClient.buildAuthorizationUrl(this.config, {
      redirect_uri: redirectUri,
      scope: 'openid profile email',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return {
      authUrl: authUrl.href,
      codeVerifier,
    };
  }

  async handleCallback(currentUrl: URL, codeVerifier: string) {
    const tokens = await openidClient.authorizationCodeGrant(
      this.config,
      currentUrl,
      {
        pkceCodeVerifier: codeVerifier,
      },
    );

    const claims = tokens.claims();
    return {
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      claims,
    };
  }

  /**
   * Exchange an ID token for an access token using the ID-JAG (Identity Assertion Authorization Grant) flow
   * as described in https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-assertion-authz-grant/
   */
  async exchangeIdTokenForAccessToken(
    idToken: string,
    resourceUrl: string,
    scope: string[],
  ): Promise<string> {
    const { idpUrl, authServerUrl, clientId, clientSecret } =
      this.getRequiredConfig();

    const { resourceClientId, resourceClientSecret } =
      this.getRequiredConfig();

    // Discover the IdP configuration
    const idpConfig = await openidClient.discovery(
      new URL(idpUrl),
      clientId,
      clientSecret,
      openidClient.ClientSecretPost(clientSecret ?? ''),
    );
    idpConfig[openidClient.customFetch] = loggedFetch;

    // Step 1: Exchange ID token for ID-JAG token
    const idJagToken = await this.exchangeIdTokenForIdJag(
      idpConfig,
      idToken,
      authServerUrl,
      resourceUrl,
      scope,
    );

    // Step 2: Exchange ID-JAG token for access token using resource client credentials
    const resourceAuthConfig = await openidClient.discovery(
      new URL(authServerUrl),
      resourceClientId,
      resourceClientSecret,
      openidClient.ClientSecretPost(resourceClientSecret ?? ''),
    );
    resourceAuthConfig[openidClient.customFetch] = loggedFetch;

    return this.exchangeIdJagForAccessToken(
      resourceAuthConfig,
      idJagToken,
      scope,
    );
  }

  /**
   * Get required configuration from environment variables
   */
  private getRequiredConfig() {
    const idpUrl = this.configService.get<string>('IDP_URL');
    const authServerUrl = this.configService.get<string>('AUTH_SERVER_URL');
    const clientId = this.configService.get<string>('CLIENT_ID');
    const clientSecret = this.configService.get<string>('CLIENT_SECRET');
    const resourceClientId = this.configService.get<string>('RESOURCE_CLIENT_ID');
    const resourceClientSecret = this.configService.get<string>('RESOURCE_CLIENT_SECRET');

    if (!idpUrl || !authServerUrl || !clientId || !resourceClientId) {
      throw new Error(
        'IDP_URL, AUTH_SERVER_URL, CLIENT_ID and RESOURCE_CLIENT_ID must be configured',
      );
    }

    return { idpUrl, authServerUrl, clientId, clientSecret, resourceClientId, resourceClientSecret };
  }

  /**
   * Exchange ID token for ID-JAG token (step 1 of ID-JAG flow)
   */
  private async exchangeIdTokenForIdJag(
    config: openidClient.Configuration,
    idToken: string,
    authServerUrl: string,
    resourceUrl: string,
    scope: string[],
  ): Promise<string> {
    const tokenExchangeParams = {
      requested_token_type: 'urn:ietf:params:oauth:token-type:id-jag',
      audience: authServerUrl,
      resource: resourceUrl,
      subject_token: idToken,
      subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
      scope: scope.join(' '),
    };

    const tokenExchangeResponse = await openidClient.genericGrantRequest(
      config,
      'urn:ietf:params:oauth:grant-type:token-exchange',
      tokenExchangeParams,
    );

    return tokenExchangeResponse.access_token;
  }

  /**
   * Exchange ID-JAG token for access token (step 2 of ID-JAG flow)
   */
  private async exchangeIdJagForAccessToken(
    config: openidClient.Configuration,
    idJagToken: string,
    scope: string[],
  ): Promise<string> {
    const jwtBearerParams = {
      assertion: idJagToken,
      scope: scope.join(' '),
    };

    const resourceTokenResponse = await openidClient.genericGrantRequest(
      config,
      'urn:ietf:params:oauth:grant-type:jwt-bearer',
      jwtBearerParams,
    );

    return resourceTokenResponse.access_token;
  }
}
