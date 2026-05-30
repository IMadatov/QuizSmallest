import { Component, computed, inject, signal } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { McqComponent } from '../mcq/mcq.component';
import { TfComponent } from '../tf/tf.component';
import { CtComponent } from '../ct/ct.component';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [McqComponent, TfComponent, CtComponent],
  templateUrl: './question.component.html',
  styleUrl: './question.component.css'
})
export class QuestionComponent {
  quiz = inject(QuizService);
  private answeredIndex = signal<number | null>(null);

  showNext = computed(() => this.answeredIndex() === this.quiz.currentIndex());

  progressPercent = computed(() => {
    const { current, total } = this.quiz.progress();
    return total > 0 ? (current / total) * 100 : 0;
  });

  bookClass = computed(() => {
    const book = this.quiz.currentQuestion().book;
    if (book === 'Little Dorrit') return 'little-dorrit';
    if (book === 'David Copperfield') return 'david-copperfield';
    return 'both';
  });

  typeLabel = computed(() => {
    const type = this.quiz.currentQuestion().type;
    if (type === 'mcq') return 'Multiple Choice';
    if (type === 'tf') return 'True / False';
    return 'Critical Thinking';
  });

  isLast = computed(() => {
    const { current, total } = this.quiz.progress();
    return current >= total;
  });

  onAnswered() {
    this.answeredIndex.set(this.quiz.currentIndex());
  }
}
