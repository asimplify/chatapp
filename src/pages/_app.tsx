import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "@/components/ui/provider";
import { Montserrat } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import Head from "next/head";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
        <title>Chat App</title>
        <meta name="description" content="Chat App" />
      </Head>
      <Provider>
        <main className={`${montserrat.variable}`}>
          <Toaster />
          <Component {...pageProps} />
        </main>
      </Provider>
    </>
  );
}
