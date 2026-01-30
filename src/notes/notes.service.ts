import { Injectable, NotFoundException } from '@nestjs/common';
import type { Note } from './note.dto';

@Injectable()
export class NotesService {
  private readonly notes: Note[] = [
    { id: '1', message: 'Welcome to your notes app!' },
    { id: '2', message: 'Start taking notes and stay organized' },
  ];

  findAll(): Note[] {
    return this.notes;
  }

  findOne(id: string): Note {
    const note = this.notes.find((note) => note.id === id);
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
    return note;
  }

  create(message: string): Note {
    const id = (this.notes.length + 1).toString();
    const note: Note = { id, message };
    this.notes.push(note);
    return note;
  }

  update(id: string, message: string): Note {
    const note = this.findOne(id);
    const updatedNote = { ...note, message };
    const index = this.notes.findIndex((n) => n.id === id);
    this.notes[index] = updatedNote;
    return updatedNote;
  }

  delete(id: string): void {
    const index = this.notes.findIndex((note) => note.id === id);
    if (index === -1) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
    this.notes.splice(index, 1);
  }
}
