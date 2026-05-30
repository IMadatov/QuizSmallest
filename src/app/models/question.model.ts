export type QuestionType = 'mcq' | 'tf' | 'ct';
export type BookType = 'Little Dorrit' | 'David Copperfield' | 'Both';
export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface McqQuestion {
  id: number;
  type: 'mcq';
  book: BookType;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answer: OptionKey[];
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

export interface McqAnswerData {
  type: 'mcq';
  selected: OptionKey[];
  shuffledOrder: OptionKey[];
  confirmed: true;
  correct: boolean;
}

export interface TfAnswerData {
  type: 'tf';
  selected: boolean;
  correct: boolean;
}

export interface CtAnswerData {
  type: 'ct';
  selfGrade: SelfGrade;
  correct: boolean;
}

export type StoredAnswer = McqAnswerData | TfAnswerData | CtAnswerData;

export interface Filter {
  type: QuestionType | 'all';
  book: BookType | 'all';
}
