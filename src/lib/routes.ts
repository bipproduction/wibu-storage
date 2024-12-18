export const pages = {
  "/": "/",
  "/user": "/user",
  "/user/dir": "/user/dir",
  "/user/dir/[id]": ({ id }: { id: string }) => `/user/dir/${id}`,
  "/docs": "/docs",
  "/auth/signup": "/auth/signup",
  "/auth/signout": "/auth/signout",
  "/auth/signin": "/auth/signin",
  "/auth/reset-password/[code]": ({ code }: { code: string }) =>
    `/auth/reset-password/${code}`,
  "/auth/forgot-password": "/auth/forgot-password",
};

export const apies = {
  "/api/user": "/api/user",
  "/api/upload-multiple": "/api/upload-multiple",
  "/api/upload": "/api/upload",
  "/api/signup": "/api/signup",
  "/api/signout": "/api/signout",
  "/api/signin": "/api/signin",
  "/api/reset-password": "/api/reset-password",
  "/api/forgot-password": "/api/forgot-password",
  "/api/files/view/[dirId]/[name]": ({
    dirId,
    name,
  }: {
    dirId: string;
    name: string;
  }) => `/api/files/view/${dirId}/${name}`,
  "/api/files/delete/[dirId]/[name]": ({
    dirId,
    name,
  }: {
    dirId: string;
    name: string;
  }) => `/api/files/delete/${dirId}/${name}`,
  "/api/files/copy/[from]/[to]": ({ from, to }: { from: string; to: string }) =>
    `/api/files/copy/${from}/${to}`,
  "/api/files/[id]": ({ id }: { id: string }) => `/api/files/${id}`,
  "/api/files/[id]/rename": ({ id }: { id: string }) =>
    `/api/files/${id}/rename`,
  "/api/files/[id]/delete": ({ id }: { id: string }) =>
    `/api/files/${id}/delete`,
  "/api/dir/[id]/tree": ({ id }: { id: string }) => `/api/dir/${id}/tree`,
  "/api/dir/[id]/search/[q]": ({ id, q }: { id: string; q: string }) =>
    `/api/dir/${id}/search/${q}`,
  "/api/dir/[id]/rename": ({ id }: { id: string }) => `/api/dir/${id}/rename`,
  "/api/dir/[id]/list": ({ id }: { id: string }) => `/api/dir/${id}/list`,
  "/api/dir/[id]/find/file/[name]": ({
    id,
    name,
  }: {
    id: string;
    name: string;
  }) => `/api/dir/${id}/find/file/${name}`,
  "/api/dir/[id]/find/dir": ({ id }: { id: string }) =>
    `/api/dir/${id}/find/dir`,
  "/api/dir/[id]/delete": ({ id }: { id: string }) => `/api/dir/${id}/delete`,
  "/api/dir/[id]/create": ({ id }: { id: string }) => `/api/dir/${id}/create`,
  "/api/apikey/list": "/api/apikey/list",
  "/api/apikey/find": "/api/apikey/find",
  "/api/apikey/create": "/api/apikey/create",
  "/api/apikey/[id]/rename": ({ id }: { id: string }) =>
    `/api/apikey/${id}/rename`,
  "/api/apikey/[id]/activate": ({ id }: { id: string }) =>
    `/api/apikey/${id}/activate`,
};
