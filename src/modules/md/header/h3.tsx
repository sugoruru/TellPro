import returnRandomString from "@/modules/algo/returnRandomString";

const H3 = (props: { text: JSX.Element }) => {
  return (
    <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-4" style={{ fontSize: "140%" }} key={returnRandomString(64)}>
      {props.text}
    </h3>
  );
};
export default H3;
