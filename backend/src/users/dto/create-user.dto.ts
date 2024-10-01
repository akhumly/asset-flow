// src/users/dto/create-user.dto.ts

import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  role?: string; // Add this line
}
