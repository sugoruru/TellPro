import returnRandomString from "@/modules/algo/returnRandomString";
import data from "@/modules/tags.json";
import { UIEvent, useEffect } from "react";
import { FaTag } from "react-icons/fa6";
let scroll = 0;

const TagsDialog = (props: { tags: Number[]; setTags: Function }) => {
  const tagJSON: Tags = data;

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    scroll = e.currentTarget.scrollTop;
  };

  useEffect(() => {
    const tagDialog = document.getElementById("tagDialog");
    if (tagDialog) tagDialog.scrollTo(0, scroll);
  }, []);

  return (
    <div id="tagDialog" className="mt-2 border flex px-1 h-32 overflow-y-scroll flex-wrap text-gray-900" onScroll={handleScroll}>
      {tagJSON.tags.map((e: Tag) => (
        <div
          onClick={() => {
            if (props.tags.includes(e.id)) {
              if (props.tags.length <= 5) {
                props.setTags(props.tags.filter((tag) => tag !== e.id));
              }
            } else if (props.tags.length < 5) {
              props.setTags([...props.tags, e.id]);
            }
          }}
          key={returnRandomString(16)}
          className={`select-none m-2 px-2 cursor-pointer flex rounded-sm h-6 ${props.tags.includes(e.id) ? "bg-slate-400" : "bg-slate-200"}`}
        >
          <FaTag className="inline-flex my-auto mr-1" />
          {e.name}
        </div>
      ))}
    </div>
  );
};

export default TagsDialog;
