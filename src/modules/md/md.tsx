import returnRandomString from "../algo/returnRandomString";
import sanitize from "sanitize-html";
import H1 from "./header/h1";
import H2 from "./header/h2";
import H3 from "./header/h3";
import H4 from "./header/h4";
import H5 from "./header/h5";
import H6 from "./header/h6";
import YouTube from "react-youtube";
import HighlightedCodeBlock from "@/app/components/articles/HighlightedCodeBlock";
import Image from "next/image";
import { Fragment } from "react";
import { MdCheckCircleOutline, MdInfoOutline, MdOutlineDangerous, MdOutlineWarningAmber } from "react-icons/md";
import { InlineMath } from "react-katex";
const head: string[] = ["#", "##", "###", "####", "#####", "######"];

const Lex = (props: { text: string }) => {
  const { text } = props;
  const list = text.split("\n");
  const result: JSX.Element[] = [];
  let isCodeBlock = false;
  let isAlert = false;
  let codes: string[] = [];
  let alerts: string[] = [];
  let lang: string = "";
  let alertType: string = "";
  for (const elem of list) {
    // 1つめのスペースで切り分ける(header textという構文).
    const [header, ...text] = elem.split(" ");
    if (header.slice(0, 3) === "```" && !isAlert) {
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
    if (header.slice(0, 3) === ":::" && !isCodeBlock) {
      isAlert = !isAlert;
      if (isAlert) {
        alerts = [];
        alertType = header.slice(3, header.length);
      } else {
        if (alertType === "info") {
          result.push(
            <div className="mt-2 text-sm text-white rounded-lg p-4 flex" role="alert" style={{ backgroundColor: "#2563eb" }} key={returnRandomString(64)}>
              <MdInfoOutline className="text-blue-200 text-xl mr-1" />
              {alerts.join("\n")}
            </div>
          );
        } else if (alertType === "success") {
          result.push(
            <div className="mt-2 text-sm text-white rounded-lg p-4 flex" style={{ backgroundColor: "#14b8a6" }} role="alert" key={returnRandomString(64)}>
              <MdCheckCircleOutline className="text-teal-200 text-xl mr-1" />
              {alerts.join("\n")}
            </div>
          );
        } else if (alertType === "warning") {
          result.push(
            <div className="mt-2 text-sm text-white rounded-lg p-4 flex" style={{ backgroundColor: "#eab308" }} role="alert" key={returnRandomString(64)}>
              <MdOutlineWarningAmber className="text-yellow-200 text-xl mr-1" />
              {alerts.join("\n")}
            </div>
          );
        } else if (alertType === "danger") {
          result.push(
            <div className="mt-2 text-sm text-white rounded-lg p-4 flex" style={{ backgroundColor: "#ef4444" }} role="alert" key={returnRandomString(64)}>
              <MdOutlineDangerous className="text-red-200 text-xl mr-1" />
              {alerts.join("\n")}
            </div>
          );
        } else {
          result.push(
            <div className="mt-2 text-sm text-white rounded-lg p-4 flex" style={{ backgroundColor: "#6b7280" }} role="alert" key={returnRandomString(64)}>
              {alerts.join("\n")}
            </div>
          );
        }
      }
      continue;
    }
    if (isCodeBlock) {
      codes.push(elem);
      continue;
    }
    if (isAlert) {
      alerts.push(elem);
      continue;
    }
    if (elem === "") {
      result.push(<div className="block my-2 content-none" key={returnRandomString(64)} />);
      continue;
    }
    if (text.length === 0 || !head.includes(header)) {
      if (header.length === header.split("").filter((char) => char === "-").length && header.length >= 3) {
        // ---という横切り線の場合.
        result.push(<hr key={returnRandomString(32)} />);
      } else if (/!\[.*\]\{(.*)\}.*/g.test(elem)) {
        // 画像の場合.
        const alt = elem.match(/!\[.*\]/g)![0].slice(2, -1);
        const src = elem
          .match(/\{.*\}/g)![0]
          .slice(1, -1)
          .split(" ")[0];
        const param1 = elem
          .match(/\{.*\}/g)![0]
          .slice(1, -1)
          .split(" ")[1];
        const text = elem.replace(/!\[.*\]\{.*\}/g, "");
        const opt = { size: 150 };
        if (param1 !== undefined) {
          if (param1.startsWith("size=")) {
            const size = param1.split("=")[1];
            opt.size = Number(size);
          }
        }
        result.push(
          <div className="block" key={returnRandomString(64)}>
            <Image src={src} alt={alt} width={opt.size} height={150} priority />
            <span style={{ marginTop: "auto", wordBreak: "break-all" }}>{Text(text)}</span>
          </div>
        );
      } else if (/\\\[.*\]\{(.*)\}.*/g.test(elem)) {
        // 別タブリンクの場合.
        const text = elem.match(/\[.*\]/g)![0].slice(1, -1);
        const href = elem.match(/\{.*\}/g)![0].slice(1, -1);
        const after = elem.replace(/\\\[.*\]\{.*\}/g, "");
        if (href.startsWith("http") || href.startsWith("https") || href.startsWith("mailto")) {
          result.push(
            <Fragment key={returnRandomString(64)}>
              <a href={href} className="myLink" target="_blank">
                {Text(text)}
              </a>
              <span style={{ marginTop: "auto", wordBreak: "break-all" }}>{Text(after)}</span>
              <br />
            </Fragment>
          );
        } else {
          result.push(
            <Fragment key={returnRandomString(64)}>
              <span>{Text(elem)}</span>
              <br />
            </Fragment>
          );
        }
      } else if (/@\[youtube\]\{(.*)\}.*/g.test(elem)) {
        // メンションの場合.
        const href = elem.match(/\{.*\}/g)![0].slice(1, -1);
        const videoID = href.split("v=")[1];
        result.push(<YouTube videoId={videoID} className="youtube-iframe" key={returnRandomString(64)} />);
      } else if (/\%\[.*\]\{(.*)\}.*/g.test(elem)) {
        // 色付きのテキストの場合.
        const color = elem.match(/\%\[.*\]/g)![0].slice(2, -1);
        const text = elem.match(/\{.*\}/g)![0].slice(1, -1);
        const after = elem.replace(/\%\[.*\]\{.*\}/g, "");
        result.push(
          <div key={returnRandomString(64)}>
            <span style={{ color: color }}>{Text(text)}</span>
            {Text(after)}
            <br />
          </div>
        );
      } else if (/\[.*\]\{(.*)\}.*/g.test(elem)) {
        // リンクの場合.
        const text = elem.match(/\[.*\]/g)![0].slice(1, -1);
        const href = elem.match(/\{.*\}/g)![0].slice(1, -1);
        const after = elem.replace(/\[.*\]\{(.*)\}/g, "");
        if (href.startsWith("http") || href.startsWith("https") || href.startsWith("mailto")) {
          result.push(
            <Fragment key={returnRandomString(64)}>
              <a href={href} className="myLink">
                {Text(text)}
              </a>
              <span style={{ marginTop: "auto", wordBreak: "break-all" }}>{Text(after)}</span>
              <br />
            </Fragment>
          );
        } else {
          result.push(
            <Fragment key={returnRandomString(64)}>
              <span>{Text(elem)}</span>
              <br />
            </Fragment>
          );
        }
      } else if (/\$\$.*\$\$/g.test(elem)) {
        // inline数式の場合.
        let text_array = elem.split("$$");
        if (!elem.startsWith("$$")) {
          const text = text_array.shift();
          if (text) {
            result.push(
              <span className="text-base text-gray-800" key={returnRandomString(64)}>
                {Text(text)}
              </span>
            );
          }
        }
        text_array = text_array.filter((elem) => elem !== "");
        // 数式→テキスト→数式→テキスト→数式→...という構造になっている.
        for (let i = 0; i < text_array.length; i++) {
          if (i % 2 === 0) {
            result.push(<InlineMath math={text_array[i]} key={returnRandomString(64)} />);
          } else {
            result.push(
              <span className="text-base text-gray-800" key={returnRandomString(64)}>
                {Text(text_array[i])}
              </span>
            );
          }
        }
        result.push(<br key={returnRandomString(64)} />);
      } else {
        // 通常のテキストの場合.
        result.push(
          <span className="text-base text-gray-800" key={returnRandomString(64)}>
            {Text(elem)}
            <br />
          </span>
        );
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
    output = output.replace(/\*([^*]+?)\*/g, "<i>$1</i>"); // italic
    output = output.replace(/\~([^*]+?)\~/g, "<s>$1</s>"); // strike
    output = output.replace(/\`([^*]+?)\`/g, "<inline>$1</inline>"); // inline
    return <span dangerouslySetInnerHTML={{ __html: sanitize(output, { allowedTags: ["inline", "i", "b", "s", "dl", "dd", "dt", "pre", "code"] }) }} key={returnRandomString(64)} />;
  };

  return decorateText(text);
};

export default Lex;
