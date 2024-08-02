export const sites = [
  { id: 1, name: "AtCoder" },
  { id: 2, name: "Codeforces" },
  { id: 3, name: "yukicoder" },
  { id: 4, name: "AOJ" },
  { id: 5, name: "MojaCoder" },
] as { id: number; name: SiteName }[];

export const siteImg = {
  AtCoder: "/svg/atcoder.png",
  Codeforces: "/svg/codeforces.svg",
  yukicoder: "/svg/yukicoder.png",
  AOJ: "/svg/aoj.png",
  MojaCoder: "/svg/mojacoder.svg",
  "": "",
};

export const sitePlaceholder = {
  AtCoder: "contestID/tasks/problemID",
  Codeforces: "contestID/problem/problemID",
  yukicoder: "problemID",
  AOJ: "problemID",
  MojaCoder: "userID/problems/problemID",
  "": "",
};

export const siteRegex = {
  AtCoder: /^([a-zA-Z0-9_\-]+)\/tasks\/([a-zA-Z0-9_\-]+)$/,
  Codeforces: /^([0-9]+)\/problem\/([A-Za-z0-9_\-])$/,
  yukicoder: /^([0-9]+)$/,
  AOJ: /^([a-zA-Z0-9_\-]+)$/,
  MojaCoder: /^([a-zA-Z0-9_\-]+)\/problems\/([a-zA-Z0-9_\-]+)$/,
  "": /^$/,
};

export const siteURL = (site: SiteName, id: string) => {
  switch (site) {
    case "AtCoder":
      return `https://atcoder.jp/contests/${id}`;
    case "Codeforces":
      return `https://codeforces.com/contest/${id}`;
    case "yukicoder":
      return `https://yukicoder.me/problems/no/${id}`;
    case "AOJ":
      return `https://onlinejudge.u-aizu.ac.jp/services/ice/?problemId=${id}`;
    case "MojaCoder":
      return `https://mojacoder.app/users/${id}`;
    default:
      return "";
  }
}