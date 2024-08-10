const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const request = require("request");

const app = express();
const PORT = process.env.PORT || 3002;
const private_key = fs.readFileSync("../private_key.txt", "utf8");

// POSTリクエストのbodyを解析するためのミドルウェア
app.use(express.json({ limit: "10mb" }));

// エンドポイント.
app.post("/getTitle", async (req, res) => {
  if (!req.body.jwtToken) {
    return res.status(500).send("不適切なリクエスト");
  }
  const jwtToken = req.body.jwtToken;
  let problems = [];
  try {
    jwt.verify(jwtToken, private_key, function (err, decoded) {
      if (err) {
        throw err;
      }
      problems = decoded.problems;
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("不適切なToken");
  }

  const sites = ["AtCoder", "Codeforces", "yukicoder", "AOJ", "MojaCoder"];
  if (
    !problems.every((problem) => {
      return problem[1].site && sites.includes(problem[1].site);
    })
  ) {
    return res.status(500).send("不適切なproblems");
  }

  const getProblemTitle = async () => {
    const res_prob = new Map();
    const requests = problems.map((problemPair, i) => {
      const problem = problemPair[1];
      if (!problem.isInputValid || problem.value === "") {
        res_prob.set(problemPair[0], { title: "Invalid Input", err: true });
        return Promise.resolve();
      }
      let url = "";
      if (problem.site === "AtCoder") {
        url = `https://atcoder.jp/contests/${problem.value}`;
      } else if (problem.site === "Codeforces") {
        url = `https://codeforces.com/contest/${problem.value}`;
      } else if (problem.site === "yukicoder") {
        url = `https://yukicoder.me/problems/no/${problem.value}`;
      } else if (problem.site === "AOJ") {
        url = `https://judgeapi.u-aizu.ac.jp/problems/ids/${problem.value}`;
      } else if (problem.site === "MojaCoder") {
        url = `https://mojacoder.app/users/${problem.value}`;
      }
      if (url === "") {
        res_prob.set(problemPair[0], { title: "Invalid Site", err: true });
        return Promise.resolve();
      } else {
        return new Promise((resolve, reject) => {
          request.get(url, (err, _res, body) => {
            let title = "";
            let isError = false;
            if (err) {
              title = "Invalid Site";
            } else {
              if (problem.site === "AtCoder") {
                title = body.match(/<title>(.*?)<\/title>/);
                if (title === null) {
                  title = "Invalid Site";
                  isError = true;
                } else {
                  title = title[1];
                  if (title === "404 Not Found - AtCoder") {
                    title = "Invalid Site";
                    isError = true;
                  }
                }
              } else if (problem.site === "Codeforces") {
                title = body.match(/<div class="title">(.*?)<\/div>/);
                if (title === null) {
                  title = "Invalid Site";
                  isError = true;
                } else {
                  title = title[1];
                  if (problem.value.slice(-1) !== title[0]) {
                    title = "Invalid Site";
                    isError = true;
                  }
                }
              } else if (problem.site === "yukicoder") {
                title = body.match(/<title>(.*?)<\/title>/);
                if (title === null) {
                  title = "Invalid Site";
                  isError = true;
                } else {
                  title = title[1];
                  title = title.trim();
                  title = title.slice(0, -12);
                  if (title === "問題一覧") {
                    title = "Invalid Site";
                    isError = true;
                  }
                }
              } else if (problem.site === "AOJ") {
                const json = JSON.parse(body)["problems"];
                if (json.length === 0) {
                  title = "Invalid Site";
                  isError = true;
                } else {
                  title = json[0]["name"];
                }
              } else if (problem.site === "MojaCoder") {
                title = body.match(/<title>(.*?)<\/title>/);
                if (title === null) {
                  title = "Invalid Site";
                  isError = true;
                } else {
                  title = title[1];
                  title = title.slice(0, -12);
                  if (title === "ページが存在しません") {
                    title = "Invalid Site";
                    isError = true;
                  }
                }
              }
            }
            res_prob.set(problemPair[0], { title: title, err: isError });
            // 1秒待ってからresolve
            setTimeout(resolve, 1000);
          });
        });
      }
    });
    await Promise.all(requests);
    return res_prob;
  };

  const res_prob = await getProblemTitle();
  res.status(200).send({ status: "success", problems: Array.from(res_prob.entries()) });
});

// サーバーを起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
