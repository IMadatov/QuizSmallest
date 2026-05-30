export type QuestionType = 'mcq' | 'tf' | 'ct';
export type BookType = 'Little Dorrit' | 'David Copperfield' | 'Both';
export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface McqQuestion {
  id: number;
  type: 'mcq';
  book: BookType;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answers: OptionKey[];
  explanation: string;
}

export interface TfQuestion {
  id: number;
  type: 'tf';
  book: BookType;
  question: string;
  answer: boolean;
  explanation: string;
}

export interface CtQuestion {
  id: number;
  type: 'ct';
  book: BookType;
  question: string;
  model_answer: string;
}

export type Question = McqQuestion | TfQuestion | CtQuestion;

export type SelfGrade = 'good' | 'ok' | 'need-more';

export interface AnswerResult {
  questionId: number;
  type: QuestionType;
  correct: boolean;
}

export interface Filter {
  type: QuestionType | 'all';
  book: BookType | 'all';
}
