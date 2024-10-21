import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Tag } from "@/types/DBTypes";

const useTagSearch = (tagSearchValue: string) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const lastTagsAPICalled = useRef(0);
  const fetchTags = useCallback(async (word: string) => {
    try {
      const data = await axios.get<{ data: Tag[] }>(`/api/db/tags/search?word=${word}`);
      setTags(data.data.data);
    } catch (error) {
      console.error("Failed to fetch tags", error);
    }
  }, []);
  useEffect(() => {
    const lastWord = tagSearchValue.split(" ").slice(-1)[0];
    if (lastWord.length > 0) {
      const now = Date.now();
      if (now - lastTagsAPICalled.current > 750) {
        lastTagsAPICalled.current = now;
        fetchTags(lastWord);
      }
    }
  }, [tagSearchValue, fetchTags]);

  return { tags, setTags };
};

export default useTagSearch;
