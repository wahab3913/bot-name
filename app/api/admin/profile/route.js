import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const GET = requireAuth(async (request) => {
  try {
    const client = await clientPromise;
    const db = client.db('awaken');

    // Find admin user by ID from JWT token
    const admin = await db.collection('admins').findOne({
      _id: new ObjectId(request.userId),
    });

    if (!admin) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data without password
    return NextResponse.json({
      success: true,
      user: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
