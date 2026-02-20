import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Access denied');

    const roleHierarchy: Record<UserRole, number> = {
      SUPER_ADMIN: 4,
      ADMIN: 3,
      EDITOR: 2,
      VIEWER: 1,
    };

    const userLevel = roleHierarchy[user.role as UserRole] ?? 0;
    const hasRole = requiredRoles.some(
      (role) => userLevel >= (roleHierarchy[role] ?? 0),
    );

    if (!hasRole) throw new ForbiddenException(`Requires role: ${requiredRoles.join(' or ')}`);
    return true;
  }
}
