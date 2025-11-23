import { query } from './db';
import { subDays, format, setHours, setMinutes, addMinutes } from 'date-fns';

async function seedMockData() {
  console.log('Starting to seed mock data...');

  const today = new Date();
  const sessionsToCreate = [];

  // Generate data for the last 30 days
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = subDays(today, dayOffset);
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Random number of sessions per day (0-6 sessions)
    const numSessions = Math.floor(Math.random() * 7);
    
    // Array of possible start hours (work hours)
    const possibleHours = [9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20];
    
    for (let i = 0; i < numSessions; i++) {
      // Random session duration: 5 or 10 minutes
      const plannedDuration = Math.random() > 0.5 ? 5 : 10;
      const plannedDurationSeconds = plannedDuration * 60;
      
      // Random start time
      const hour = possibleHours[Math.floor(Math.random() * possibleHours.length)];
      const minute = Math.floor(Math.random() * 12) * 5; // 0, 5, 10, ..., 55
      
      const startTime = setMinutes(setHours(date, hour), minute);
      
      // 80% chance of successful completion
      const isSuccessful = Math.random() > 0.2;
      const status = isSuccessful ? 'successful' : 'unsuccessful';
      
      let actualDurationSeconds: number;
      let endTime: Date;
      
      if (isSuccessful) {
        // Successful sessions: actual duration is close to planned (90-110% of planned)
        const variance = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        actualDurationSeconds = Math.round(plannedDurationSeconds * variance);
        endTime = addMinutes(startTime, actualDurationSeconds / 60);
      } else {
        // Unsuccessful sessions: stopped early (30-80% of planned duration)
        const variance = 0.3 + Math.random() * 0.5; // 0.3 to 0.8
        actualDurationSeconds = Math.round(plannedDurationSeconds * variance);
        endTime = addMinutes(startTime, actualDurationSeconds / 60);
      }
      
      sessionsToCreate.push({
        startTime,
        endTime,
        plannedDurationSeconds,
        actualDurationSeconds,
        status,
        dateString
      });
    }
  }

  console.log(`Creating ${sessionsToCreate.length} mock sessions...`);

  // Insert all sessions
  for (const session of sessionsToCreate) {
    try {
      await query(
        `INSERT INTO sessions (start_time, end_time, duration, actual_duration, status, date, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          session.startTime,
          session.endTime,
          session.plannedDurationSeconds,
          session.actualDurationSeconds,
          session.status,
          session.dateString
        ]
      );
    } catch (error) {
      console.error('Error inserting session:', error);
    }
  }

  console.log('✅ Mock data seeding complete!');
  
  // Display summary
  const statsResult = await query(
    `SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'successful') as successful,
      COUNT(*) FILTER (WHERE status = 'unsuccessful') as unsuccessful,
      ROUND(SUM(actual_duration) / 60.0) as total_minutes
     FROM sessions`
  );
  
  const stats = statsResult.rows[0];
  console.log('\n📊 Database Summary:');
  console.log(`Total sessions: ${stats.total}`);
  console.log(`Successful: ${stats.successful}`);
  console.log(`Unsuccessful: ${stats.unsuccessful}`);
  console.log(`Total focus time: ${stats.total_minutes} minutes`);
  
  process.exit(0);
}

seedMockData().catch(error => {
  console.error('Error seeding data:', error);
  process.exit(1);
});
