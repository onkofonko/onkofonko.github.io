/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.jsx' {
  const value: any;
  export default value;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
