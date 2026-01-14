import sql from "@/app/api/utils/sql";

// POST - Control system operations (start/stop detection, camera control)
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, camera_source, session_data } = body;

    switch (action) {
      case 'start_detection':
        // Start a new detection session
        const sessionResult = await sql`
          INSERT INTO detection_sessions (camera_source, status) 
          VALUES (${camera_source || '0'}, 'active')
          RETURNING *
        `;

        // Update system status
        await sql`
          UPDATE system_status 
          SET camera_status = 'connected', 
              system_health = 'good',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = (SELECT id FROM system_status ORDER BY updated_at DESC LIMIT 1)
        `;

        return Response.json({ 
          message: 'Detection started', 
          session: sessionResult[0] 
        });

      case 'stop_detection':
        // End current active session
        await sql`
          UPDATE detection_sessions 
          SET session_end = CURRENT_TIMESTAMP, 
              status = 'stopped',
              total_detections = ${session_data?.total_detections || 0}
          WHERE status = 'active'
        `;

        // Update system status
        await sql`
          UPDATE system_status 
          SET camera_status = 'disconnected', 
              processing_fps = 0.0,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = (SELECT id FROM system_status ORDER BY updated_at DESC LIMIT 1)
        `;

        return Response.json({ message: 'Detection stopped' });

      case 'change_camera':
        // Update camera source in current session and system
        await sql`
          UPDATE detection_sessions 
          SET camera_source = ${camera_source}
          WHERE status = 'active'
        `;

        return Response.json({ 
          message: 'Camera source changed', 
          camera_source 
        });

      case 'system_health_check':
        // Perform system health check
        const healthStatus = session_data?.health || 'good';
        await sql`
          UPDATE system_status 
          SET system_health = ${healthStatus},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = (SELECT id FROM system_status ORDER BY updated_at DESC LIMIT 1)
        `;

        return Response.json({ 
          message: 'Health check completed', 
          status: healthStatus 
        });

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error controlling system:', error);
    return Response.json({ error: 'Failed to control system' }, { status: 500 });
  }
}

// GET - Get current detection session info
export async function GET(request) {
  try {
    const result = await sql`
      SELECT * FROM detection_sessions 
      WHERE status = 'active' 
      ORDER BY session_start DESC 
      LIMIT 1
    `;

    if (result.length === 0) {
      return Response.json({ active_session: null });
    }

    return Response.json({ active_session: result[0] });
  } catch (error) {
    console.error('Error fetching session info:', error);
    return Response.json({ error: 'Failed to fetch session info' }, { status: 500 });
  }
}