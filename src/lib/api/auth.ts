import { NextResponse } from 'next/server';
import { AuthService } from './services/auth-service';

const authService = new AuthService();

export type AuthUser = {
  adminId: string;
  email: string;
  role: string;
  name: string;
};

export async function requireAuth(request: Request): Promise<NextResponse | AuthUser> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { status: false, message: 'Authorization token required' },
      { status: 401 }
    );
  }

  const admin = await authService.verifyToken(token);

  if (!admin) {
    return NextResponse.json(
      { status: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  return { adminId: admin.id, email: admin.email, role: admin.role, name: admin.name };
}

export async function requireRole(
  request: Request,
  allowedRoles: string[]
): Promise<NextResponse | AuthUser> {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  if (!allowedRoles.includes(auth.role)) {
    return NextResponse.json(
      {
        status: false,
        message: 'Akses ditolak: Anda tidak memiliki izin untuk mengakses fitur ini.',
      },
      { status: 403 }
    );
  }

  return auth;
}
