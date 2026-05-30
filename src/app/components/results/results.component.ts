import { Component, computed, inject } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { RESULT_TIERS } from '../../data/results.data';

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

  private activeTier = computed(() => {
    const pct = this.percentage();
    return RESULT_TIERS.find(t => pct >= t.minPercent) ?? RESULT_TIERS[RESULT_TIERS.length - 1];
  });

  message = computed(() => this.activeTier().message);

  mediaSrc = computed(() => this.activeTier().media);

  isVideo = computed(() => this.mediaSrc().endsWith('.webm'));

  breakdown = computed(() => this.quiz.getBreakdown());

  typeLabel(type: string): string {
    if (type === 'mcq') return 'Multiple Choice';
    if (type === 'tf') return 'True / False';
    return 'Critical Thinking';
  }
}
