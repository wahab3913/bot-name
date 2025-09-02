import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { adminStorage } from '@/lib/firebase-admin';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Upload file using Firebase Admin SDK
export const POST = requireAuth(async (request) => {
  try {
    console.log('Upload request received, userId:', request.userId);

    const formData = await request.formData();
    const file = formData.get('file');

    console.log('File details:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
    });

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'File type not allowed. Only PDF, DOC, DOCX, TXT, and MD files are supported.',
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const originalName = file.name;
    const fileName = `${timestamp}_${originalName}`;
    const filePath = `uploads/${fileName}`;

    console.log('Converting file to buffer...');
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('Buffer created, size:', buffer.length);

    console.log('Initializing Firebase Storage...');
    // Upload to Firebase Storage using Admin SDK
    const bucket = adminStorage.bucket();
    console.log('Bucket name:', bucket.name);
    console.log('Expected bucket: ai-language-tutor-55977.appspot.com');

    const fileUpload = bucket.file(filePath);
    console.log('File path:', filePath);

    console.log('Uploading file to Firebase Storage...');
    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: originalName,
          uploadedBy: request.userId,
          uploadedAt: new Date().toISOString(),
        },
      },
    });
    console.log('File uploaded successfully');

    console.log('Generating signed URL...');
    // Generate a signed URL for secure access
    const [downloadURL] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
    });
    console.log(
      'Signed URL generated:',
      downloadURL?.substring(0, 100) + '...'
    );

    console.log('Saving to MongoDB...');
    // Save file metadata to MongoDB
    const client = await clientPromise;
    const db = client.db('awaken');

    const fileData = {
      fileName: originalName,
      fileUrl: downloadURL,
      filePath: filePath, // Store the actual Firebase Storage path
      fileSize: file.size,
      fileType: file.type,
      uploadedBy: request.userId,
      uploadedAt: new Date(),
    };

    const result = await db.collection('files').insertOne(fileData);
    console.log('File metadata saved to MongoDB:', result.insertedId);

    // Send to Python API for embeddings creation
    console.log('Sending to Python API for embeddings...');
    try {
      const pythonApiResponse = await fetch(
        'https://awaken-ai.sparkixtech.com/create_embeddings',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agent_id: `${request.userId}`, // Use admin user ID as agent ID
            files: [
              {
                fileName: originalName,
                downloadURL: downloadURL,
              },
            ],
          }),
        }
      );

      const pythonApiData = await pythonApiResponse.json();
      console.log('Python API response:', pythonApiData);

      if (!pythonApiResponse.ok) {
        console.error('Python API failed:', pythonApiData);
        // Don't fail the upload if Python API fails, just log the error
      }
    } catch (pythonApiError) {
      console.error('Error calling Python API:', pythonApiError);
      // Don't fail the upload if Python API fails, just log the error
    }

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...fileData },
    });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error.message,
      },
      { status: 500 }
    );
  }
});

// Delete file from Firebase Storage and MongoDB
export const DELETE = requireAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    console.log('Delete request received for file ID:', fileId);

    // Get file metadata from MongoDB first
    const client = await clientPromise;
    const db = client.db('awaken');

    const file = await db.collection('files').findOne({
      _id: new ObjectId(fileId),
      uploadedBy: request.userId, // Ensure user can only delete their own files
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    console.log('File found in database:', file.fileName);

    // Use stored file path from database (preferred) or construct it as fallback
    let filePath = file.filePath;

    // Fallback for older files that don't have filePath stored
    if (!filePath) {
      const uploadDate = new Date(file.uploadedAt);
      const timestamp = uploadDate.getTime();
      filePath = `uploads/${timestamp}_${file.fileName}`;
      console.log('Using fallback filePath for older file:', filePath);
    }

    console.log('Attempting to delete from Firebase Storage:', filePath);

    // Delete from Firebase Storage
    try {
      const bucket = adminStorage.bucket();
      console.log('Firebase bucket name:', bucket.name);

      const fileRef = bucket.file(filePath);
      console.log('Checking if file exists at path:', filePath);

      const [exists] = await fileRef.exists();
      console.log('File exists in Firebase Storage:', exists);

      if (exists) {
        await fileRef.delete();
        console.log('✅ File successfully deleted from Firebase Storage');
      } else {
        console.log('⚠️ File not found in Firebase Storage at path:', filePath);

        // Try alternative path formats for debugging
        const alternativePaths = [
          filePath.replace('uploads/', ''),
          `${filePath}`,
          filePath.replace(/^uploads\//, 'uploads/'),
        ];

        for (const altPath of alternativePaths) {
          const [altExists] = await bucket.file(altPath).exists();
          console.log(`Checking alternative path ${altPath}: ${altExists}`);
          if (altExists) {
            await bucket.file(altPath).delete();
            console.log(`✅ File deleted from alternative path: ${altPath}`);
            break;
          }
        }
      }
    } catch (firebaseError) {
      console.error('❌ Error deleting from Firebase Storage:', firebaseError);
      console.error('Error details:', {
        message: firebaseError.message,
        code: firebaseError.code,
        filePath: filePath,
      });
      // Continue with database deletion even if Firebase deletion fails
    }

    // Delete from MongoDB
    const deleteResult = await db.collection('files').deleteOne({
      _id: new ObjectId(fileId),
      uploadedBy: request.userId,
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'File not found in database' },
        { status: 404 }
      );
    }

    console.log('File deleted from MongoDB');

    // Delete from Python API embeddings
    console.log('Deleting from Python API embeddings...');
    try {
      const pythonApiResponse = await fetch(
        'https://awaken-ai.sparkixtech.com/delete_single_document',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.fileName,
            agent_id: `${request.userId}`, // Use admin user ID as agent ID
          }),
        }
      );

      const pythonApiData = await pythonApiResponse.json();
      console.log('Python API delete response:', pythonApiData);

      if (!pythonApiResponse.ok) {
        console.error('Python API delete failed:', pythonApiData);
        // Don't fail the deletion if Python API fails, just log the error
      }
    } catch (pythonApiError) {
      console.error('Error calling Python API for deletion:', pythonApiError);
      // Don't fail the deletion if Python API fails, just log the error
    }

    return NextResponse.json({
      success: true,
      message:
        'File deleted successfully from Firebase, database, and embeddings',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete file',
        details: error.message,
      },
      { status: 500 }
    );
  }
});
