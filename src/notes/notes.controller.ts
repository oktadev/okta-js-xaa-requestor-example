import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Render,
  Redirect,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { TodosService } from '../todos/todos.service';
import { CreateNoteDto } from './note.dto';
import type { Note } from './note.dto';
import type { Todo } from '../todos/todos.service';
import type { RequestWithSession } from '../common/session.types';
import { AuthGuard } from '../common/auth.guard';

@Controller('notes')
@UseGuards(AuthGuard)
export class NotesController {
  private readonly logger = new Logger(NotesController.name);

  constructor(
    private readonly notesService: NotesService,
    private readonly todosService: TodosService,
  ) {}

  @Get()
  @Render('notes')
  async getNotesPage(
    @Query('id') id?: string,
    @Req() req?: RequestWithSession,
  ) {
    const notes = this.notesService.findAll();
    let selectedNote: Note | null = null;
    if (id) {
      try {
        selectedNote = this.notesService.findOne(id);
      } catch (error) {
        this.logger.warn(`Note with ID ${id} not found`, error);
      }
    }

    let todos: Todo[] = [];
    if (req?.session?.user?.idToken) {
      try {
        todos = await this.todosService.listTodos(req.session.user.idToken);
      } catch (error) {
        this.logger.warn('Failed to fetch todos', error);
      }
    }

    return {
      notes: notes.map((note) => ({
        ...note,
        isActive: note.id === id,
      })),
      selectedNote,
      user: req?.session?.user,
      todos,
    };
  }

  @Post()
  @Redirect('/notes')
  createNote(@Body() createNoteDto: CreateNoteDto) {
    const note = this.notesService.create(createNoteDto.message);
    return { url: `/notes?id=${note.id}` };
  }
}
