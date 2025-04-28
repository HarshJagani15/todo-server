import axios from "axios";

export const retrieveGitHubAccessToken = async (
  tokenGenerationCode: string
) => {
  const { data } = await axios.post(
    "https://github.com/login/oauth/access_token",
    null,
    {
      params: {
        client_id: process.env.GITHUB_APP_ID,
        client_secret: process.env.GITHUB_APP_SECRET_ID,
        code: tokenGenerationCode,
        redirect_uri: "http://localhost:3000/auth/github/callback",
      },
      headers: {
        Accept: "application/json",
      },
    }
  );
  const accessToken = data.access_token;
  return accessToken;
};

export const retrieveGitHubUserInfo = async (accessToken: string) => {
  const { data: user } = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return user;
};

export const retrieveGitHubUserEmail = async (accessToken: string) => {
  const { data: emails } = await axios.get(
    "https://api.github.com/user/emails",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const primaryEmail = emails.find((email: any) => email.primary)?.email;

  return primaryEmail;
};
