import { Injectable } from '@angular/core';
import { AnswerResult, Filter } from '../models/question.model';
import { Screen } from './quiz.service';

export interface PersistedQuizState {
  screen: Screen;
  filter: Filter;
  questionIds: number[];
  currentIndex: number;
  results: AnswerResult[];
}

const STORAGE_KEY = 'dickens-quiz-state';

@Injectable({ providedIn: 'root' })
export class QuizStorageService {

  save(state: PersistedQuizState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota / private mode errors
    }
  }

  load(): PersistedQuizState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PersistedQuizState;
    } catch {
      return null;
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  hasInProgressQuiz(): boolean {
    const saved = this.load();
    return saved !== null && saved.screen !== 'home' && saved.questionIds.length > 0;
  }
}
