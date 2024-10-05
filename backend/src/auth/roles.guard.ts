// src/auth/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
  
    const { user } = context.switchToHttp().getRequest();
    console.log('Required Roles:', requiredRoles); // Add this line
    console.log('User in RolesGuard:', user); // Add this line
  
    if (!requiredRoles) {
      return true;
    }
  
    if (!user || !user.role) {
      return false;
    }
  
    return requiredRoles.includes(user.role);
  }
}