import { Component, inject } from '@angular/core';
import { QuizService } from './services/quiz.service';
import { HomeComponent } from './components/home/home.component';
import { QuestionComponent } from './components/question/question.component';
import { ResultsComponent } from './components/results/results.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomeComponent, QuestionComponent, ResultsComponent],
  template: `
    @switch (quiz.screen()) {
      @case ('home') { <app-home /> }
      @case ('question') { <app-question /> }
      @case ('results') { <app-results /> }
    }
  `
})
export class AppComponent {
  quiz = inject(QuizService);
}
