// @ts-ignore
import digestHeader from "digest-header";

interface DigestRequestArgs { url: string, method:"GET" | "POST", username : string, password: string }

export const DigestRequest = async ({ url, method, username, password }:DigestRequestArgs) => {
  try {
    const urlObj = new URL(url);
    const uri = urlObj.pathname + urlObj.search;

    console.log("Datos para DigestRequest:", { url, method, username, password , uri })

    const userpass = `${username}:${password}`;
    const firstRequest = await fetch(url, { method });

    const www_authenticate = firstRequest.headers.get("WWW-Authenticate");
    if (!www_authenticate) {
      throw new Error(
        "La primera solicitud no incluyó el encabezado 'WWW-Authenticate'."
      );
    }

    const header2 = digestHeader(method, uri, www_authenticate, userpass);
    const finalRequest = await fetch(url, {
      method,
      headers: {
        Authorization: header2,
      },
    });

    // console.log(`Final request:${finalRequest.status} ${finalRequest.statusText} `)

    if (!finalRequest.ok) {
      throw new Error(`Error en la segunda solicitud: ${finalRequest.status} ${finalRequest.statusText}`);
    }


    return finalRequest;
  } catch (err) {
    if(err instanceof Error){
      console.error(`Error: ${err.message}`);
    }
    throw err; 
  }
};
