import returnRandomString from "@/modules/algo/returnRandomString";

const H5 = (props: { text: JSX.Element }) => {
  return (
    <h4 className="text-base font-bold dark:text-white text-gray-900" style={{ fontSize: "120%" }} key={returnRandomString(64)}>
      {props.text}
    </h4>
  );
};
export default H5;
