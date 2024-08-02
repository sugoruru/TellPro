type SiteName = "AtCoder" | "Codeforces" | "yukicoder" | "AOJ" | "MojaCoder";

interface Problem {
  site: SiteName;
  value: string;
  isInputValid: boolean;
}

interface ProblemJSON {
  description: string;
  problems: [string, Problem][];
  titleData: [string, {
    title: string;
    err: boolean;
  }][];
}