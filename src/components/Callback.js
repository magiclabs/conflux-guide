import React, { useEffect } from "react";
import { useHistory } from "react-router";
import { magic } from "../magic";
import Loading from "./Loading";

export default function Callback() {
  const history = useHistory();

  useEffect(() => {
    // On mount, log user info from the social provider and redirect home
    magic.oauth.getRedirectResult().then(oauthUser => {
      console.log(oauthUser);
      history.push("/");
    });
  }, []);

  return <Loading />;
}

