import { Page, User, Comment, Notice } from "./DBTypes";

type DBUsersExistMe = {
  ok: true;
  exist: boolean;
  data: User;
} | {
  ok: false;
  error: string;
};

type PagesPagesData = {
  isExist: boolean;
  me: User | null;
  page: Page | null;
  pageUser: User | null;
  comments: Comment[];
  commentsUser: User[];
  commentsLike: { comment_id: string }[];
  isLiked: boolean;
  isBookmarked: boolean;
};

type PagesRoot = {
  ok: boolean;
  data: {
    notices: Notice[];
    trending_articles: Page[];
    trending_questions: Page[];
    users: User[];
  }
}

type AtCoderAPI = {
  IsRated: boolean;
  Place: number;
  OldRating: number;
  NewRating: number;
  Performance: number;
  InnerPerformance: number;
  ContestScreenName: string;
  ContestName: string;
  ContestNameEn: string;
  EndTime: string;
}[];

type CodeforcesAPI = {
  status: string;
  result: {
    contribution: number;
    lastOnlineTimeSeconds: number;
    rating: number;
    friendOfCount: number;
    titlePhoto: string;
    rank: string;
    handle: string;
    maxRating: number;
    avatar: string;
    registrationTimeSeconds: number;
    maxRank: string;
  }[];
};

type PagesAchievements = {
  ok: false,
  error: string,
} | {
  ok: true,
  achievements: { achievement_name: string }[]
}

export type { DBUsersExistMe, PagesPagesData, PagesRoot, AtCoderAPI, CodeforcesAPI, PagesAchievements };