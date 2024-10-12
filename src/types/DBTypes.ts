type PageType = "articles" | "questions" | "problems";
type NotificationType = "pomosk_one_time" | "comment" | "achievement";
type SiteNameType = "AtCoder" | "Codeforces" | "yukicoder" | "AOJ" | "MojaCoder";

type Achievement = {
  id: string,
  user_id: string,
  achievement_name: string,
  created_at: string,
}

type Bookmark = {
  id: string,
  user_id: string,
  page_id: string,
  page_type: PageType,
  created_at: string,
}

type CommentLike = {
  id: string,
  user_id: string,
  comment_id: string,
  created_at: string,
}

type Comment = {
  id: string,
  user_id: string,
  content: string,
  like_count: number,
  page_id: string,
  page_type: PageType,
  created_at: string,
}

type Like = {
  id: string,
  user_id: string,
  page_id: string,
  page_type: PageType,
  created_at: string,
}

type Notice = {
  id: string,
  title: string,
  content: string,
  created_at: string,
}

type Notification = {
  id: string,
  user_id: string,
  notification_type: NotificationType,
  notification_value: string,
  created_at: string,
}

type Page = {
  id: string,
  user_id: string,
  title: string,
  content: string,
  like_count: number,
  comment_count: number,
  tags: string[],
  is_public: boolean,
  page_type: PageType,
  date: string,
  is_closed: boolean,
}

type Proposal = {
  id: string,
  title: string,
  content: string,
  user: string,
  created_at: string,
}

type Report = {
  id: string,
  user_id: string,
  reported_user_id: string,
  report_value: string,
  created_at: string,
}

type Tag = {
  name: string,
  image: string,
  page_count: number,
  question_count: number,
  problem_count: number,
}

type User = {
  id: string,
  mail: string,
  username: string,
  icon: string,
  status_message: string,
  answer_score: number,
  page_score: number,
  last_seeing_notifications_at: string,
  is_admin: boolean,
  atcoder_id: string,
  x_id: string,
  codeforces_id: string,
  sent_proposal_at: string,
  sent_report_at: string,
  is_banned: boolean,
}

type ProblemObject = {
  site: SiteNameType;
  value: string;
  isInputValid: boolean;
}

type ProblemJSON = {
  description: string;
  problems: [string, ProblemObject][];
  titleData: [string, {
    title: string;
    err: boolean;
  }][];
}

export type {
  PageType,
  NotificationType,
  SiteNameType,
  Achievement,
  Bookmark,
  CommentLike,
  Comment,
  Like,
  Notice,
  Notification,
  Page,
  Proposal,
  Report,
  Tag,
  User,
  ProblemObject,
  ProblemJSON
}