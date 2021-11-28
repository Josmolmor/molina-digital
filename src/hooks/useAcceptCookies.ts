import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

const COOKIE_NAME = 'emails_sent';

const useAcceptCookies = () => {
  const [acceptedCookies, setAcceptedCookies] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    if (!Cookies.get(COOKIE_NAME)) {
      setAcceptedCookies(false);
    }
  }, []);

  const acceptCookies = () => {
    setAcceptedCookies(true);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    Cookies.set(COOKIE_NAME, 'sent', { expires: 1, sameSite: 'Strict' });
  };

  return {
    acceptedCookies,
    onAcceptCookies: acceptCookies,
  };
};

export default useAcceptCookies;
