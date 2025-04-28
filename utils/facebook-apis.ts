import axios from "axios";

export const retrieveFaceBookUserId = async (accessToken: string) => {
  const { data } = await axios.get(process.env.FB_DEBUG_TOKEN_URL!, {
    params: {
      input_token: accessToken,
      access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET_ID}`,
    },
  });
  return data;
};

export const retrieveFaceBookUserInfo = async (
  userFaceBookId: string,
  accessToken: string
) => {
  const { data } = await axios.get(
    `${process.env.FB_USER_INFO_URL}/${userFaceBookId}`,
    {
      params: {
        fields: "id,name,email,picture",
        access_token: accessToken,
      },
    }
  );

  return data;
};

export const retrieveFaceBookLongLivedToken = async (accessToken: string) => {
  const { data } = await axios.get(process.env.FB_EXCHANGE_TOKEN_URL!, {
    params: {
      grant_type: "fb_exchange_token",
      client_id: process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET_ID,
      fb_exchange_token: accessToken,
    },
  });
  return data;
};
