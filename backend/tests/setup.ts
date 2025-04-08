import { TestDataSource } from '../src/config/test-database';
import { DatabaseContext } from '../src/config/database-context';

beforeAll(async () => {
  // Initialize the test database connection before all tests
  await TestDataSource.initialize();
  // Set the test database instance
  DatabaseContext.setTestInstance(TestDataSource);
});

afterAll(async () => {
  // Close the test database connection after all tests
  if (TestDataSource.isInitialized) {
    await TestDataSource.destroy();
  }
}); 