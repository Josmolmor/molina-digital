import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Custom404() {
  const { replace } = useRouter();

  useEffect(() => {
    void replace('/');
  }, [replace]);

  return null;
}
