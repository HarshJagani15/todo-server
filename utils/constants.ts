export const DEFAULT_EXCEPTION = {
  BAD_REQUEST: "Bad Request",
  UNAUTHORIZED: "Unauthorized",
  UNAUTHORIZED_CODE: "INVALID_AUTH_TOKEN",
  FORBIDDEN: "Unauthorized",
  NOT_FOUND: "Not Found",
  CONFLICT: "Conflict",
  INTERNAL_SERVER: "Internal Server Error!",
};

export const AUTH = {
  LOGIN: {
    EMAIL: "Successfully logged in with Email",
    GITHUB: "Successfully logged in with GitHub",
    FACEBOOK: "Successfully logged in with FaceBook",
  },
  REGISTER: {
    EMAIL: "Successfully registered with Email",
    GITHUB: "Successfully registered with GitHub",
    FACEBOOK: "Successfully registered with FaceBook",
  },
  TOKEN: {
    REFRESH: "Token Refreshed Successfully",
  },
};

export const AUTH_EXCEPTION = {
  UNAUTHORIZED: {
    FACEBOOK_TOKEN: "Facebook access token is invalid or expired.",
    GITHUB_TOKEN: "Github access token is invalid or expired.",
    AUTH_TOKEN: "Access token is invalid or expired.",
    AUTH_TOKEN_CODE: "AUTH_TOKEN_EXPIRED",
    CREDENTIALS: "Invalid credentials",
  },
  CONFLICT: {
    EMAIL:
      "Email address you're trying to use is already associated with an existing account",
  },
  NOTFOUND: {
    TOKEN: "Access Denied! No token provided.",
    EMAIL: "Email address you're using is not associated with any account",
  },
  INTERNAL_SERVER: {
    FAILED_TO_RETRIVE_GITHUB_TOKEN: "Failed to retrieve GitHub access-token",
  },
};

export const PANEL = {
  FETCHED: "Panels fetched successfully",
  ADD: "Panel added successfully",
  UPDATE_NAME: "Panel name updated successfully",
  DELETE: "Panel deleted successfully",
};

export const TODO = {
  ADD: "Todo added successfully",
  UPDATE_HEADING: "Todo heading edited successfully",
  UPDATE_DESCRIPTION: "Todo description edited successfully",
  DELETE: "Todo deleted successfully",
};

export const TODO_COMMENT = {
  ADD: "Comment added successfully",
  UPDATE: "Comment edited successfully",
  DELETE: "Comment deleted successfully",
};

export const TODO_EXCEPTION = {
  CONFLICT: {
    HEADING: "Heading is same as previous one",
    DESCRIPTION: "Description is same as previous one",
  },
};

export const USER_PROFILE = {
  FETCHED: "User profile fetched successfully",
  UPDATE_NAME: "Username updated successfully",
  UPDATE_PICTURE: "Profile picture uploaded successfully",
};

export const USER_PROFILE_EXCEPTION = {
  BADREQUEST: {
    FILE_UPLOAD: "No file uploaded!",
  },
};
