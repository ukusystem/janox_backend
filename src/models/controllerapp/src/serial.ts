import { SerialPort } from 'serialport';

interface ComData {
  path: string;
  name: string;
}

export async function getComs(): Promise<ComData[]> {
  const coms = await SerialPort.list();
  const data: ComData[] = coms.map((i) => {
    const temp: ComData = { path: i.path, name: '' };
    if ('friendlyName' in i) {
      temp.name = i.friendlyName as string;
    }
    return temp;
  });
  return data;
}
