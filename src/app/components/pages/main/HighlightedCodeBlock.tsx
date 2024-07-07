import { highlight, languages } from "prismjs";
import "@/css/prism-material-dark.css";
import "prismjs/components/prism-python";
import "prismjs/components/prism-c";
import "prismjs/components/prism-java";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-nim";
import "prismjs/components/prism-go";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-perl";
import "prismjs/components/prism-bash";
import returnRandomString from "@/modules/algo/returnRandomString";
import { useState } from "react";
import { FaRegCopy } from "react-icons/fa6";

const HighlightedCodeBlock = ({ code, lang }: { code: string; lang: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  if (lang === "c++") {
    lang = "cpp";
  }
  const highlightedCode = highlight(code, languages[lang] === undefined ? languages["text"] : languages[lang], lang);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseOut={() => {
        setIsHovered(false);
        setIsCopied(false);
      }}
    >
      <pre
        style={{
          backgroundColor: "#2f2f2f",
          color: "white",
          padding: "8px 16px",
          margin: "5px",
          whiteSpace: "pre-wrap",
          overflowX: "scroll",
        }}
        className="codeBlockScrollBar"
        key={returnRandomString(64)}
      >
        <code style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: highlightedCode }} key={returnRandomString(64)} />
      </pre>
      {isHovered && (
        <FaRegCopy
          className="text-xl absolute top-0 m-2 right-2 text-white cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setIsCopied(true);
            setTimeout(() => {
              setIsCopied(false);
            }, 3000);
          }}
          title="Copy to clipboard"
        />
      )}
      {isCopied && <div className="absolute top-[-48px] right-0 m-2 bg-green-600 text-white p-2 rounded-lg">Copied!</div>}
    </div>
  );
};
export default HighlightedCodeBlock;
