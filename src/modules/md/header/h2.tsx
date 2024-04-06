import returnRandomString from "@/modules/algo/returnRandomString";

const H2 = (props: { text: JSX.Element }) => {
  return (
    <h2 className="text-2xl font-bold dark:text-white text-gray-900" style={{ fontSize: "150%" }} key={returnRandomString(64)}>
      {props.text}
    </h2>
  );
};
export default H2;
