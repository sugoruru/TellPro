import returnRandomString from "@/modules/algo/returnRandomString";

const NoticeBlock = (props: { title: string; content: string; created_at: string }) => (
  <div className="my-5 border-b-2 border-dotted border-gray-600">
    <div className="flex justify-between">
      <div className="text-xl font-extrabold">{props.title}</div>
      <div className="text-gray-600">(公開:{props.created_at.split("T")[0]})</div>
    </div>
    <div>
      {props.content.split("\n").map((e) => (
        <p key={returnRandomString(32)}>{e}</p>
      ))}
    </div>
  </div>
);
export default NoticeBlock;
