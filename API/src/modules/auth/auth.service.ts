import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthTokenResponse {
  accessToken: string;
  user: Omit<User, 'passwordHash'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokenResponse> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      role: dto.role,
    });

    return this.buildTokenResponse(user);
  }

  login(user: User): AuthTokenResponse {
    return this.buildTokenResponse(user);
  }

  async getMe(userId: string): Promise<User> {
    return this.usersService.findById(userId);
  }

  async validateGoogleUser(googleUser: {
    googleId: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
  }): Promise<User> {
    const user = await this.usersService.findByEmail(googleUser.email);

    const tokenExpiresAt = new Date(Date.now() + googleUser.expiresIn * 1000);

    const googleFields = {
      googleId: googleUser.googleId,
      googleAccessToken: googleUser.accessToken,
      ...(googleUser.refreshToken && {
        googleRefreshToken: googleUser.refreshToken,
      }),
      googleTokenExpiresAt: tokenExpiresAt,
      avatarUrl: googleUser.avatarUrl,
    };

    if (user) {
      // Update existing user with Google info
      return this.usersService.updateGoogleInfo(user.id, googleFields);
    } else {
      // Create new user
      return this.usersService.create({
        email: googleUser.email,
        fullName: googleUser.fullName,
        passwordHash: 'GOOGLE_OAUTH', // Dummy password
        ...googleFields,
      });
    }
  }

  private buildTokenResponse(user: User): AuthTokenResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _pw, ...safeUser } = user;

    return {
      accessToken: this.jwtService.sign(payload),
      user: safeUser as Omit<User, 'passwordHash'>,
    };
  }
}
