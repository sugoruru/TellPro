import { highlight, languages } from "prismjs";
import "../../css/prism-material-dark.css";
import "prismjs/components/prism-python";
import "prismjs/components/prism-c";
import "prismjs/components/prism-java";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";

const HighlightedCodeBlock = ({ code, lang }: { code: string; lang: string }) => {
  const highlightedCode = highlight(code, languages[lang] === undefined ? languages["text"] : languages[lang], lang);
  return (
    <pre data-label="index.html" style={{ backgroundColor: "#2f2f2f", color: "white", padding: "8px 16px", margin: "5px", whiteSpace: "pre-wrap" }}>
      <code style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </pre>
  );
};
export default HighlightedCodeBlock;
