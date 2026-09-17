import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface GoogleButtonProps {
  onCredential: (credential: string) => void;
  onError: () => void;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  onCredential,
  onError,
}) => {
  return (
    <div className="flex w-full justify-center">
      <GoogleLogin
        onSuccess={({ credential }) => credential && onCredential(credential)}
        onError={onError}
        text="continue_with"
        shape="pill"
        width="340"
      />
    </div>
  );
};

export default GoogleButton;
