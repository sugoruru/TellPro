import returnRandomString from "@/modules/algo/returnRandomString";

const H1 = (props: { text: JSX.Element }) => {
  return (
    <h1 className="dark:text-white font-bold text-gray-900 mb-4" style={{ fontSize: "160%" }} key={returnRandomString(64)}>
      {props.text}
      <hr />
    </h1>
  );
};
export default H1;
