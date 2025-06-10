import type { ComponentProps } from 'react';

type InputProps = ComponentProps<'input'>;

const Input = (props: InputProps) => <input {...props} />;

export default Input;