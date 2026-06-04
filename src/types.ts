export interface BoardImage {
  id: string;
  url: string;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  isUserAdded?: boolean;
}

export interface StudentNote {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface StudyGoal {
  id: string;
  title: string;
  completed: boolean;
  chapter: string;
  weight?: 'high' | 'medium' | 'low';
}

export interface PDFAnnotation {
  id: string;
  page: number;
  text: string;
  color: string;
  createdAt: string;
}
