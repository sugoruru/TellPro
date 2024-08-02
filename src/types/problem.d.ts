type SiteName = "AtCoder" | "Codeforces" | "yukicoder" | "AOJ";

interface Problem {
  site: SiteName;
  value: string;
  isInputValid: boolean;
}