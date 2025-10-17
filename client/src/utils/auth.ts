// Authentication utility functions

export const AUTH_KEYS = {
  TOKEN: 'token',
  USER_ID: 'userId',
  USERNAME: 'username',
  REMEMBER_ME: 'rememberMe'
};

export const saveAuthData = (token: string, userId: string, username: string, rememberMe: boolean = false) => {
  if (rememberMe) {
    localStorage.setItem(AUTH_KEYS.TOKEN, token);
    localStorage.setItem(AUTH_KEYS.USER_ID, userId);
    localStorage.setItem(AUTH_KEYS.USERNAME, username);
    localStorage.setItem(AUTH_KEYS.REMEMBER_ME, 'true');
  } else {
    sessionStorage.setItem(AUTH_KEYS.TOKEN, token);
    sessionStorage.setItem(AUTH_KEYS.USER_ID, userId);
    sessionStorage.setItem(AUTH_KEYS.USERNAME, username);
  }
};

export const getAuthData = () => {
  const rememberMe = localStorage.getItem(AUTH_KEYS.REMEMBER_ME) === 'true';
  const storage = rememberMe ? localStorage : sessionStorage;
  
  return {
    token: storage.getItem(AUTH_KEYS.TOKEN) || localStorage.getItem(AUTH_KEYS.TOKEN),
    userId: storage.getItem(AUTH_KEYS.USER_ID) || localStorage.getItem(AUTH_KEYS.USER_ID),
    username: storage.getItem(AUTH_KEYS.USERNAME) || localStorage.getItem(AUTH_KEYS.USERNAME),
    rememberMe
  };
};

export const clearAuthData = () => {
  localStorage.removeItem(AUTH_KEYS.TOKEN);
  localStorage.removeItem(AUTH_KEYS.USER_ID);
  localStorage.removeItem(AUTH_KEYS.USERNAME);
  localStorage.removeItem(AUTH_KEYS.REMEMBER_ME);
  sessionStorage.removeItem(AUTH_KEYS.TOKEN);
  sessionStorage.removeItem(AUTH_KEYS.USER_ID);
  sessionStorage.removeItem(AUTH_KEYS.USERNAME);
};

export const isAuthenticated = (): boolean => {
  const { token } = getAuthData();
  return !!token;
};
