export const getToken = () => localStorage.getItem("artixpos_admin_token");
export const setToken = (t: string) => localStorage.setItem("artixpos_admin_token", t);
export const clearToken = () => localStorage.removeItem("artixpos_admin_token");