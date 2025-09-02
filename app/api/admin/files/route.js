import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// Get all files
export const GET = requireAuth(async (request) => {
  try {
    const client = await clientPromise;
    const db = client.db('awaken');

    const files = await db
      .collection('files')
      .find({})
      .sort({ uploadedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Save file info after Firebase upload
export const POST = requireAuth(async (request) => {
  try {
    const { fileName, fileUrl, fileSize, fileType } = await request.json();

    if (!fileName || !fileUrl) {
      return NextResponse.json(
        { error: 'File name and URL are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('awaken');

    const newFile = {
      fileName,
      fileUrl,
      fileSize: fileSize || 0,
      fileType: fileType || 'unknown',
      uploadedAt: new Date(),
    };

    const result = await db.collection('files').insertOne(newFile);

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...newFile },
    });
  } catch (error) {
    console.error('Save file error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Delete file record
export const DELETE = requireAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('awaken');

    // Get file info before deleting
    const file = await db
      .collection('files')
      .findOne({ _id: new ObjectId(id) });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from MongoDB
    await db.collection('files').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      fileUrl: file.fileUrl, // Return URL for Firebase deletion
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
