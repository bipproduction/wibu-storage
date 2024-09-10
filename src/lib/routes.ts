export const pages = {"/": "/", "/user": "/user", "/user/dir": "/user/dir", "/user/dir/[id]": ({id}:{id: string}) => `/user/dir/${id}`, "/docs": "/docs", "/auth/signup": "/auth/signup", "/auth/signout": "/auth/signout", "/auth/signin": "/auth/signin"};
export const apis = {"/api/user": "/api/user", "/api/upload-multiple": "/api/upload-multiple", "/api/upload": "/api/upload", "/api/signup": "/api/signup", "/api/signout": "/api/signout", "/api/signin": "/api/signin", "/api/files/[id]": ({id}:{id: string}) => `/api/files/${id}`, "/api/files/[id]/rename": ({id}:{id: string}) => `/api/files/${id}/rename`, "/api/files/[id]/delete": ({id}:{id: string}) => `/api/files/${id}/delete`, "/api/dir/[id]/search/[q]": ({id, q}:{id: string, q: string}) => `/api/dir/${id}/search/${q}`, "/api/dir/[id]/rename": ({id}:{id: string}) => `/api/dir/${id}/rename`, "/api/dir/[id]/list": ({id}:{id: string}) => `/api/dir/${id}/list`, "/api/dir/[id]/find": ({id}:{id: string}) => `/api/dir/${id}/find`, "/api/dir/[id]/delete": ({id}:{id: string}) => `/api/dir/${id}/delete`, "/api/dir/[id]/create": ({id}:{id: string}) => `/api/dir/${id}/create`, "/api/apikey/list": "/api/apikey/list", "/api/apikey/find": "/api/apikey/find", "/api/apikey/create": "/api/apikey/create", "/api/apikey/[id]/rename": ({id}:{id: string}) => `/api/apikey/${id}/rename`, "/api/apikey/[id]/activate": ({id}:{id: string}) => `/api/apikey/${id}/activate`};