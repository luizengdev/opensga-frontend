export const ADMIN_SIDEBAR_DEFAULT_PX = 256;
export const ADMIN_SIDEBAR_MIN_PX = 224;
export const ADMIN_SIDEBAR_MAX_PX = 420;
export const ADMIN_SIDEBAR_STORAGE_KEY = "opensga.admin-sidebar-width";
export const ADMIN_SIDEBAR_WIDTH_VAR = "--admin-sidebar-width";

export const clampAdminSidebarWidth = (width: number) => {
  return Math.min(ADMIN_SIDEBAR_MAX_PX, Math.max(ADMIN_SIDEBAR_MIN_PX, Math.round(width)));
};
