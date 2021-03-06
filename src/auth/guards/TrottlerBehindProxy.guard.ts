// throttler-behind-proxy.guard.ts
// 고스락 백엔드 서버는 nginx 뒤에 프록시 형태로 연결되어있기 때문에
// X-Forwarded-For 헤더값을 통해서
// 요청한 사람의 원래 ip 주소를 가져와야합니다.
import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { v4 } from 'uuid';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Request): string {
    if (process.env.NODE_ENV === 'prod') {
      const clientProxyIps = req.headers['x-forwarded-for'];
      if (!clientProxyIps) {
        return v4();
      }
      if (Array.isArray(clientProxyIps)) {
        return clientProxyIps[0];
      } else {
        return clientProxyIps;
      }
    } else {
      return req.ips.length ? req.ips[0] : req.ip; // individualize IP extraction to meet your own needs
    }
  }
}

// app.controller.ts
