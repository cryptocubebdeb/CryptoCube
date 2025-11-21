declare module 'next/image' {
  import * as React from 'react';
  type ImageProps = any;
  const Image: React.FC<ImageProps>;
  export default Image;
}

declare module 'next/font/google' {
  export function Geologica(options?: any): { className?: string };
  export function defaultImport(name?: string): any;
}

declare module 'next/font/local' {
  export function local(options?: any): { className?: string };
}
