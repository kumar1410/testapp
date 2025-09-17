import { Button, ButtonProps } from '@ui-kitten/components';
import React from 'react';

export type AppButtonProps = ButtonProps & {
  children: React.ReactNode;
};

export const AppButton: React.FC<AppButtonProps> = ({ children, ...props }) => (
  <Button {...props}>{children}</Button>
);
