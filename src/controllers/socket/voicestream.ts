// import path from "path";
// import { Server, Socket } from "socket.io";
// import fs from 'fs'
// import { PassThrough } from "stream";
// import ffmpeg from 'fluent-ffmpeg';
// // import http from 'http'
// export const voiceStreamSocket = async (io: Server, socket: Socket) => {

//   const nspStream = socket.nsp;
//   const [, , ctrl_id, ip] = nspStream.name.split("/"); // Namespace : "/voice_stream/:ctrl_id/:ip"

//   console.log("Llego peticion voice_stream", ctrl_id, ip);

//   const fileName = `audio-${Date.now()}.mp3`;
//   const filePath = path.join(__dirname, fileName);
//   const writeStream = fs.createWriteStream(filePath);

//   // const serverUrl = 'http://192.168.1.108/cgi-bin/audio.cgi?action=postAudio&httptype=singlepart&channel=1';
//   // const options = {
//   //   method: 'POST',
//   //   headers: {
//   //     'Content-Type': 'Audio/G.711A'
//   //   }
//   // };

//   // const req = http.request(serverUrl, options, (res) => {
//   //   console.log(`Estado de respuesta: ${res.statusCode}`);

//   //   res.on('data', (chunk) => {
//   //     console.log(`Cuerpo: ${chunk}`);
//   //   });

//   //   res.on('end', () => {
//   //     console.log('Sin más datos en la respuesta.');
//   //   });
//   // });

//   // Crear PassThrough streams
//   const inputStream = new PassThrough();
//   const transformedStream = new PassThrough();

//   // Configurar FFmpeg para procesar datos del inputStream
//   const ffmpegProcess = ffmpeg()
//     .input(inputStream)
//     .inputFormat("webm") // Formato de entrada Opus en WebM
//     .audioCodec("libmp3lame") // Codec de salida MP3
//     .format("mp3") // Formato de salida
//     .pipe(transformedStream, { end: false }) // No cerrar el stream de salida automáticamente
//     .on("end", () => {
//       console.log("Transformación finalizada");
//     })
//     .on("error", (err) => {
//       console.error("Error durante la transformación:", err);
//     });

//   transformedStream.on("data", (chunk: Buffer) => {
//     // req.write(chunk);
//     writeStream.write(chunk);
//   });

//   transformedStream.on("end", () => {
//     writeStream.end();
//   });

//   socket.on("audioStream", (data: ArrayBuffer) => {

//     console.log("Received buffer of size:", data.byteLength);
//     const buffer = Buffer.from(data);

//     // Escribir el buffer en el inputStream
//     inputStream.write(buffer);
//   });

//   socket.on("disconnect", () => {
//     console.log("Cliente desconectado voice_stream");
//     inputStream.end();
//     transformedStream.end();
//     // ffmpegProcess.destroy()
//     // req.end();
//   });

// };

// // // @ts-ignore
// // import digestHeader from "digest-header";

// // interface DigestRequestArgs { url: string, method:"GET" | "POST", username : string, password: string }

// // export const DigestRequest = async ({ url, method, username, password }:DigestRequestArgs) => {
// //   try {
// //     const urlObj = new URL(url);
// //     const uri = urlObj.pathname + urlObj.search;

// //     console.log("Datos para DigestRequest:", { url, method, username, password , uri })

// //     const userpass = `${username}:${password}`;
// //     const firstRequest = await fetch(url, { method });

// //     const www_authenticate = firstRequest.headers.get("WWW-Authenticate");
// //     if (!www_authenticate) {
// //       throw new Error(
// //         "La primera solicitud no incluyó el encabezado 'WWW-Authenticate'."
// //       );
// //     }

// //     const header2 = digestHeader(method, uri, www_authenticate, userpass);
// //     const finalRequest = await fetch(url, {
// //       method,
// //       headers: {
// //         Authorization: header2,
// //       },
// //     });

// //     // console.log(`Final request:${finalRequest.status} ${finalRequest.statusText} `)

// //     if (!finalRequest.ok) {
// //       throw new Error(`Error en la segunda solicitud: ${finalRequest.status} ${finalRequest.statusText}`);
// //     }

// //     return finalRequest;
// //   } catch (err) {
// //     if(err instanceof Error){
// //       console.error(`Error: ${err.message}`);
// //     }
// //     throw err;
// //   }
// // };
