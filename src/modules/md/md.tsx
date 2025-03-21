import HighlightedCodeBlock from "@/app/components/pages/main/HighlightedCodeBlock";
import returnRandomString from "@/modules/algo/returnRandomString";
import { MdCheckCircleOutline, MdInfoOutline, MdOutlineDangerous, MdOutlineWarningAmber } from "react-icons/md";
import { InlineMath } from "react-katex";
import YouTube from "react-youtube";
import sanitize from "sanitize-html";
import validateColor from "validate-color";
import validator from "validator";

type TokenType =
  | "Break"
  | "Heading"
  | "Indent"
  | "List"
  | "HorizontalLine"
  | "Image"
  | "Media"
  | "CodeBlock"
  | "AlertBox"
  | "InlineMath"
  | "Link"
  | "BlankTargetLink"
  | "ColorText"
  | "CollapsibleSection"
  | "Text";

interface Token {
  type: TokenType;
  content: string;
  level?: number; // 見出しやインデントのレベル
  options?: Record<string, string>; // 画像のオプションなど
  children?: Token[];
}

function escapeHtml(str: string): string {
  return str.replace(/[<>&"'`]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      case "`":
        return "&#96;";
      default:
        return char;
    }
  });
}

const sanitizeOptions = {
  allowedTags: ["inline", "i", "b", "s", "color", "link", "blankTargetLink", "span", "a"],
  allowedAttributes: {
    color: ["color"],
    span: ["style"],
    a: ["href", "class", "target"],
  },
};

const decorateText = (input: string): string => {
  let output: string = input;
  // すべてのspanタグ、aタグは使用不可.
  output = output.replace(/<span(.*?)>/g, "");
  output = output.replace(/<\/span>/g, "");
  output = output.replace(/<a(.*?)>/g, "");
  output = output.replace(/<\/a>/g, "");

  for (let i = 0; i < 10; i++) {
    output = output.replace(/\*\*([^*]+?)\*\*/g, "<b>$1</b>"); // bold
    output = output.replace(/\*([^*]+?)\*/g, "<i>$1</i>"); // italic
    output = output.replace(/\~([^*]+?)\~/g, "<s>$1</s>"); // strike
    output = output.replace(/\`([^*]+?)\`/g, "<inline>$1</inline>"); // inline
    output = output.replace(/\%\[([^%]+?)\]\{([^%]+?)\}/g, "<color color='$2'>$1</color>"); // color
    output = output.replace(/\\\[(.*?)]{(.*?)}/g, "<blankTargetLink href='$2'>$1</blankTargetLink>"); // blank target link
    output = output.replace(/\[(.*?)]{(.*?)}/g, "<link href='$2'>$1</link>");
  }
  // colorタグのすべてをバリデーション.
  const reg = /<color color='(.*?)'>(.*?)<\/color>/g;
  let match;
  while ((match = reg.exec(output)) !== null) {
    if (!validateColor(match[1])) {
      output = output.replace(match[0], match[2]);
    } else {
      // pタグのstyleに置き換える
      output = output.replace(match[0], `<span style='color:${match[1]}'>${match[2]}</span>`);
    }
  }
  // linkタグのすべてをバリデーション.
  const reg2 = /<link href='(.*?)'>(.*?)<\/link>/g;
  let match2;
  while ((match2 = reg2.exec(output)) !== null) {
    if (!isGoodURL(match2[1])) {
      output = output.replace(match2[0], match2[2]);
    } else {
      output = output.replace(match2[0], `<a href='${match2[1]}' class='myLink'>${match2[2]}</a>`);
    }
  }
  // blankTargetLinkタグのすべてをバリデーション.
  const reg3 = /<blankTargetLink href='(.*?)'>(.*?)<\/blankTargetLink>/g;
  let match3;
  while ((match3 = reg3.exec(output)) !== null) {
    if (!isGoodURL(match3[1])) {
      output = output.replace(match3[0], match3[2]);
    } else {
      output = output.replace(match3[0], `<a href='${match3[1]}' class='myLink' target='_blank'>${match3[2]}</a>`);
    }
  }
  return output;
};

function lex(input: string): Token[] {
  const tokens: Token[] = [];
  let current = 0;
  input += "\n";

  while (current < input.length) {
    let char = input[current];
    if (char === "\n") {
      current++;
      tokens.push({ type: "Break", content: "" });
      continue;
    }

    // Collapsible Section (e.g., [)
    if (char === "[" && input[current + 1] === "\n") {
      let content = "";
      let deep = 1;
      current += 2; // Skip [
      while (current < input.length && deep > 0) {
        let c = input[current++];
        if (c === "[" && input[current] === "\n") {
          deep++;
          current++;
        } else if (c === "]" && input[current] === "\n") {
          deep--;
          current += 1;
        } else {
          content += c;
        }
      }
      tokens.push({ type: "CollapsibleSection", content });
      continue;
    }

    // Link (e.g., [text]{url})
    if (char === "[" && input.indexOf("]{", current + 1) !== -1) {
      let text = "";
      let tempText = "";
      let tempCurrent = current;
      // \nが来るまでの文字列を取得
      while (input[tempCurrent] !== "\n" && tempCurrent < input.length) {
        tempText += input[tempCurrent++];
      }
      // 正規表現で、[text]{url}の形式かどうかを判定
      const reg = /\[(.*?)\]{(.*?)}/;
      if (!reg.test(tempText)) {
        tokens.push({ type: "Text", content: char });
        current++;
        continue;
      }

      current++; // Skip [
      while (input[current] !== "]" && current < input.length) {
        text += input[current++];
      }
      current += 2; // Skip ]{
      let url = "";
      while (input[current] !== "}" && current < input.length) {
        url += input[current++];
      }
      text = decorateText(text);
      tokens.push({ type: "Text", content: `[${text}]{${url}}` });
      current++; // Skip }
      continue;
    }

    // Blank Target Link (e.g., \[text]{url}).
    if (char === "\\" && input[current + 1] === "[" && input.indexOf("]{", current + 2) !== -1) {
      let text = "";
      let tempText = "";
      let tempCurrent = current;
      while (input[tempCurrent] !== "\n" && tempCurrent < input.length) {
        tempText += input[tempCurrent++];
      }
      const reg = /\[(.*?)\]{(.*?)}/;
      if (!reg.test(tempText)) {
        tokens.push({ type: "Text", content: char });
        current++;
        continue;
      }

      current += 2; // Skip \[
      while (input[current] !== "]" && current < input.length) {
        text += input[current++];
      }
      current += 2; // Skip ]{
      let url = "";
      while (input[current] !== "}" && current < input.length) {
        url += input[current++];
      }
      text = decorateText(text);
      tokens.push({ type: "Text", content: `\\[${text}]{${url}}` });
      current++; // Skip }
      continue;
    }

    if (char === "\\") {
      current++;
      if (input.length <= current) {
        tokens.push({ type: "Text", content: char });
        continue;
      } else {
        tokens.push({ type: "Text", content: escapeHtml(input[current]) });
        current++;
        continue;
      }
    }

    // Heading (e.g., #, ##, ###, etc.)
    if (char === "#") {
      let level = 0;
      while (char === "#" && current < input.length) {
        level++;
        char = input[++current];
      }
      if (input[current] === " ") {
        let value = "";
        current++; // Skip the space after the heading
        while (current < input.length && input[current] !== "\n") {
          value += input[current++];
        }
        current++;
        value = decorateText(value);
        tokens.push({ type: "Heading", content: value, level });
        continue;
      } else {
        tokens.push({ type: "Text", content: "#" });
        continue;
      }
    }

    // Indent (e.g., ~).
    if (char === "~") {
      let level = 0;
      while (char === "~" && current < input.length) {
        level++;
        char = input[++current];
      }
      if (input[current] === " ") {
        let value = "";
        current++; // Skip the space after the indent
        let subTokens: Token[] = [];
        while (current < input.length && input[current] !== "\n") {
          if (input[current] === "$" && input[current + 1] === "$") {
            current += 2;
            let math = "";
            while (current < input.length && !(input[current] === "$" && input[current + 1] === "$")) {
              math += input[current++];
            }
            subTokens.push({ type: "InlineMath", content: math.trim(), level });
            current += 2;
          }
          if (input[current] === "\n") {
            break;
          }
          value += input[current++];
        }
        value = decorateText(value);
        subTokens.push({ type: "Text", content: value, level });
        current++; // Skip the newline after the indent
        tokens.push({ type: "Indent", content: "", level, children: subTokens });
        continue;
      } else {
        tokens.push({ type: "Text", content: "~" });
        continue;
      }
    }

    // List (e.g., -)
    if (char === "-") {
      let level = 0;
      while (char === "-" && current < input.length) {
        level++;
        char = input[++current];
      }
      if (input[current] === " ") {
        let value = "";
        current++; // Skip the space after the list marker
        let math = false;
        let subTokens: Token[] = [];
        while (current < input.length && input[current] !== "\n") {
          if (input[current] === "$" && input[current + 1] === "$") {
            current += 2;
            if (math) {
              subTokens.push({ type: "InlineMath", content: value, level });
            } else {
              value = decorateText(value);
              subTokens.push({ type: "Text", content: value, level });
            }
            math = !math;
            value = "";
          }
          if (input[current] === "\n") {
            break;
          }
          value += input[current++];
        }
        value = decorateText(value);
        subTokens.push({ type: "Text", content: value, level });
        current++; // Skip the newline after the list
        tokens.push({ type: "List", content: "", level, children: subTokens });
        continue;
      } else if (input[current] === "\n") {
        tokens.push({ type: "HorizontalLine", content: "" });
        continue;
      }
    }

    // Image (e.g., ![alt]{src|A=B|C=D|...})...
    if (char === "!" && input[current + 1] === "[" && input.indexOf("]{", current + 2) !== -1) {
      let alt = "";
      current += 2; // Skip ![
      while (input[current] !== "]" && current < input.length) {
        alt += input[current++];
      }
      current += 2; // Skip ]{
      let src = "";
      while (input[current] !== "}" && input[current] !== "|" && current < input.length) {
        src += input[current++];
      }
      let options: Record<string, string> = {};
      while (input[current] === "|" && current < input.length) {
        let key = "";
        let value = "";
        current++; // Skip |
        while (input[current] !== "=" && current < input.length) {
          key += input[current++];
        }
        current++; // Skip =
        while (input[current] !== "|" && input[current] !== "}" && current < input.length) {
          value += input[current++];
        }
        options[key.trim()] = value;
      }
      tokens.push({ type: "Image", content: alt, options: { src, ...options } });
      current++; // Skip }
      continue;
    }

    // Media (e.g., @[media name]{src})
    if (char === "@") {
      if (input[current + 1] === "[" && input.indexOf("]{", current + 2) !== -1) {
        let media = "";
        current += 2; // Skip @[
        while (input[current] !== "]" && current < input.length) {
          media += input[current++];
        }
        current += 2; // Skip ]{
        let src = "";
        while (input[current] !== "}" && current < input.length) {
          src += input[current++];
        }
        tokens.push({ type: "Media", content: src, options: { media } });
        current++; // Skip }
        continue;
      }
    }

    // Code Block (e.g., ```lang txt```)
    if (char === "`" && input[current + 1] === "`" && input[current + 2] === "`") {
      current += 3; // Skip ```
      let lang = "";
      while (current < input.length && input[current] !== "\n") {
        lang += input[current++];
      }
      current++; // Skip the newline after language
      let code = "";
      while (current < input.length && !(input[current] === "`" && input[current + 1] === "`" && input[current + 2] === "`")) {
        code += input[current++];
      }
      tokens.push({ type: "CodeBlock", content: code.trim(), options: { lang } });
      current += 3; // Skip ```
      continue;
    }

    // Alert Box (e.g., :::type)
    if (char === ":" && input[current + 1] === ":" && input[current + 2] === ":") {
      current += 3; // Skip :::
      let type = "";
      while (current < input.length && input[current] !== "\n") {
        type += input[current++];
      }
      let content = "";
      while (current < input.length && !(input[current] === ":" && input[current + 1] === ":" && input[current + 2] === ":")) {
        content += input[current++];
      }
      content = decorateText(content.trim());
      tokens.push({ type: "AlertBox", content: content, options: { type } });
      current += 3; // Skip :::
      continue;
    }

    // Inline Math (e.g., $$Math$$)
    if (char === "$" && input[current + 1] === "$") {
      current += 2; // Skip $$
      let math = "";
      while (current < input.length && !(input[current] === "$" && input[current + 1] === "$")) {
        math += input[current++];
      }
      tokens.push({ type: "InlineMath", content: math.trim() });
      current += 2; // Skip $$
      continue;
    }

    // Color Text (e.g., %[text]{color})
    if (char === "%" && input[current + 1] === "[" && input.indexOf("]{", current + 2) !== -1) {
      let text = "";
      current += 2; // Skip %[
      while (input[current] !== "]" && current < input.length) {
        text += input[current++];
      }
      current += 2; // Skip ]{
      let color = "";
      while (input[current] !== "}" && current < input.length) {
        color += input[current++];
      }
      text = decorateText(text);
      tokens.push({ type: "Text", content: `%[${text}]{${color}}` });
      current++; // Skip }
      continue;
    }

    // normal char
    tokens.push({ type: "Text", content: char });
    current++;
  }
  return tokens;
}

function isGoodURL(str: string): boolean {
  return validator.isURL(str);
}

// 続いているTextトークンを結合する
function joinTextTokens(tokens: Token[]): Token[] {
  const newTokens: Token[] = [];
  let current = 0;
  while (current < tokens.length) {
    let token = tokens[current];
    if (token.type === "Text") {
      let content = token.content;
      while (current + 1 < tokens.length && tokens[current + 1].type === "Text") {
        content += tokens[++current].content;
      }
      content = decorateText(content);
      newTokens.push({ type: "Text", content });
    } else {
      newTokens.push(token);
    }
    current++;
  }
  // breakが連続している場合は1つにまとめる
  const finalTokens: Token[] = [];
  for (let i = 0; i < newTokens.length; i++) {
    if (newTokens[i].type === "Break") {
      finalTokens.push(newTokens[i]);
      while (i + 1 < newTokens.length && newTokens[i + 1].type === "Break") {
        i++;
      }
    } else {
      finalTokens.push(newTokens[i]);
    }
  }
  return finalTokens;
}

const Lex = (input: string | Token[], isString = true): React.JSX.Element => {
  let tokens: Token[] = [];
  if (isString && typeof input === "string") {
    tokens = joinTextTokens(lex(input));
  } else {
    tokens = input as Token[];
  }
  const elements: React.JSX.Element[] = [];
  let cnt = 0;
  for (let token of tokens) {
    cnt += 1;
    switch (token.type) {
      case "Break":
        elements.push(<br key={returnRandomString(64)} />);
        break;
      case "Heading":
        elements.push(
          <p className={`font-bold text-gray-900 mb-1 ${cnt == 1 ? "" : "mt-4"}`} style={{ fontSize: `${160 - ((token.level ?? 0) - 1) * 10}%` }} key={returnRandomString(64)}>
            <span
              className="break-all"
              dangerouslySetInnerHTML={{
                __html: sanitize(token.content, sanitizeOptions),
              }}
            />
          </p>
        );
        break;
      case "Indent":
        elements.push(
          <div style={{ marginLeft: `${(token.level ?? 0) * 20}px` }} key={returnRandomString(64)}>
            {Lex(token.children ?? [])}
          </div>
        );
        break;
      case "List":
        elements.push(
          <li style={{ marginLeft: `${((token.level ?? 0) - 1) * 20}px` }} key={returnRandomString(64)}>
            {Lex(token.children ?? [])}
          </li>
        );
        break;
      case "HorizontalLine":
        elements.push(<hr key={returnRandomString(64)} />);
        break;
      case "Image":
        if (token.options?.src === undefined) break;
        if (token.options?.src === "") break;
        if (token.options?.size !== undefined) {
          elements.push(
            <img
              className="inline"
              src={token.options ? (isGoodURL(token.options.src) ? token.options.src : "") : ""}
              alt={token.content}
              width={Number(token.options.size)}
              key={returnRandomString(64)}
            />
          );
          break;
        }
        elements.push(<img className="inline" src={token.options ? token.options.src : ""} alt={token.content} key={returnRandomString(64)} />);
        break;
      case "Media":
        if (token.options?.media === "youtube") {
          const videoID = token.content.split("v=").pop();
          elements.push(<YouTube videoId={videoID} className="youtube-iframe" key={returnRandomString(64)} />);
        }
        break;
      case "CodeBlock":
        elements.push(<HighlightedCodeBlock code={token.content} lang={token.options?.lang === undefined ? "" : token.options.lang} key={returnRandomString(64)} />);
        break;
      case "AlertBox":
        const alertType = token.options?.type;
        if (alertType === "info") {
          elements.push(
            <div className="flex rounded border-l-4 border-blue-500 text-white p-4" role="alert" style={{ backgroundColor: "#2563eb" }} key={returnRandomString(64)}>
              <MdInfoOutline className="text-xl mr-1" />
              <span
                className="break-all"
                dangerouslySetInnerHTML={{
                  __html: sanitize(token.content, sanitizeOptions),
                }}
              />
            </div>
          );
        } else if (alertType === "warning") {
          elements.push(
            <div className="flex rounded border-l-4 border-yellow-500 text-white p-4" style={{ backgroundColor: "#14b8a6" }} role="alert" key={returnRandomString(64)}>
              <MdCheckCircleOutline className="text-xl mr-1" />
              <span
                className="break-all"
                dangerouslySetInnerHTML={{
                  __html: sanitize(token.content, sanitizeOptions),
                }}
              />
            </div>
          );
        } else if (alertType === "danger") {
          elements.push(
            <div className="flex rounded border-l-4 border-red-500 text-white p-4" style={{ backgroundColor: "#eab308" }} role="alert" key={returnRandomString(64)}>
              <MdOutlineWarningAmber className="text-xl mr-1" />
              <span
                className="break-all"
                dangerouslySetInnerHTML={{
                  __html: sanitize(token.content, sanitizeOptions),
                }}
              />
            </div>
          );
        } else if (alertType === "success") {
          elements.push(
            <div className="flex rounded border-l-4 border-green-500 text-white  p-4" style={{ backgroundColor: "#ef4444" }} role="alert" key={returnRandomString(64)}>
              <MdOutlineDangerous className="text-xl mr-1" />
              <span
                className="break-all"
                dangerouslySetInnerHTML={{
                  __html: sanitize(token.content, sanitizeOptions),
                }}
              />
            </div>
          );
        } else {
          elements.push(
            <div className="flex rounded border-l-4 border-gray-500 text-white p-4" style={{ backgroundColor: "#6b7280" }} role="alert" key={returnRandomString(64)}>
              <span
                className="break-all"
                dangerouslySetInnerHTML={{
                  __html: sanitize(token.content, sanitizeOptions),
                }}
              />
            </div>
          );
        }
        break;
      case "InlineMath":
        elements.push(
          <span key={returnRandomString(64)} className="inline-block" style={{ maxWidth: "100%" }}>
            <InlineMath math={token.content} />
          </span>
        );
        break;
      case "Link":
        elements.push(
          <a href={isGoodURL(String(token.options?.url)) ? token.options?.url : ""} className="break-all myLink" key={returnRandomString(64)}>
            <span
              dangerouslySetInnerHTML={{
                __html: sanitize(token.content, sanitizeOptions),
              }}
            />
          </a>
        );
        break;
      case "BlankTargetLink":
        elements.push(
          <a href={isGoodURL(String(token.options?.url)) ? token.options?.url : ""} target="_blank" className="break-all myLink" key={returnRandomString(64)}>
            <span
              dangerouslySetInnerHTML={{
                __html: sanitize(token.content, sanitizeOptions),
              }}
            />
          </a>
        );
        break;
      case "ColorText":
        elements.push(
          <span
            style={{ color: `${token.options?.color}` }}
            className="break-all"
            dangerouslySetInnerHTML={{
              __html: sanitize(token.content, sanitizeOptions),
            }}
            key={returnRandomString(64)}
          />
        );
        break;
      case "CollapsibleSection":
        elements.push(
          <details key={returnRandomString(64)}>
            <summary>クリックして展開</summary>
            {Lex(token.content)}
          </details>
        );
        break;
      case "Text":
        elements.push(
          <span
            className="break-all"
            dangerouslySetInnerHTML={{
              __html: sanitize(token.content, sanitizeOptions),
            }}
            key={returnRandomString(64)}
          />
        );
        break;
    }
  }
  return <>{elements}</>;
};

export default Lex;
