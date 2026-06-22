import { seedDemoEvents, listEvents, databasePath } from './db.js';

seedDemoEvents();
console.log(`Seed completed. Database: ${databasePath}`);
console.log(`Total events: ${listEvents().length}`);
