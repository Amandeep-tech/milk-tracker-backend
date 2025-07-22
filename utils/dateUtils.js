/**
 * Why do we convert between Epoch and MySQL Timestamps?
 * 
 * 1. Data Storage Efficiency:
 *    - MySQL TIMESTAMP is stored in a compact binary format (4 bytes)
 *    - Enables efficient indexing and date-based queries
 *    - Takes less space compared to storing epoch numbers
 * 
 * 2. Database Operations:
 *    - MySQL has built-in date/time functions that work with TIMESTAMP
 *    - Enables efficient date range queries, e.g., BETWEEN, >, <
 *    - Allows using MySQL date functions like DATE_ADD, DATE_SUB
 * 
 * 3. Time Zone Handling:
 *    - MySQL TIMESTAMP automatically handles timezone conversions
 *    - Stored in UTC internally by MySQL
 *    - Converted to server's timezone when retrieved
 * 
 * 4. Data Validation:
 *    - MySQL validates TIMESTAMP format (invalid dates are rejected)
 *    - Prevents storing incorrect date values
 * 
 * 5. Frontend Compatibility:
 *    - JavaScript works natively with epoch timestamps
 *    - Mobile apps commonly use epoch format
 *    - Converting to epoch in API responses makes it universal
 * 
 * 6. Query Performance:
 *    - Indexed TIMESTAMP columns are optimized for date-based searches
 *    - Better performance for date range queries
 *    - Faster sorting operations
 */

/**
 * Converts epoch timestamp (in milliseconds) to MySQL timestamp
 * @param {number} epoch - Epoch timestamp in milliseconds
 * @returns {string} MySQL timestamp string
 */
const epochToMySQLTimestamp = (epoch) => {
    // Convert milliseconds to seconds if needed
    const epochInSeconds = epoch.toString().length === 13 ? Math.floor(epoch / 1000) : epoch;
    return new Date(epochInSeconds * 1000).toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Converts MySQL timestamp to epoch (in milliseconds)
 * @param {string} mysqlTimestamp - MySQL timestamp string
 * @returns {number} Epoch timestamp in milliseconds
 */
const mysqlTimestampToEpoch = (mysqlTimestamp) => {
    return new Date(mysqlTimestamp).getTime();
};

module.exports = {
    epochToMySQLTimestamp,
    mysqlTimestampToEpoch
}; 