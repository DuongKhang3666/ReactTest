export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

export const getUserRole = () => {
  return localStorage.getItem("userRole");
};

export const isAuthenticated = () => {
  return Boolean(getAccessToken());
};

export const hasRole = (role) => {
  return getUserRole() === role;
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userRole");
};