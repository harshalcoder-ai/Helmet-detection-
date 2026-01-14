import sql from "@/app/api/utils/sql";

// GET - Get current system status
export async function GET(request) {
  try {
    const result = await sql`
      SELECT 
        processing_fps, 
        detection_count, 
        last_detection, 
        camera_status, 
        system_health, 
        updated_at 
      FROM system_status 
      ORDER BY updated_at DESC 
      LIMIT 1
    `;

    if (result.length === 0) {
      // Create initial status if none exists
      const newStatus = await sql`
        INSERT INTO system_status (processing_fps, detection_count, camera_status, system_health) 
        VALUES (0.0, 0, 'disconnected', 'good')
        RETURNING *
      `;
      return Response.json(newStatus[0]);
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error fetching system status:', error);
    return Response.json({ error: 'Failed to fetch system status' }, { status: 500 });
  }
}

// POST - Update system status
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      processing_fps, 
      detection_count, 
      last_detection, 
      camera_status, 
      system_health 
    } = body;

    // Get current status first
    const currentStatus = await sql`
      SELECT * FROM system_status ORDER BY updated_at DESC LIMIT 1
    `;

    let updateFields = [];
    let updateValues = [];
    let paramIndex = 1;

    if (processing_fps !== undefined) {
      updateFields.push(`processing_fps = $${paramIndex}`);
      updateValues.push(processing_fps);
      paramIndex++;
    }

    if (detection_count !== undefined) {
      updateFields.push(`detection_count = $${paramIndex}`);
      updateValues.push(detection_count);
      paramIndex++;
    }

    if (last_detection !== undefined) {
      updateFields.push(`last_detection = $${paramIndex}`);
      updateValues.push(last_detection);
      paramIndex++;
    }

    if (camera_status !== undefined) {
      updateFields.push(`camera_status = $${paramIndex}`);
      updateValues.push(camera_status);
      paramIndex++;
    }

    if (system_health !== undefined) {
      updateFields.push(`system_health = $${paramIndex}`);
      updateValues.push(system_health);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    let result;
    if (currentStatus.length === 0) {
      // Insert new status if none exists
      result = await sql`
        INSERT INTO system_status (
          processing_fps, 
          detection_count, 
          last_detection, 
          camera_status, 
          system_health
        ) VALUES (
          ${processing_fps || 0.0}, 
          ${detection_count || 0}, 
          ${last_detection || null}, 
          ${camera_status || 'disconnected'}, 
          ${system_health || 'good'}
        ) RETURNING *
      `;
    } else {
      // Update existing status
      const query = `
        UPDATE system_status 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      updateValues.push(currentStatus[0].id);
      result = await sql(query, updateValues);
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating system status:', error);
    return Response.json({ error: 'Failed to update system status' }, { status: 500 });
  }
}