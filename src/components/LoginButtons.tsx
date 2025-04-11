import React from "react";
import { loginAnonymously, loginWithGoogle, logout } from "../lib/firebase";
import { auth } from "../lib/firebase";

const LoginButtons = () => {
  const user = auth.currentUser;

  return (
    <div>
      {user ? (
        <>
          <p>
            ログイン中：{user.isAnonymous ? "匿名ユーザー" : user.displayName}
          </p>
          <button onClick={logout}>ログアウト</button>
        </>
      ) : (
        <>
          <button onClick={loginAnonymously}>匿名でログイン</button>
          <button onClick={loginWithGoogle}>Googleでログイン</button>
        </>
      )}
    </div>
  );
};

export default LoginButtons;
