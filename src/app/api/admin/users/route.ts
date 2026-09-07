import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';

import { requireRole } from '@/lib/api/auth';
import prisma from '@/lib/api/db';

const VALID_ROLES = ['superadmin', 'admin', 'fungsio'];

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['superadmin']);
  if (auth instanceof NextResponse) return auth;

  try {
    const users = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({
      status: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { status: false, message: 'Gagal mengambil data pengguna', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['superadmin']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { status: false, message: 'Semua field (nama, email, password, role) wajib diisi' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedRole = role.trim().toLowerCase();

    if (!VALID_ROLES.includes(trimmedRole)) {
      return NextResponse.json(
        {
          status: false,
          message: `Role tidak valid. Pilihan role: ${VALID_ROLES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { status: false, message: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.admin.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { status: false, message: 'Email sudah terdaftar. Silakan gunakan email lain.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.admin.create({
      data: {
        name: name.trim(),
        email: trimmedEmail,
        password: hashedPassword,
        role: trimmedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        status: true,
        message: 'Pengguna berhasil ditambahkan',
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { status: false, message: 'Gagal menambahkan pengguna', error: String(error) },
      { status: 500 }
    );
  }
}
