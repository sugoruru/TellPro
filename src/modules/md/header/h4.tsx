import returnRandomString from "@/modules/algo/returnRandomString";

const H4 = (props: { text: JSX.Element }) => {
  return (
    <h4 className="text-lg font-bold dark:text-white text-gray-900" style={{ fontSize: "130%" }} key={returnRandomString(64)}>
      {props.text}
    </h4>
  );
};
export default H4;
