import sql from "@/app/api/utils/sql";

// POST - Create sample violation data for testing
export async function POST(request) {
  try {
    const sampleViolations = [
      {
        image_path: '/violations/2024/violation_001.jpg',
        license_plate_text: 'ABC-123',
        license_plate_confidence: 0.95,
        detection_confidence: 0.87,
        camera_source: '0',
        violation_time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        image_path: '/violations/2024/violation_002.jpg',
        license_plate_text: 'XYZ-789',
        license_plate_confidence: 0.78,
        detection_confidence: 0.92,
        camera_source: '1',
        violation_time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        image_path: '/violations/2024/violation_003.jpg',
        license_plate_text: null,
        license_plate_confidence: null,
        detection_confidence: 0.73,
        camera_source: '0',
        violation_time: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        image_path: '/violations/2024/violation_004.jpg',
        license_plate_text: 'DEF-456',
        license_plate_confidence: 0.89,
        detection_confidence: 0.81,
        camera_source: '1',
        violation_time: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        reviewed: true,
      },
      {
        image_path: '/violations/2024/violation_005.jpg',
        license_plate_text: 'GHI-101',
        license_plate_confidence: 0.83,
        detection_confidence: 0.76,
        camera_source: '0',
        violation_time: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        flagged: true,
      },
    ];

    const insertedViolations = [];
    
    for (const violation of sampleViolations) {
      const result = await sql`
        INSERT INTO violations (
          image_path, 
          license_plate_text, 
          license_plate_confidence, 
          detection_confidence, 
          camera_source,
          violation_time,
          reviewed,
          flagged
        ) VALUES (
          ${violation.image_path}, 
          ${violation.license_plate_text}, 
          ${violation.license_plate_confidence}, 
          ${violation.detection_confidence}, 
          ${violation.camera_source},
          ${violation.violation_time},
          ${violation.reviewed || false},
          ${violation.flagged || false}
        ) RETURNING *
      `;
      insertedViolations.push(result[0]);
    }

    // Update system status with detection count
    await sql`
      UPDATE system_status 
      SET detection_count = ${insertedViolations.length},
          last_detection = ${sampleViolations[0].violation_time},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM system_status ORDER BY updated_at DESC LIMIT 1)
    `;

    return Response.json({ 
      message: 'Sample violations created successfully',
      count: insertedViolations.length,
      violations: insertedViolations
    });
  } catch (error) {
    console.error('Error creating sample violations:', error);
    return Response.json({ error: 'Failed to create sample violations' }, { status: 500 });
  }
}