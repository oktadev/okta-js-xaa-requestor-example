import { IsNotEmpty, IsString } from 'class-validator';

export interface Note {
  readonly id: string;
  readonly message: string;
}

export class CreateNoteDto {
  @IsNotEmpty()
  @IsString()
  readonly message: string = '';
}
