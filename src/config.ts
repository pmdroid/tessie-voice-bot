type Config = {
  userId: string;
  carMap: Record<string, string>;
  allowedUsers: Record<string, string>;
};

// Example configuration for demo purposes
// Would later put this into a database or something
export const config: Config = {
  userId: 'me@example.com',
  carMap: {
    XP7YGCEL9NB031111: 'Tesla Model Y',
    XP7YGCEL9NB031112: 'Tesla Model 3',
    XP7YGCEL9NB031113: 'Tesla Model X',
  },
  allowedUsers: {
    'me@example.com': 'Pascal',
    'kyoto@example.com': 'Kyoto',
  },
};
