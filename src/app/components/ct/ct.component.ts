import { Component, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { CtQuestion, SelfGrade } from '../../models/question.model';

@Component({
  selector: 'app-ct',
  standalone: true,
  templateUrl: './ct.component.html',
  styleUrl: './ct.component.css'
})
export class CtComponent {
  quiz = inject(QuizService);
  @Output() answerSubmitted = new EventEmitter<void>();

  showModel = signal(false);
  selectedGrade = signal<SelfGrade | null>(null);

  question = computed(() => this.quiz.currentQuestion() as CtQuestion);

  toggleModel() {
    this.showModel.set(true);
  }

  grade(grade: SelfGrade) {
    if (this.selectedGrade()) return;
    this.selectedGrade.set(grade);
    this.quiz.submitSelfGrade(grade);
    this.answerSubmitted.emit();
  }

  gradeClass(grade: SelfGrade): string {
    return this.selectedGrade() === grade ? 'selected' : '';
  }

  isGradeDisabled(): boolean {
    return this.selectedGrade() !== null;
  }
}
