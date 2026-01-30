import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [TodosService],
  exports: [TodosService],
})
export class TodosModule {}
