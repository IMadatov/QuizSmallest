import { Component, EventEmitter, OnInit, Output, computed, inject, signal } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { CtQuestion, SelfGrade } from '../../models/question.model';

@Component({
  selector: 'app-ct',
  standalone: true,
  templateUrl: './ct.component.html',
  styleUrl: './ct.component.css'
})
export class CtComponent implements OnInit {
  quiz = inject(QuizService);
  @Output() answerSubmitted = new EventEmitter<void>();

  showModel = signal(false);
  selectedGrade = signal<SelfGrade | null>(null);

  question = computed(() => this.quiz.currentQuestion() as CtQuestion);

  ngOnInit() {
    const q = this.question();
    const saved = this.quiz.getSavedAnswer(q.id);
    if (saved?.type === 'ct') {
      this.showModel.set(true);
      this.selectedGrade.set(saved.selfGrade);
      this.answerSubmitted.emit();
    }
  }

  toggleModel() {
    this.showModel.set(true);
  }

  grade(grade: SelfGrade) {
    if (this.selectedGrade()) return;
    const correct = grade === 'good' || grade === 'ok';
    this.selectedGrade.set(grade);
    this.quiz.saveCtAnswer(grade, correct);
    this.answerSubmitted.emit();
  }

  gradeClass(grade: SelfGrade): string {
    return this.selectedGrade() === grade ? 'selected' : '';
  }

  isGradeDisabled(): boolean {
    return this.selectedGrade() !== null;
  }
}
