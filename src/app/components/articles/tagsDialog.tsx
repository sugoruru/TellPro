import returnRandomString from "@/modules/algo/returnRandomString";
import axios from "axios";
import { MutableRefObject, useEffect, useState } from "react";
import { FaTag } from "react-icons/fa6";

const TagsDialog = (props: { setTagSearchValue: Function; tagSearchValue: string; lastAPICalled: MutableRefObject<number> }) => {
  const [tags, setTags] = useState<TagData[]>([]);

  useEffect(() => {
    const lastWord = props.tagSearchValue.split(" ").slice(-1)[0];
    if (lastWord.length > 0) {
      const now = Date.now();
      if (now - props.lastAPICalled.current > 750) {
        // 500ms以上経過しているかチェック.
        props.lastAPICalled.current = now;
        const fetchTags = async () => {
          try {
            const data = await axios.get(`/api/db/tags/search?word=${lastWord}`);
            setTags(data.data.data);
          } catch (error) {
            console.error("Failed to fetch tags", error);
          }
        };
        fetchTags();
      }
    }
  }, [props.tagSearchValue]);

  return (
    <div id="tagDialog" className="mt-2 border flex px-1 h-32 overflow-y-scroll flex-wrap text-gray-900">
      {tags.map((e: TagData) => {
        return (
          <div
            onClick={() => {
              const newTagSearchValue = props.tagSearchValue.split(" ");
              newTagSearchValue.pop();
              newTagSearchValue.push(e.name);
              props.setTagSearchValue(newTagSearchValue.join(" ") + " ");
            }}
            key={returnRandomString(16)}
            className="select-none m-2 px-2 cursor-pointer flex rounded-sm h-6 bg-slate-200"
          >
            <FaTag className="inline-flex my-auto mr-1" />
            {e.name}
          </div>
        );
      })}
    </div>
  );
};

export default TagsDialog;
