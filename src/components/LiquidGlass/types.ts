import {
  type CSSProperties,
  type ReactNode,
  type MouseEvent,
  type Ref,
} from "react";

export const DEFAULT_STYLE: CSSProperties = {};
export const WHITESPACE_REGEX = /\s+/g;

export interface LiquidGlassProps {
  children?: ReactNode;
  as?: "div" | "button" | "a" | "article" | "section" | "span";
  href?: string;
  download?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  className?: string;
  innerClassName?: string;
  style?: CSSProperties;
  interactive?: boolean;
  springScale?: boolean;
  roundedClass?: string;
  magnetic?: boolean;
  tilt?: boolean;
  magneticStrength?: number;
  tiltStrength?: number;
  ripple?: boolean;
  variant?: "flat" | "sunken" | "beveled";
  active?: boolean;
  specularGlow?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type LiquidGlassButtonProps = Omit<
  LiquidGlassProps,
  "as" | "springScale"
>;

export interface LiquidGlassPropsWithRef extends LiquidGlassProps {
  ref?: Ref<HTMLElement | null>;
}
