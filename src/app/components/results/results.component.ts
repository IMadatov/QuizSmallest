import { Component, computed, inject } from '@angular/core';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-results',
  standalone: true,
  templateUrl: './results.component.html',
  styleUrl: './results.component.css'
})
export class ResultsComponent {
  quiz = inject(QuizService);

  total = computed(() => this.quiz.questions().length);

  percentage = computed(() => {
    const total = this.total();
    if (total === 0) return 0;
    return Math.round((this.quiz.score().correct / total) * 100);
  });

  message = computed(() => {
    const pct = this.percentage();
    if (pct >= 90) return 'Excellent! You are ready for the exam.';
    if (pct >= 70) return 'Good work! Review the weak areas.';
    if (pct >= 50) return 'Keep studying. You can do it!';
    return 'More practice needed. Try again!';
  });

  breakdown = computed(() => this.quiz.getBreakdown());

  typeLabel(type: string): string {
    if (type === 'mcq') return 'Multiple Choice';
    if (type === 'tf') return 'True / False';
    return 'Critical Thinking';
  }
}
