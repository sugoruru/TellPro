import React, { memo } from "react";
import { FaTag } from "react-icons/fa6";
import returnRandomString from "@/modules/algo/returnRandomString";
import { useTagsContext } from "../../hooks/tagsContext";

const TagsInput = memo(function TagsInputMemo() {
  const { tagSearchValue, handleSetTagValue, tags, handleTagClick } = useTagsContext();

  return (
    <>
      <input
        value={tagSearchValue}
        onChange={handleSetTagValue}
        type="text"
        className="border w-full outline-sky-400"
        placeholder="タグを検索(半角スペース区切り)"
      />
      <div id="tagDialog" className="mt-2 border flex px-1 h-32 overflow-y-scroll flex-wrap text-gray-900">
        {tags.map((e) => (
          <div onClick={() => handleTagClick(e.name)} key={returnRandomString(16)} className="select-none m-2 px-2 cursor-pointer flex rounded-sm h-6 bg-slate-200">
            <FaTag className="inline-flex my-auto mr-1" />
            {e.name}
          </div>
        ))}
      </div>
    </>
  );
});

export default TagsInput;
