const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3001;
const private_key = fs.readFileSync("../private_key.txt", "utf8");

// 画像がアップロードされるディレクトリ
const uploadDir = path.join(__dirname, "uploads");

// POSTリクエストのbodyを解析するためのミドルウェア
app.use(express.json({ limit: "10mb" }));

// 画像をアップロードするエンドポイント
app.post("/upload", (req, res) => {
  if (!req.body.image || !req.body.jwtToken) {
    res.status(500).send("不適切なリクエスト");
  }
  const base64Data = req.body.image;
  const jwtToken = req.body.jwtToken;
  let name = "";
  try {
    jwt.verify(jwtToken, private_key, function (err, decoded) {
      name = decoded.name;
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("不適切なToken");
  }
  const imageData = Buffer.from(base64Data, "base64");
  const filename = name + ".png";
  if (fs.existsSync(path.join(__dirname, `images/${filename}`))) {
    res.status(500).send("存在するパス");
  }

  // base64データをファイルに保存
  try {
    fs.writeFileSync(path.join(uploadDir, filename), imageData);
    res.send(`/images/${filename}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("画像の保存に失敗しました");
  }
});

// 公開される画像のディレクトリを指定
app.use("/images", express.static(path.join(__dirname, "uploads")));

// サーバーを起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
