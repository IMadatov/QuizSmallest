import { Component, inject } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { BookType, QuestionType } from '../../models/question.model';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  quiz = inject(QuizService);

  typeOptions: { label: string; value: QuestionType | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Multiple Choice', value: 'mcq' },
    { label: 'True/False', value: 'tf' },
    { label: 'Critical Thinking', value: 'ct' }
  ];

  bookOptions: { label: string; value: BookType | 'all' }[] = [
    { label: 'All Books', value: 'all' },
    { label: 'Little Dorrit', value: 'Little Dorrit' },
    { label: 'David Copperfield', value: 'David Copperfield' }
  ];
}
