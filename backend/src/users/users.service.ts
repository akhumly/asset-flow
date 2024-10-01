// src/users/users.service.ts

import { Injectable, NotFoundException, ConflictException  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Create a new user
  async create(data: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      if (error.code === 'P2002') {
        // Prisma error code for unique constraint violation
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  // Get all users
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  // Get a single user by ID
  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  return user;
}

//Find a user by email
async findByEmail(email: string): Promise<User | undefined> {
  return this.prisma.user.findUnique({ where: { email } });
}
}

