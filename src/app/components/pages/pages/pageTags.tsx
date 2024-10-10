import returnRandomString from "@/modules/algo/returnRandomString";
import React from "react";
import { Fragment } from "react";
import { FaTag } from "react-icons/fa6";

const PageTags = (props: { tags: string[] }) => {
  return (
    <>
      <div className="flex justify-center">
        <div className="flex mt-2 px-1 flex-wrap">
          {props.tags.map((e) =>
            e === "" ? (
              <Fragment key={returnRandomString(64)}></Fragment>
            ) : (
              <div className="select-none m-2 px-2 cursor-pointer flex rounded-sm h-6 bg-slate-300" key={returnRandomString(32)}>
                <FaTag className="inline-flex my-auto mr-1" />
                {e}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default PageTags;
