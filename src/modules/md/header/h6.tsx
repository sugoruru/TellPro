import returnRandomString from "@/modules/algo/returnRandomString";

const H6 = (props: { text: JSX.Element }) => {
  return (
    <h6 className="text-sm font-bold dark:text-white text-gray-900" style={{ fontSize: "110%" }} key={returnRandomString(64)}>
      {props.text}
    </h6>
  );
};
export default H6;
