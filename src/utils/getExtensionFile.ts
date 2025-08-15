export function getExtesionFile(fileName: string) {
  const partesNombre = fileName.split('.');
  return partesNombre[partesNombre.length - 1];
}
