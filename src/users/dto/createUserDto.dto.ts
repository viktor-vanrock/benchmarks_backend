import { IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator';
import { Role } from '@/common/enums/role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsStrongPassword()
  password!: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
