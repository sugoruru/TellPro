import { ChangeEvent } from "react";

interface HandleUserNameChange {
  isUserNameError: boolean;
  userNameErrorMessage: string;
}

export const handleUserNameChange = (e: ChangeEvent<HTMLInputElement>): HandleUserNameChange => {
  if (e.target.value.length > 20 || e.target.value.length < 1) {
    return { isUserNameError: true, userNameErrorMessage: "ユーザー名は1文字以上20文字以下で入力してください" };
  } else if (!/^[a-zA-Z0-9-\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/.test(e.target.value)) {
    return { isUserNameError: true, userNameErrorMessage: "ユーザー名は大英文字、小英文字、数字、ハイフン、ひらがな、カタカナ、漢字のみ入力してください" };
  } else {
    return { isUserNameError: false, userNameErrorMessage: "" };
  }
};
