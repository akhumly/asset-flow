import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
      ) {}
      async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
          const { password, ...result } = user;
          return result;
        }
        return null;
      }  
      async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role }; // Add role to payload
        return {
          access_token: this.jwtService.sign(payload),
        };
      }
      async register(data: RegisterDto) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.usersService.create({
          ...data,
          password: hashedPassword,
          role: data.role || 'user', // Default to 'user' if no role provided
        });
        const { password, ...result } = user;
        return result;
      }
      
}


  