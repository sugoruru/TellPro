import { PageType } from "@/modules/pageTypes";

interface Page {
  id: string,
  user_id: string,
  title: string,
  content: string,
  like_count: number,
  comment_count: number,
  tags: string[],
  is_public: boolean,
  date: string,
  page_type: PageType,
  is_closed: boolean,
}

// contentなどを省略して軽量化したPage型.
interface PageList {
  id: string,
  user_id: string,
  title: string,
  like_count: number,
  comment_count: number,
  tags: string[],
  is_public: boolean,
  date: string,
  page_type: PageType,
  is_closed: boolean,
}