import { Magic } from 'magic-sdk';
import { ConfluxExtension } from "@magic-ext/conflux";
import { OAuthExtension } from '@magic-ext/oauth';

export const magic = new Magic(process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY, {
    extensions: [
      new ConfluxExtension({
        rpcUrl: "https://test.confluxrpc.com",
        chainId: 1,
      }),
      new OAuthExtension()
    ]
  });