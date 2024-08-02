import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import useTagSearch from "./useTagSearch";

const TagsContext = createContext({
  tagSearchValue: "",
  isOpenTagEditor: false,
  handleSetIsOpenTagEditor: (value: boolean) => {},
  tags: [] as TagData[],
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
