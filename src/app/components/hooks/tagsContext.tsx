import React, { createContext, useContext, useState, useCallback } from "react";
import useTagSearch from "./useTagSearch";
import { cantUseURL } from "@/modules/other/cantUseURL";
import { Tag } from "@/types/DBTypes";

const TagsContext = createContext({
  tagSearchValue: "",
  isOpenTagEditor: false,
  handleSetIsOpenTagEditor: (value: boolean) => {},
  tags: [] as Tag[],
  handleSetTagValue: (e: React.ChangeEvent<HTMLInputElement>) => {},
  setTagSearchValue: (value: string) => {},
  handleTagClick: (tagName: string) => {},
});
export const TagsProvider = ({ children }: { children: React.ReactNode }) => {
  const [tagSearchValue, setTagSearchValue] = useState("");
  const [isOpenTagEditor, setIsOpenTagEditor] = useState(false);
  const { tags, setTags } = useTagSearch(tagSearchValue);
  const handleSetTagValue = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.split(" ").length > 5) return;
    if (cantUseURL.test(e.target.value)) return;
    setTagSearchValue(e.target.value);
  }, []);
  const handleTagClick = useCallback(
    (tagName: string) => {
      setTagSearchValue((prevValue) => {
        const newTagSearchValue = prevValue.split(" ");
        newTagSearchValue.pop();
        newTagSearchValue.push(tagName);
        setTags([]);
        return newTagSearchValue.join(" ") + " ";
      });
    },
    [setTags]
  );
  const handleSetIsOpenTagEditor = useCallback((value: boolean) => {
    setIsOpenTagEditor(value);
  }, []);
  return (
    <TagsContext.Provider
      value={{
        tagSearchValue,
        isOpenTagEditor,
        handleSetIsOpenTagEditor,
        tags,
        handleSetTagValue,
        setTagSearchValue,
        handleTagClick,
      }}
    >
      {children}
    </TagsContext.Provider>
  );
};
export const useTagsContext = () => useContext(TagsContext);
