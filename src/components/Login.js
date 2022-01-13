import React, { useCallback, useState, useEffect } from "react";
import { useHistory } from "react-router";
import { magic } from "../magic";
import google from "../google.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const history = useHistory();

  // Redirect a logged in user to the home page
  useEffect(() => {
    magic.user.isLoggedIn().then(magicIsLoggedIn => {
      if (magicIsLoggedIn) {
        history.push("/");    
      }
    });
  }, []);

  /**
   * Perform login action via Magic's passwordless flow. Upon successuful
   * completion of the login flow, a user is redirected to the homepage.
   */
  const loginWithEmail = useCallback(async () => {
    setIsLoggingIn(true);
    try {
      await magic.auth.loginWithMagicLink({ email });
      history.push("/");
    } catch {
      setIsLoggingIn(false);
    }
  }, [email]);

  const loginWithGoogle = async () => {
    await magic.oauth.loginWithRedirect({
      provider: "google",
      redirectURI: `${window.location.origin}/callback`
    });
  }

  return (
    <div className="container">
      <h1>Please sign up or login</h1>
      <input
        type="email"
        name="email"
        required="required"
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoggingIn}
      />
      <button onClick={loginWithEmail} disabled={isLoggingIn}>Send</button>
      <div>or</div>
      <br />
      <img src={google} onClick={loginWithGoogle} style={{ cursor: "pointer" }} />
    </div>
  );
}

