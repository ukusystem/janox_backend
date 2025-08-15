
export function createImageBase64(data: Buffer) : string {
    return "data:image/png;base64," + Buffer.from(data).toString("base64");
}