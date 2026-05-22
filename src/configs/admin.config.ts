import { registerAs } from '@nestjs/config';
import { AdminUserEnvType } from './types';

export default registerAs('admin', (): AdminUserEnvType => ({
  username: process.env.ADMIN_LOGIN || '',
  password: process.env.ADMIN_PASSWORD || '',
}));
