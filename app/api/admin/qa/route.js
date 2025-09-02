import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { AI_CONFIG } from '@/lib/config';

const { PYTHON_API_URL } = AI_CONFIG;

// Helper function to call Python API
async function callPythonAPI(endpoint, data) {
  try {
    const response = await fetch(`${PYTHON_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Python API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Python API call failed:', error);
    throw error;
  }
}

// Get all Q&As for the authenticated admin
export const GET = requireAuth(async (request) => {
  try {
    // Get agent ID from authenticated user
    const agentId = `${request.userId}`;

    const client = await clientPromise;
    const db = client.db('awaken');

    const qas = await db
      .collection('qa')
      .find({ agentId: agentId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: qas,
    });
  } catch (error) {
    console.error('Get Q&A error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Create new Q&A
export const POST = requireAuth(async (request) => {
  try {
    const { question, answer } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    // Get agent ID from authenticated user
    const agentId = `${request.userId}`;

    // First, save to Python API
    const pythonData = {
      agent_id: agentId,
      user_data: [
        {
          question,
          answer,
        },
      ],
    };

    try {
      await callPythonAPI('/create_questions', pythonData);
    } catch (pythonError) {
      console.error('Python API error:', pythonError);
      return NextResponse.json(
        { error: 'Failed to save to AI server' },
        { status: 500 }
      );
    }

    // Then save to local MongoDB
    const client = await clientPromise;
    const db = client.db('awaken');

    const newQA = {
      question,
      answer,
      agentId: agentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('qa').insertOne(newQA);

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...newQA },
    });
  } catch (error) {
    console.error('Create Q&A error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Update Q&A
export const PUT = requireAuth(async (request) => {
  try {
    const { id, answer } = await request.json();

    if (!id || !answer) {
      return NextResponse.json(
        { error: 'ID and answer are required' },
        { status: 400 }
      );
    }

    // Get agent ID from authenticated user
    const agentId = `${request.userId}`;

    const client = await clientPromise;
    const db = client.db('awaken');

    // Get the existing Q&A to get the old question
    const existingQA = await db
      .collection('qa')
      .findOne({ _id: new ObjectId(id) });
    if (!existingQA) {
      return NextResponse.json({ error: 'Q&A not found' }, { status: 404 });
    }

    // Update in Python API
    const pythonData = {
      agent_id: agentId,
      question: existingQA.question, // Original question to find the record
      updated_ans: answer,
    };

    try {
      await callPythonAPI('/update_single_answer', pythonData);
    } catch (pythonError) {
      console.error('Python API error:', pythonError);
      return NextResponse.json(
        { error: 'Failed to update in AI server' },
        { status: 500 }
      );
    }

    // Update in local MongoDB (only answer)
    const result = await db.collection('qa').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          answer,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Q&A updated successfully',
    });
  } catch (error) {
    console.error('Update Q&A error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Delete Q&A
export const DELETE = requireAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('awaken');

    // Get the existing Q&A to get the question for Python API
    const existingQA = await db
      .collection('qa')
      .findOne({ _id: new ObjectId(id) });
    if (!existingQA) {
      return NextResponse.json({ error: 'Q&A not found' }, { status: 404 });
    }

    // Get agent ID from authenticated user
    const agentId = `${request.userId}`;

    // Delete from Python API
    const pythonData = {
      agent_id: agentId,
      question: existingQA.question,
    };

    try {
      await callPythonAPI('/delete_single_question', pythonData);
    } catch (pythonError) {
      console.error('Python API error:', pythonError);
      return NextResponse.json(
        { error: 'Failed to delete from AI server' },
        { status: 500 }
      );
    }

    // Delete from local MongoDB
    const result = await db
      .collection('qa')
      .deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: 'Q&A deleted successfully',
    });
  } catch (error) {
    console.error('Delete Q&A error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
