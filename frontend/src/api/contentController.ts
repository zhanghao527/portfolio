import request from "@/libs/request";

// ── Profile ──
export async function getProfile() {
  return request<API.BaseResponse<API.ProfileVO>>("/api/profile/get", { method: "GET" });
}

export async function updateProfile(body: API.ProfileUpdateRequest) {
  return request<API.BaseResponse<boolean>>("/api/profile/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}

// ── Project ──
export async function listProjects() {
  return request<API.BaseResponse<API.ProjectVO[]>>("/api/project/list", { method: "GET" });
}

export async function addProject(body: API.ProjectAddRequest) {
  return request<API.BaseResponse<number>>("/api/project/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}

export async function updateProject(body: API.ProjectUpdateRequest) {
  return request<API.BaseResponse<boolean>>("/api/project/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}

export async function deleteProject(body: API.DeleteRequest) {
  return request<API.BaseResponse<boolean>>("/api/project/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}

// ── Tech ──
export async function listTechs() {
  return request<API.BaseResponse<API.TechVO[]>>("/api/tech/list", { method: "GET" });
}

export async function addTech(body: API.TechAddRequest) {
  return request<API.BaseResponse<number>>("/api/tech/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}

export async function updateTech(body: API.TechUpdateRequest) {
  return request<API.BaseResponse<boolean>>("/api/tech/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}

export async function deleteTech(body: API.DeleteRequest) {
  return request<API.BaseResponse<boolean>>("/api/tech/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}

// ── Blog Chapter ──
export async function listBlogChapters() {
  return request<API.BaseResponse<API.BlogChapterVO[]>>("/api/blog-chapter/list", { method: "GET" });
}

export async function addBlogChapter(body: API.BlogChapterAddRequest) {
  return request<API.BaseResponse<number>>("/api/blog-chapter/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}

export async function updateBlogChapter(body: API.BlogChapterUpdateRequest) {
  return request<API.BaseResponse<boolean>>("/api/blog-chapter/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}

export async function deleteBlogChapter(body: API.DeleteRequest) {
  return request<API.BaseResponse<boolean>>("/api/blog-chapter/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}
