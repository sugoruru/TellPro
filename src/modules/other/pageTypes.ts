const pageTypes = ["articles", "questions", "comments", "problems"] as const;
export type PageType = "articles" | "questions" | "comments" | "problems";
export default pageTypes;