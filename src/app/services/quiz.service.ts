import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Question,
  Filter,
  SelfGrade,
  StoredAnswer,
  OptionKey
} from '../models/question.model';
import { QUESTIONS } from '../data/questions.data';
import { QuizStorageService } from './quiz-storage.service';

export type Screen = 'home' | 'question' | 'results';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private storage = inject(QuizStorageService);

  screen = signal<Screen>('home');
  filter = signal<Filter>({ type: 'all', book: 'all' });
  questions = signal<Question[]>([]);
  currentIndex = signal<number>(0);
  answers = signal<Record<number, StoredAnswer>>({});

  currentQuestion = computed(() => this.questions()[this.currentIndex()]);
  progress = computed(() => ({
    current: this.currentIndex() + 1,
    total: this.questions().length
  }));
  score = computed(() => {
    const values = Object.values(this.answers());
    return {
      correct: values.filter(a => a.correct).length,
      answered: values.length
    };
  });
  filteredCount = computed(() => this.getFiltered().length);
  hasSavedProgress = computed(() => {
    this.screen();
    this.questions();
    return this.storage.hasInProgressQuiz();
  });
  canGoBack = computed(() => this.currentIndex() > 0);

  constructor() {
    this.restoreFilter();
  }

  setFilter(filter: Partial<Filter>) {
    this.filter.update(f => ({ ...f, ...filter }));
    this.persistFilterOnly();
  }

  startQuiz() {
    const filtered = this.getFiltered();
    this.questions.set(this.shuffle(filtered));
    this.currentIndex.set(0);
    this.answers.set({});
    this.screen.set('question');
    this.persist();
  }

  saveMcqAnswer(selected: OptionKey[], shuffledOrder: OptionKey[], correct: boolean) {
    const q = this.currentQuestion();
    this.saveAnswer(q.id, {
      type: 'mcq',
      selected,
      shuffledOrder,
      confirmed: true,
      correct
    });
  }

  saveTfAnswer(selected: boolean, correct: boolean) {
    const q = this.currentQuestion();
    this.saveAnswer(q.id, { type: 'tf', selected, correct });
  }

  saveCtAnswer(selfGrade: SelfGrade, correct: boolean) {
    const q = this.currentQuestion();
    this.saveAnswer(q.id, { type: 'ct', selfGrade, correct });
  }

  getSavedAnswer(questionId: number): StoredAnswer | undefined {
    return this.answers()[questionId];
  }

  isQuestionAnswered(questionId: number): boolean {
    return this.answers()[questionId] !== undefined;
  }

  prevQuestion() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
      this.persist();
    }
  }

  endQuiz() {
    this.screen.set('results');
    this.persist();
  }

  nextQuestion() {
    const next = this.currentIndex() + 1;
    if (next >= this.questions().length) {
      this.screen.set('results');
    } else {
      this.currentIndex.set(next);
    }
    this.persist();
  }

  goHome() {
    this.screen.set('home');
    this.questions.set([]);
    this.currentIndex.set(0);
    this.answers.set({});
    this.storage.clear();
  }

  retryQuiz() {
    this.startQuiz();
  }

  restoreAndContinue() {
    const saved = this.storage.load();
    if (!saved || saved.questionIds.length === 0) return;

    const questions = saved.questionIds
      .map(id => QUESTIONS.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined);

    if (questions.length === 0) {
      this.storage.clear();
      return;
    }

    this.filter.set(saved.filter);
    this.questions.set(questions);
    this.currentIndex.set(Math.min(saved.currentIndex, questions.length - 1));
    this.answers.set(saved.answers ?? {});
    this.screen.set(saved.screen === 'results' ? 'results' : 'question');
    this.persist();
  }

  getBreakdown() {
    const values = Object.values(this.answers());
    const types = ['mcq', 'tf', 'ct'] as const;
    return types.map(type => {
      const filtered = values.filter(r => r.type === type);
      return {
        type,
        correct: filtered.filter(r => r.correct).length,
        total: filtered.length
      };
    });
  }

  private saveAnswer(questionId: number, data: StoredAnswer) {
    this.answers.update(a => ({ ...a, [questionId]: data }));
    this.persist();
  }

  private persist() {
    if (this.screen() === 'home' || this.questions().length === 0) return;
    this.storage.save({
      screen: this.screen(),
      filter: this.filter(),
      questionIds: this.questions().map(q => q.id),
      currentIndex: this.currentIndex(),
      answers: this.answers()
    });
  }

  private persistFilterOnly() {
    const saved = this.storage.load();
    if (saved) {
      this.storage.save({ ...saved, filter: this.filter() });
    }
  }

  private restoreFilter() {
    const saved = this.storage.load();
    if (saved?.filter) {
      this.filter.set(saved.filter);
    }
  }

  private getFiltered(): Question[] {
    const f = this.filter();
    return QUESTIONS.filter(q => {
      const typeMatch = f.type === 'all' || q.type === f.type;
      const bookMatch = f.book === 'all' || q.book === f.book || q.book === 'Both';
      return typeMatch && bookMatch;
    });
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
