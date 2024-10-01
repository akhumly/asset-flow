// src/auth/dto/register.dto.ts

import { IsEmail, IsString, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  role?: string; // Add this line
}
