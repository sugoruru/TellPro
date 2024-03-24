import { ChangeEvent } from "react";

interface HandleUserNameChange {
  isUserNameError: boolean;
  userNameErrorMessage: string;
}

export const handleUserNameChange = (e: ChangeEvent<HTMLInputElement>): HandleUserNameChange => {
  if (e.target.value.length > 20 || e.target.value.length < 1) {
    return { isUserNameError: true, userNameErrorMessage: "ユーザー名は1文字以上20文字以下で入力してください" };
  } else {
    return { isUserNameError: false, userNameErrorMessage: "" };
  }
};
