interface User {
  ID: string;
  username: string;
  mail: string;
  icon: string;
  statusMessage: string;
  answerScore: number;
  pageScore: number;
}

// mailなどを省略して個人情報をなくしたUser型.
interface UserList {
  ID: string;
  username: string;
  icon: string;
  statusMessage: string;
  answerScore: number;
  pageScore: number;
}