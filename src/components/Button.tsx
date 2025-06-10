import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<'button'>;

const Button = ({ children, ...props }: ButtonProps) => (
  <button {...props}>{children}</button>
);

export default Button;