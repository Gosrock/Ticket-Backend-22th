import { Request } from 'express';
import { Observable } from 'rxjs';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/common/consts/enum';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private authService: AuthService, private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request, context);
  }

  private async validateRequest(request: Request, context: ExecutionContext) {
    const checkHeader = request.headers.authorization;
    if (!checkHeader) {
      throw new UnauthorizedException('잘못된 헤더 요청');
    }
    if (Array.isArray(checkHeader)) {
      throw new UnauthorizedException('잘못된 헤더 요청');
    }
    const jwtString = checkHeader.split('Bearer ')[1];

    // 커스텀 데코레이터로 만든 롤을 가져옴
    // 클래스와 함수 둘다 가져와야함.
    // override 하는이유 ? admin 이 우선 순위를 가져야 하니깐
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass()
    ]);
    console.log(roles);

    const payload = this.authService.verifyAccessJWT(jwtString);
    const user = await this.authService.findUserById(payload.id);
    if (!user) {
      throw new UnauthorizedException('없는 유저입니다.');
    }
    const newObj: any = request;
    newObj.user = user;

    // 롤기반 체크
    if (!roles) {
      return true;
    }
    if (!roles.length) {
      return true;
    } else {
      console.log(roles);
      if (roles.includes(user.role) === true) {
        return true;
      } else if (user.role === Role.Admin) {
        return true;
      } else {
        throw new UnauthorizedException('권한이 없습니다.');
      }
    }
  }
}

// canActivate(
//   context: ExecutionContext,
// ): boolean | Promise<boolean> | Observable<boolean> {
//   const request = context.switchToHttp().getRequest();

//   const userId = 'user-id'; // JWT를 검증해서 얻은 유저ID라고 가정. request.user 객체에서 얻음.
//   const userRole = this.getUserRole(userId);

//   const roles = this.reflector.get<string[]>('roles', context.getHandler());

//   return roles?.includes(userRole) ?? true;
// }

// const roles = this.reflector.getAllAndMerge<string[]>('roles', [
//   context.getHandler(),
//   context.getClass(),
// ]);
