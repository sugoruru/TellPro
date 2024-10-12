import { SiteNameType } from "./DBTypes";

type gotTitle = "got" | "notGot" | "notYet";

type CompSitesListboxProps = {
  id: string;
  defaultProblem: [SiteNameType, string];
  gotTitle: gotTitle;
  handleSetProblem: (id: string, site: SiteNameType, value: string, isInputValid: boolean) => void;
  handleDeleteInput: (id: string) => void;
}

export type { CompSitesListboxProps, gotTitle };