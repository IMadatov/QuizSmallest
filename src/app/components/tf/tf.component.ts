import { Component, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { TfQuestion } from '../../models/question.model';

@Component({
  selector: 'app-tf',
  standalone: true,
  templateUrl: './tf.component.html',
  styleUrl: './tf.component.css'
})
export class TfComponent {
  quiz = inject(QuizService);
  @Output() answerSubmitted = new EventEmitter<void>();

  selected = signal<boolean | null>(null);

  question = computed(() => this.quiz.currentQuestion() as TfQuestion);

  select(value: boolean) {
    if (this.selected() !== null) return;
    const correct = value === this.question().answer;
    this.selected.set(value);
    this.quiz.submitAnswer(correct);
    this.answerSubmitted.emit();
  }

  isCorrect(value: boolean): boolean {
    const selected = this.selected();
    if (selected === null) return false;
    return value === this.question().answer;
  }

  isWrong(value: boolean): boolean {
    const selected = this.selected();
    if (selected === null) return false;
    return value === selected && value !== this.question().answer;
  }

  isDisabled(): boolean {
    return this.selected() !== null;
  }
}
