import { Injectable, inject, signal, computed } from '@angular/core';
import { Question, Filter, AnswerResult, SelfGrade } from '../models/question.model';
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
  results = signal<AnswerResult[]>([]);

  currentQuestion = computed(() => this.questions()[this.currentIndex()]);
  progress = computed(() => ({
    current: this.currentIndex() + 1,
    total: this.questions().length
  }));
  score = computed(() => ({
    correct: this.results().filter(r => r.correct).length,
    answered: this.results().length
  }));
  filteredCount = computed(() => this.getFiltered().length);
  hasSavedProgress = computed(() => {
    this.screen();
    this.questions();
    return this.storage.hasInProgressQuiz();
  });

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
    this.results.set([]);
    this.screen.set('question');
    this.persist();
  }

  submitAnswer(correct: boolean) {
    const q = this.currentQuestion();
    this.results.update(r => [...r, {
      questionId: q.id,
      type: q.type,
      correct
    }]);
    this.persist();
  }

  submitSelfGrade(grade: SelfGrade) {
    const correct = grade === 'good' || grade === 'ok';
    this.submitAnswer(correct);
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
    this.results.set([]);
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
    this.results.set(saved.results);
    this.screen.set(saved.screen === 'results' ? 'results' : 'question');
    this.persist();
  }

  getBreakdown() {
    const results = this.results();
    const types = ['mcq', 'tf', 'ct'] as const;
    return types.map(type => {
      const filtered = results.filter(r => r.type === type);
      return {
        type,
        correct: filtered.filter(r => r.correct).length,
        total: filtered.length
      };
    });
  }

  private persist() {
    if (this.screen() === 'home' || this.questions().length === 0) return;
    this.storage.save({
      screen: this.screen(),
      filter: this.filter(),
      questionIds: this.questions().map(q => q.id),
      currentIndex: this.currentIndex(),
      results: this.results()
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
