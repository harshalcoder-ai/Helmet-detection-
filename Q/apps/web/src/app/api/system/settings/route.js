import sql from "@/app/api/utils/sql";

// GET - Get all system settings
export async function GET(request) {
  try {
    const result = await sql`
      SELECT setting_key, setting_value, updated_at 
      FROM system_settings 
      ORDER BY setting_key
    `;

    // Convert to object format for easier frontend use
    const settings = {};
    result.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    return Response.json(settings);
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return Response.json({ error: 'Failed to fetch system settings' }, { status: 500 });
  }
}

// POST - Update system settings
export async function POST(request) {
  try {
    const body = await request.json();

    // Start a transaction to update multiple settings
    const updates = [];
    for (const [key, value] of Object.entries(body)) {
      updates.push(sql`
        INSERT INTO system_settings (setting_key, setting_value) 
        VALUES (${key}, ${value})
        ON CONFLICT (setting_key) 
        DO UPDATE SET 
          setting_value = EXCLUDED.setting_value,
          updated_at = CURRENT_TIMESTAMP
      `);
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No settings to update' }, { status: 400 });
    }

    await sql.transaction(updates);

    // Return updated settings
    const result = await sql`
      SELECT setting_key, setting_value, updated_at 
      FROM system_settings 
      ORDER BY setting_key
    `;

    const settings = {};
    result.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    return Response.json(settings);
  } catch (error) {
    console.error('Error updating system settings:', error);
    return Response.json({ error: 'Failed to update system settings' }, { status: 500 });
  }
}