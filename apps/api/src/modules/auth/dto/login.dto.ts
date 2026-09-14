import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { LoginRequestDto } from '@lupbi/shared-types';

export class LoginDto implements LoginRequestDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(128, { message: 'Mật khẩu quá dài' })
  password!: string;
}
