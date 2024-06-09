import returnRandomString from "@/modules/algo/returnRandomString";

const H5 = (props: { text: JSX.Element }) => {
  return (
    <h5 className="text-base font-bold dark:text-white text-gray-900" style={{ fontSize: "120%" }} key={returnRandomString(64)}>
      {props.text}
    </h5>
  );
};
export default H5;
