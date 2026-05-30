import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { McqQuestion, OptionKey } from '../../models/question.model';

interface ShuffledOption {
  key: OptionKey;
  text: string;
}

@Component({
  selector: 'app-mcq',
  standalone: true,
  templateUrl: './mcq.component.html',
  styleUrl: './mcq.component.css'
})
export class McqComponent implements OnInit {
  quiz = inject(QuizService);
  @Output() answerSubmitted = new EventEmitter<void>();

  selected = signal<Set<OptionKey>>(new Set());
  confirmed = signal(false);
  shuffledOptions = signal<ShuffledOption[]>([]);
  correctKeys = signal<OptionKey[]>([]);
  private shuffledOrder = signal<OptionKey[]>([]);

  ngOnInit() {
    const q = this.quiz.currentQuestion() as McqQuestion;
    this.correctKeys.set([...q.answers]);

    const saved = this.quiz.getSavedAnswer(q.id);
    if (saved?.type === 'mcq') {
      this.shuffledOrder.set(saved.shuffledOrder);
      this.shuffledOptions.set(this.buildOptions(q, saved.shuffledOrder));
      this.selected.set(new Set(saved.selected));
      this.confirmed.set(true);
      this.answerSubmitted.emit();
      return;
    }

    const order = this.shuffle([...(['A', 'B', 'C', 'D'] as OptionKey[])]);
    this.shuffledOrder.set(order);
    this.shuffledOptions.set(this.buildOptions(q, order));
  }

  toggleOption(key: OptionKey) {
    if (this.confirmed()) return;
    this.selected.update(set => {
      const next = new Set(set);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  confirmAnswer() {
    if (this.confirmed() || this.selected().size === 0) return;
    const selected = [...this.selected()];
    const correct = this.isAnswerCorrect(this.selected(), this.correctKeys());
    this.confirmed.set(true);
    this.quiz.saveMcqAnswer(selected, this.shuffledOrder(), correct);
    this.answerSubmitted.emit();
  }

  isSelected(key: OptionKey): boolean {
    return this.selected().has(key);
  }

  isPending(key: OptionKey): boolean {
    return !this.confirmed() && this.selected().has(key);
  }

  isCorrect(key: OptionKey): boolean {
    if (!this.confirmed()) return false;
    return this.correctKeys().includes(key);
  }

  isWrong(key: OptionKey): boolean {
    if (!this.confirmed()) return false;
    return this.selected().has(key) && !this.correctKeys().includes(key);
  }

  isMissed(key: OptionKey): boolean {
    if (!this.confirmed()) return false;
    return this.correctKeys().includes(key) && !this.selected().has(key);
  }

  isDisabled(): boolean {
    return this.confirmed();
  }

  hasSelection(): boolean {
    return this.selected().size > 0;
  }

  private buildOptions(q: McqQuestion, order: OptionKey[]): ShuffledOption[] {
    return order.map(key => ({ key, text: q.options[key] }));
  }

  private isAnswerCorrect(selected: Set<OptionKey>, correct: OptionKey[]): boolean {
    if (selected.size !== correct.length) return false;
    return correct.every(k => selected.has(k));
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
