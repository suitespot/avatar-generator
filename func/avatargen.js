import Gravatar from '@gravatar/js'

const DEFAULT_AVATAR_SIZE = process.env.DEFAULT_AVATAR_SIZE ? parseInt(process.env.DEFAULT_AVATAR_SIZE) : 200;

export async function main(event) {
  console.log(JSON.stringify(event, null, 2));

  const email = event?.queryStringParameters?.email;
  const md5Hash = event?.queryStringParameters?.md5Hash;
  const d = event?.queryStringParameters?.d ?? '404';
  const size = parseInt(event?.queryStringParameters?.size, 10) || DEFAULT_AVATAR_SIZE;
  console.log('email', email);
  console.log('size', size);

  if (!email && !md5Hash) {
    return {
      statusCode: 400,
      body: `email or md5Hash is required`,
    };
  }


  const userProfilePic = Gravatar({
    email,
    md5Hash,
    size,
    protocol: 'https',
    defaultImage: d,
  });

  return {
    statusCode: 301,
    headers: {
      Location: userProfilePic,
    }
  };
}
