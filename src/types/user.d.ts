interface UserPublic {
  id: string;
  username: string;
  icon: string;
  status_message: string;
  answer_score: number;
  page_score: number;
  last_seeing_notifications_at: string;
  is_admin: boolean;
  is_banned: boolean;
  atcoder_id: string;
  x_id: string;
  codeforces_id: string;
  sent_proposal_at: string;
  sent_report_at: string;
}
export { UserPublic };