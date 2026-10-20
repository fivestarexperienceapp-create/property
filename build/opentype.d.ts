// Minimal typing for the parts of opentype.js used to render social-preview text.
declare module 'opentype.js' {
  export interface Path {
    toPathData(decimalPlaces?: number): string;
  }
  export interface Font {
    getPath(text: string, x: number, y: number, fontSize: number): Path;
    getAdvanceWidth(text: string, fontSize: number): number;
  }
  const opentype: { parse(buffer: ArrayBuffer): Font };
  export default opentype;
}
