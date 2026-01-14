import sql from "@/app/api/utils/sql";

// GET - Get single violation by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await sql`
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
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Violation not found' }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error fetching violation:', error);
    return Response.json({ error: 'Failed to fetch violation' }, { status: 500 });
  }
}

// PUT - Update violation
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { reviewed, flagged } = body;

    let updateFields = [];
    let updateValues = [];
    let paramIndex = 1;

    if (reviewed !== undefined) {
      updateFields.push(`reviewed = $${paramIndex}`);
      updateValues.push(reviewed);
      paramIndex++;
    }

    if (flagged !== undefined) {
      updateFields.push(`flagged = $${paramIndex}`);
      updateValues.push(flagged);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const query = `
      UPDATE violations 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await sql(query, updateValues);

    if (result.length === 0) {
      return Response.json({ error: 'Violation not found' }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating violation:', error);
    return Response.json({ error: 'Failed to update violation' }, { status: 500 });
  }
}

// DELETE - Delete violation
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await sql`
      DELETE FROM violations 
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Violation not found' }, { status: 404 });
    }

    return Response.json({ message: 'Violation deleted successfully' });
  } catch (error) {
    console.error('Error deleting violation:', error);
    return Response.json({ error: 'Failed to delete violation' }, { status: 500 });
  }
}