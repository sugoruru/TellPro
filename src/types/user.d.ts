interface User {
  id: string;
  username: string;
  mail: string;
  icon: string;
  status_message: string;
  answer_score: number;
  page_score: number;
  last_login_at: string;
}

// mailなどを省略して個人情報をなくしたUser型.
interface UserPublic {
  id: string;
  username: string;
  icon: string;
  status_message: string;
  answer_score: number;
  page_score: number;
  last_login_at: string;
}