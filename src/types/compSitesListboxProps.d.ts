type gotTitle = "got" | "notGot" | "notYet";

interface CompSitesListboxProps {
  id: string;
  defaultProblem: [SiteName, string];
  gotTitle: gotTitle;
  handleSetProblem: (id: string, site: SiteName, value: string, isInputValid: boolean) => void;
  handleDeleteInput: (id: string) => void;
}
