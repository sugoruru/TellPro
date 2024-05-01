import returnRandomString from "../algo/returnRandomString";
import sanitize from "sanitize-html";
import H1 from "./header/h1";
import H2 from "./header/h2";
import H3 from "./header/h3";
import H4 from "./header/h4";
import H5 from "./header/h5";
import H6 from "./header/h6";
import YouTube from "react-youtube";
import HighlightedCodeBlock from "@/app/components/HighlightedCodeBlock";
import Image from "next/image";
const head: string[] = ["#", "##", "###", "####", "#####", "######", "-[]", "-[x]"];

const Lex = (props: { text: string }) => {
  const { text } = props;
  const list = text.split("\n");
  const result: JSX.Element[] = [];
  let isCodeBlock = false;
  let codes: string[] = [];
  let lang: string = "";
  for (const elem of list) {
    // 1つめのスペースで切り分ける(header textという構文).
    const [header, ...text] = elem.split(" ");
    if (header.slice(0, 3) === "```") {
      // コードブロックの場合.
      isCodeBlock = !isCodeBlock;
      if (isCodeBlock) {
        codes = [];
        lang = header.slice(3, header.length);
      } else {
        result.push(<HighlightedCodeBlock code={codes.join("\n")} lang={lang} key={returnRandomString(64)} />);
      }
      continue;
    }
    if (isCodeBlock) {
      codes.push(elem);
      continue;
    }
    if (text.length === 0 || !head.includes(header)) {
      if (header.length === header.split("").filter((char) => char === "-").length && header.length >= 3) {
        // ---という横切り線の場合.
        result.push(<hr key={returnRandomString(32)} />);
      } else if (/!\[.*\]\((.*)\).*/g.test(elem)) {
        // 画像の場合.
        const alt = elem.match(/!\[.*\]/g)![0].slice(2, -1);
        const src = elem.match(/\(.*\)/g)![0].slice(1, -1);
        const text = elem.replace(/!\[.*\]\(.*\)/g, "");
        // TODO:(DEV) 画像サイズを指定するMDを追加する.
        result.push(
          <div className="block" key={returnRandomString(64)}>
            <Image src={src} alt={alt} width={150} height={150} priority />
            <span style={{ marginTop: "auto", wordBreak: "break-all" }}>{Text(text)}</span>
          </div>
        );
      } else if (/\\\[.*\]\((.*)\).*/g.test(elem)) {
        // 別タブリンクの場合.
        const text = elem.match(/\[.*\]/g)![0].slice(1, -1);
        const href = elem.match(/\(.*\)/g)![0].slice(1, -1);
        result.push(
          <a href={href} key={returnRandomString(64)} className="myLink" target="_blank">
            {Text(text)}
          </a>
        );
      } else if (/@\[youtube\]\((.*)\).*/g.test(elem)) {
        // メンションの場合.
        const href = elem.match(/\(.*\)/g)![0].slice(1, -1);
        const videoID = href.split("v=")[1];
        result.push(<YouTube videoId={videoID} className="youtube-iframe" key={returnRandomString(64)} />);
      } else if (/\[.*\]\((.*)\).*/g.test(elem)) {
        // リンクの場合.
        const text = elem.match(/\[.*\]/g)![0].slice(1, -1);
        const href = elem.match(/\(.*\)/g)![0].slice(1, -1);
        result.push(
          <a href={href} key={returnRandomString(64)} className="myLink">
            {Text(text)}
          </a>
        );
      } else {
        // 通常のテキストの場合.
        result.push(Text(elem));
      }
      continue;
    }

    // ヘッダーの場合.
    if (head.includes(header)) {
      if (header === "#") {
        result.push(<H1 text={Text(text.join(" "))} key={returnRandomString(64)} />);
      } else if (header === "##") {
        result.push(<H2 text={Text(text.join(" "))} key={returnRandomString(64)} />);
      } else if (header === "###") {
        result.push(<H3 text={Text(text.join(" "))} key={returnRandomString(64)} />);
      } else if (header === "####") {
        result.push(<H4 text={Text(text.join(" "))} key={returnRandomString(64)} />);
      } else if (header === "#####") {
        result.push(<H5 text={Text(text.join(" "))} key={returnRandomString(64)} />);
      } else if (header === "######") {
        result.push(<H6 text={Text(text.join(" "))} key={returnRandomString(64)} />);
      }
    }
  }
  return <>{result}</>;
};

const Text = (text: string): JSX.Element => {
  // 関数を定義して、マークダウンのパターンに応じた置換を行う
  const decorateText = (input: string): JSX.Element => {
    let output: string = input;
    output = output.replace(/\*\*([^*]+?)\*\*/g, "<b>$1</b>"); // bold
    output = output.replace(/\~([^*]+?)\~/g, "<s>$1</s>"); // strike
    output = output.replace(/\*([^*]+?)\*/g, "<i>$1</i>"); // italic
    output = output.replace(/\`([^*]+?)\`/g, "<inline>$1</inline>"); // inline
    return <div className="" dangerouslySetInnerHTML={{ __html: sanitize(output, { allowedTags: ["inline", "i", "b", "s", "dl", "dd", "dt", "pre", "code"] }) }} key={returnRandomString(64)} />;
  };

  return decorateText(text);
};

export default Lex;
