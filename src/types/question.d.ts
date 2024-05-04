interface Question {
  ID: string;
  userID: string;
  title: string;
  content: string;
  date: string;
  likeCount: number;
  answerCount: number;
  tags: number[];
  isPublic: boolean;
  isClosed: boolean;
}

interface QuestionList {
  ID: string;
  userID: string;
  title: string;
  date: string;
  likeCount: number;
  answerCount: number;
  tags: number[];
  isPublic: boolean;
  isClosed: boolean;
}