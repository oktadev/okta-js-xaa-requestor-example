import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import { loggedFetch } from '../common/http-logger';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

@Injectable()
export class TodosService {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async listTodos(idToken: string): Promise<Todo[]> {
    const resourceServerUrl = this.configService.get<string>(
      'TODO_RESOURCE_SERVER',
    );

    if (!resourceServerUrl) {
      throw new Error(
        'TODO_RESOURCE_SERVER environment variable is not configured',
      );
    }

    // Get access token via ID-JAG exchange
    const accessToken = await this.authService.exchangeIdTokenForAccessToken(
      idToken,
      `${resourceServerUrl}/todos`,
      ['todos.read'],
    );

    // Call the todos endpoint
    const response = await loggedFetch(`${resourceServerUrl}/api/todos`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch todos: ${response.status} ${response.statusText}`,
      );
    }

    const responseData = (await response.json()) as {
      success: boolean;
      count: number;
      user: string;
      data: Todo[];
    };

    return responseData.data;
  }
}
