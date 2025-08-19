export function verifyImageMarkers(buffer: Buffer, mark: 'start' | 'end' | 'complete'): boolean {
  // Marcador de inicio de imagen (SOI)
  const SOI = Buffer.from([0xff, 0xd8]);
  // Marcador de final de imagen (EOI)
  const EOI = Buffer.from([0xff, 0xd9]);

  // Verificar la presencia de SOI y EOI en el buffer
  const hasSOI = buffer.indexOf(SOI) === 0;
  const hasEOI = buffer.indexOf(EOI) !== -1;

  if (mark === 'start') {
    return hasSOI;
  }

  if (mark === 'end') {
    return hasEOI;
  }

  return hasSOI && hasEOI;
}
