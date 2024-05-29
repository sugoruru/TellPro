import { PageType } from "@/modules/pageTypes";

interface Comment {
  id: string,
  user_id: string,
  content: string,
  like_count: number,
  page_id: string,
  page_type: PageType,
  created_at: string,
}