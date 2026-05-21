import "@/styles/globals.css";
import "@/i18n";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/lib/AuthContext";
import Head from "next/head";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Code-Quest</title>
      </Head>
      <AuthProvider>
        <ToastContainer />
        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
}
