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

  ngOnInit() {
    const q = this.quiz.currentQuestion() as McqQuestion;
    const entries: ShuffledOption[] = (['A', 'B', 'C', 'D'] as OptionKey[]).map(key => ({
      key,
      text: q.options[key]
    }));
    this.shuffledOptions.set(this.shuffle(entries));
    this.correctKeys.set([...q.answers]);
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
    const correct = this.isAnswerCorrect(this.selected(), this.correctKeys());
    this.confirmed.set(true);
    this.quiz.submitAnswer(correct);
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
