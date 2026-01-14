import sql from "@/app/api/utils/sql";

// GET - List all violations with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const reviewed = searchParams.get('reviewed');
    const flagged = searchParams.get('flagged');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (reviewed !== null && reviewed !== undefined) {
      whereConditions.push(`reviewed = $${paramIndex}`);
      params.push(reviewed === 'true');
      paramIndex++;
    }

    if (flagged !== null && flagged !== undefined) {
      whereConditions.push(`flagged = $${paramIndex}`);
      params.push(flagged === 'true');
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`violation_time >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`violation_time <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM violations ${whereClause}`;
    const countResult = await sql(countQuery, params);
    const total = parseInt(countResult[0].total);

    // Get violations
    const query = `
      SELECT 
        id, 
        violation_time, 
        image_path, 
        license_plate_text, 
        license_plate_confidence, 
        detection_confidence, 
        camera_source, 
        reviewed, 
        flagged, 
        created_at 
      FROM violations 
      ${whereClause}
      ORDER BY violation_time DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);
    const violations = await sql(query, params);

    return Response.json({
      violations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching violations:', error);
    return Response.json({ error: 'Failed to fetch violations' }, { status: 500 });
  }
}

// POST - Create new violation
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      image_path, 
      license_plate_text, 
      license_plate_confidence, 
      detection_confidence, 
      camera_source 
    } = body;

    if (!image_path) {
      return Response.json({ error: 'Image path is required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO violations (
        image_path, 
        license_plate_text, 
        license_plate_confidence, 
        detection_confidence, 
        camera_source
      ) VALUES (
        ${image_path}, 
        ${license_plate_text || null}, 
        ${license_plate_confidence || null}, 
        ${detection_confidence || null}, 
        ${camera_source || null}
      ) RETURNING *
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating violation:', error);
    return Response.json({ error: 'Failed to create violation' }, { status: 500 });
  }
}